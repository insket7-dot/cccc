import {
    Component,
    OnInit,
    signal,
    inject,
    computed,
    AfterViewInit,
    OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { MenuData, menuListItem } from '@app/shared/types/menu.shared.types';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { ModelStateService } from '@app/shared/services/data/model-state.service';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { AppMenuService } from '@app/shared/services/data/app.menu.service';
import { DetailsComponent } from './components/details/details';
import { AppVoiceService } from '@app/shared/services/plugin/app.voice.service';
import { LanguageService } from '@app/core/services/language.service';
import { fromEvent, Subscription, throttleTime } from 'rxjs';
import { CategoryOperation, MenuType } from '@app/shared/constants/menu.constants';
import { I18nFieldPipe, PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart';
import { CartDetailsBottomSheetComponent } from './components/cart-details-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MenuFacadeService } from '@app/shared/services/ui/menu-facade.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatChipsModule,
        TranslateModule,
        LanguageSelectorComponent,
        DetailsComponent,
        I18nFieldPipe,
        PriceI18nPipe,
        ShoppingCartComponent,
    ],
    templateUrl: './menu.html',
    styleUrl: './menu.scss',
})
export class Menu extends AbstractAppPage implements OnInit, AfterViewInit, OnDestroy {
    private readonly modelStateService = inject(ModelStateService);
    private appMenuService = inject(AppMenuService);
    // 菜品数据
    protected readonly categoryList = computed(() => this.appMenuService.categoryListValue());
    protected readonly currentCategoryValue = computed(() =>
        this.menuFacadeService.currentCategoryValue(),
    );
    protected readonly currentMenuValue = computed(() => this.menuFacadeService.currentMenuValue());
    protected readonly menuComputed = computed(() => this.menuFacadeService.menuValue());

    protected readonly items = signal<MenuData[]>([]);

    // details数据
    readonly showDetails = signal<boolean>(false);
    detailProductId: string | null = null;

    cartVisible: boolean = false; // 购物车是否可见

    private scrollSub?: Subscription;

    MenuType = MenuType;
    CategoryOperation = CategoryOperation;

    constructor(
        private voiceService: AppVoiceService,
        private languageService: LanguageService,
        private bottomSheet: MatBottomSheet,
        private readonly menuFacadeService: MenuFacadeService,
    ) {
        super();
    }

    ngAfterViewInit() {
        const rightBlock = document.querySelector('.right_block');
        if (!rightBlock) return;
        this.scrollSub = fromEvent(rightBlock, 'scroll')
            .pipe(throttleTime(300)) // 节流避免频繁触发
            .subscribe(() => {
                const titles = rightBlock.querySelectorAll<HTMLParagraphElement>('.title');
                const scrollTop = rightBlock.scrollTop;
                let currentId = '';
                titles.forEach((title) => {
                    const offset = title.offsetTop;
                    if (scrollTop >= offset - 20) {
                        // 20px 偏移可调整
                        currentId = title.id.replace('category-', '');
                    }
                });
                if (currentId && !this.menuFacadeService.scrollSyncLockedValue()) {
                    this.menuFacadeService.setCurrentCategory(currentId); // 左侧高亮
                    this.leftScroll(currentId);
                }
            });
    }

    ngOnDestroy() {
        this.scrollSub?.unsubscribe();
    }

    isAccessibility = computed(() => this.modelStateService.isAccessibility());
    isNormal = computed(() => this.modelStateService.isNormal());

    async ngOnInit(): Promise<void> {
        // 初始化 - 兜底
        if (this.categoryList().length === 0) {
            this.appMenuService.init().catch((err) => console.error('获取菜单失败:', err));
        }
    }

    toggleModel(model: string) {
        this.modelStateService.setCurModel(model);
    }

    // 选择分类
    chooseCategory(item: any) {
        const textKey = this.languageService.getCurrentLanguageKey('categoryName');
        const voiceText = item[textKey];
        this.voiceService.speak(voiceText).catch((err) => console.error('语音播放失败:', err));
        this.menuFacadeService.setCurrentCategoryByClick(item.categoryId);

        this.leftScroll(item.categoryId);
        this.scrollToCategory(item.categoryId);
    }

    /**
     * @desc 左侧滚动
     */
    private leftScroll(categoryId: string) {
        const leftCate = document.querySelector('.left_cate');
        const leftItem = leftCate?.querySelector(`.cate_item[data-id="${categoryId}"]`);

        if (!leftCate || !leftItem) return;

        const containerRect = leftCate.getBoundingClientRect();
        const itemRect = leftItem.getBoundingClientRect();

        const itemOffsetTop = itemRect.top - containerRect.top + leftCate.scrollTop;

        const scrollTarget = itemOffsetTop - containerRect.height / 2 + itemRect.height / 2;

        leftCate.scrollTo({
            top: scrollTarget,
            behavior: 'smooth',
        });
    }

    // 滚动到指定分类
    private scrollToCategory(categoryId: string): void {
        requestAnimationFrame(() => {
            const targetElement = document.getElementById(`category-${categoryId}`);
            const rightBlock = document.querySelector('.right_block');

            if (!targetElement || !rightBlock) return;

            // const offset = this.isAccessibility() ? 300 : 20;
            const rect = targetElement.getBoundingClientRect();
            const containerRect = rightBlock.getBoundingClientRect();
            rightBlock.scrollTo({
                top: rect.top - containerRect.top + rightBlock.scrollTop,
                behavior: 'smooth',
            });
        });
    }
    // 切换分类
    changeCurCategory(type: CategoryOperation) {
        this.menuFacadeService.categoryUpDown(type);

        this.scrollToCategory(this.currentCategoryValue());
        this.leftScroll(this.currentCategoryValue());
    }

    // 打开详情页
    openDetail(item: menuListItem) {
        this.detailProductId = item.productId;
        this.showDetails.set(true);
    }

    closeDetail() {
        this.showDetails.set(false);
        this.detailProductId = null;
    }

    // 打开购物车
    openCart() {
        const bottomSheetRef = this.bottomSheet.open(CartDetailsBottomSheetComponent, {
            panelClass: 'cart-details-sheet',
            disableClose: false,
        });

        bottomSheetRef.afterDismissed().subscribe((result) => {});
    }
}
