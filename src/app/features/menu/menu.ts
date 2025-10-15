import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { MenuService } from './services/menu.service';
import { MenuData } from '../../shared/types/menu.shared.types';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { ModelStateService } from '@app/core/services/model-state.service';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AppMenuService } from '@app/shared/services/app.menu.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatChipsModule,
        TranslateModule,
        LanguageSelectorComponent,
        ShoppingCartComponent,
    ],
    templateUrl: './menu.html',
    styleUrl: './menu.scss',
})
export class Menu extends AbstractAppPage implements OnInit {
    protected readonly items = signal<MenuData[]>([]);

    private readonly modelStateService = inject(ModelStateService);

    constructor(private readonly menuService: MenuService, private appMenuService: AppMenuService) {
        super();
        this.appMenuService.init();
        const currentCategory = this.appMenuService.currentCategoryValue();
        const currentMenu = this.appMenuService.currentMenuValue();
    }

    get curModel() {
        return this.modelStateService.curModel();
    }
    async ngOnInit(): Promise<void> {
        try {
            const menus = await this.menuService.getAllMenus();
            this.items.set(menus);
        } catch (err) {
            this.items.set([]);
            console.error('[Menu]', this.translate.instant('app.system.database.loadFailed'), err);
        }
    }

    toggleModel(model: string) {
        this.modelStateService.setCurModel(model);
    }
}
