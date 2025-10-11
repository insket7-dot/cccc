import { Component, signal, OnInit, inject } from '@angular/core';
// import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HomeService } from './services/home.service';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { MenuData, MenuModel } from '../../shared/types/menu.shared.types';
import { HomeUi } from './types/home.types';
import { ResultVO } from '@rydeen/angular-framework';
import { MenuItemInterFace } from './constants/home.constants';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';

import { ModelStateService } from '@app/core/services/model-state.service';

@Component({
    selector: 'app-home',
    imports: [
        // MatButton,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatListModule,
        MatChipsModule,
        MatCardModule,
        TranslateModule,
        LanguageSelectorComponent,
    ],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home extends AbstractAppPage implements OnInit {
    protected readonly HomeUi = HomeUi;
    protected readonly searchQuery = signal<string>('');
    protected readonly processLog = signal<string | null>(null);
    protected readonly searchLog = signal<string | null>(null);
    protected readonly searchItems = signal<MenuData[]>([]);

    private readonly translateService = inject(TranslateService);
    private readonly modelStateService = inject(ModelStateService);
    wayList = signal<MenuItemInterFace[]>([
        {
            type: '1',
            name: 'page.way1',
        },
        {
            type: '2',
            name: 'page.way2',
        },
    ]);

    modelList = signal<MenuItemInterFace[]>([
        {
            type: 'Normal',
            name: 'page.model1',
            icon: '1',
        },
        {
            type: 'Accessibility',
            name: 'page.model2',
            icon: '1',
        },
    ]);

    isEnglish = false;
    get curModel() {
        return this.modelStateService.curModel();
    }

    constructor(private readonly homeService: HomeService) {
        super();
    }

    ngOnInit(): void {
        // 统一事件注册：由模板的 data-id + onClick/onChange/onSubmit 触发
        this.registerHandler(HomeUi.syncMenu, () => this.onMenuProcess());
        this.registerHandler(HomeUi.searchBtn, () => this.onMenuSearch());
        // 输入框回车或变更后触发搜索
        this.registerHandler(HomeUi.searchInput, () => this.onMenuSearch());
    }

    async onMenuProcess(): Promise<void> {
        try {
            this.processLog.set(this.translate.instant('app.home.messages.syncing'));
            const menuModels: ResultVO<MenuModel[]> = await this.homeService.syncAndCacheMenus();
            if (!menuModels.success) {
                await this.error(menuModels.msg);
                return;
            }
            let count = menuModels.data.length;
            const successMsg = this.translate.instant('app.home.messages.syncSuccess', { count });
            this.processLog.set(successMsg);
            await this.success(successMsg);
        } catch (e: any) {
            const errorMsg = this.translate.instant('app.home.messages.syncFailed', {
                error: e.message,
            });
            this.processLog.set(errorMsg);
            await this.error(e.message);
        }
    }

    async onMenuSearch(): Promise<void> {
        try {
            const keyword = (this.searchQuery() || '').trim();
            const items = await this.homeService.searchMenus(keyword);
            this.searchItems.set(items);
            const searchMsg = this.translate.instant('app.home.messages.searchComplete', {
                keyword: keyword || this.translate.instant('app.common.noData'),
                count: items.length,
            });
            this.searchLog.set(searchMsg);
        } catch (e: any) {
            const errorMsg = this.translate.instant('app.home.messages.searchFailed', {
                error: e.message,
            });
            this.searchLog.set(errorMsg);
            await this.error(e.message);
        }
    }

    toggleModel(model: any) {
        this.modelStateService.setCurModel(model.type);
    }

    startOrder() {
        this.router.navigate(['/menu']);
    }
}
