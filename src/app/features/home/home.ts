import { Component, signal, OnInit, inject, OnDestroy, computed } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { HomeService } from './services/home.service';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { MenuConstantsItem, MenuData, MenuModel } from '@app/shared/types/menu.shared.types';
import { HomeUi } from './types/home.types';
import { ResultVO } from '@rydeen/angular-framework';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { ModelStateService } from '@app/shared/services/model-state.service';
import { modeList, wayList } from '@app/shared/constants/menu.constants';

@Component({
    selector: 'app-home',
    imports: [
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
export class Home extends AbstractAppPage implements OnInit, OnDestroy {
    protected readonly HomeUi = HomeUi;
    protected readonly searchQuery = signal<string>('');
    protected readonly processLog = signal<string | null>(null);
    protected readonly searchLog = signal<string | null>(null);
    protected readonly searchItems = signal<MenuData[]>([]);

    private readonly modelStateService = inject(ModelStateService);
    // 点餐模式
    wayList = signal<MenuConstantsItem[]>(wayList);
    // 普通、儿童模式
    modelList = signal<MenuConstantsItem[]>(modeList);

    curModel = computed(() => this.modelStateService.curModelValue());
    curWay = computed(() => this.modelStateService.curWayValue());

    private clickCount = 0; // 点击次数

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

    ngOnDestroy() {
        this.clickCount = 0;
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

    toggleWay(way: any) {
        this.modelStateService.setCurWay(way.type);
    }

    toggleModel(model: any) {
        this.modelStateService.setCurModel(model.type);
    }

    startOrder() {
        if (!this.curWay) {
            this.error(this.translate.instant('page.selectWay')).catch((error) =>
                console.error(error),
            );
            return;
        } else {
            this.router.navigate(['/menu']).catch((error) => console.error(error));
        }
    }

    onLogoClick() {
        this.clickCount++;
        // 点击6次后重置计数并导航到登录页
        if (this.clickCount >= 6) {
            this.clickCount = 0;
            this.router
                .navigate(['/login'], { queryParams: { state: 'RESET' } })
                .catch((error) => console.error(error));
        }
    }
}
