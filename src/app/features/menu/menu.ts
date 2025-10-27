import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { MenuData } from '@app/shared/types/menu.shared.types';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { ModelStateService } from '@app/core/services/model-state.service';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { detailsComponent } from './components/details/details.component';

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
        detailsComponent,
    ],
    templateUrl: './menu.html',
    styleUrl: './menu.scss',
})
export class Menu extends AbstractAppPage implements OnInit {
    protected readonly items = signal<MenuData[]>([]);
    // 菜品数据
    protected readonly categoryList = signal<any>([]);
    protected readonly menuMapList = signal<any>([]);
    protected readonly currentCategoryValue = signal<any>('');
    protected readonly currentMenuValue = signal<any>('');

    private readonly modelStateService = inject(ModelStateService);

    // details数据
    protected readonly showDetails = signal<boolean>(false);
    protected readonly currentItem = signal<any>(null);

    constructor(private appMenuService: AppMenuService) {
        super();

        effect(() => {
            this.categoryList.set(this.appMenuService.categoryListValue());
            this.menuMapList.set(this.appMenuService.menuMapValue());
            this.currentCategoryValue.set(this.appMenuService.currentCategoryValue());
            this.currentMenuValue.set(this.appMenuService.currentMenuValue());
            console.log('[ this.this.menuMapList()() ] >', this.menuMapList());
            console.log('[ this.this.categoryList()() ] >', this.categoryList());

            if (this.categoryList().length > 0 && !this.currentCategoryValue()) {
                this.appMenuService.setCurrentCategory(this.categoryList()[0].categoryId);
            }
        });
    }

    // 模式
    get curModel() {
        return this.modelStateService.curModel();
    }
    async ngOnInit(): Promise<void> {
        this.appMenuService.init().catch((err) => console.error('获取菜单失败:', err));
    }

    toggleModel(model: string) {
        this.modelStateService.setCurModel(model);
    }

    // 选择分类
    chooseCategory(item: any) {
        this.appMenuService.setCurrentCategory(item.categoryId);

        this.scrollToCategory(item.categoryId);
    }

    // 获取分类名称
    getCategoryName(key: any) {
        return this.categoryList().find((item: any) => item.categoryId === key)?.categoryNameCn;
    }

    // 滚动到指定分类
    private scrollToCategory(categoryId: string): void {
        requestAnimationFrame(() => {
            const targetElement = document.getElementById(`category-${categoryId}`);
            const rightBlock = document.querySelector('.right_block');

            if (!targetElement || !rightBlock) return;

            const offset = this.curModel === 'Accessibility' ? 300 : 20;
            rightBlock.scrollTo({
                top: targetElement.offsetTop - offset,
                behavior: 'smooth',
            });
        });
    }
    // 切换分类
    changeCurCategory(type: string) {
        const categories = this.categoryList();
        if (!categories.length) return;

        const currentIndex = categories.findIndex(
            (item: any) => item.categoryId === this.currentCategoryValue(),
        );
        const total = categories.length;
        let newIndex: number;

        if (type === 'up') {
            newIndex = currentIndex === 0 ? total - 1 : currentIndex - 1;
        } else {
            newIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
        }

        const newCategory = categories[newIndex];
        this.appMenuService.setCurrentCategory(newCategory.categoryId);

        this.scrollToCategory(newCategory.categoryId);
    }

    addCart(type: any, item: any) {
        console.log(
            '%c [ type ]-120',
            'font-size:13px; background:#dfb5dc; color:#fff9ff;',
            type,
            item,
        );

        this.currentItem.set(item);
        this.showDetails.set(true);
    }
}
