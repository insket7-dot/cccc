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
import { ModelStateService } from '@app/shared/services/model-state.service';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { DetailsComponent } from './components/details/details';
import { AppVoiceService } from '@app/shared/services/app.voice.service';
import { LanguageService } from '@app/core/services/language.service';
import { fromEvent, Subscription, throttleTime } from 'rxjs';
import { CategoryOperation, MenuType } from '@app/shared/constants/menu.constants';
import { I18nFieldPipe, PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';

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
        DetailsComponent,
        I18nFieldPipe,
        PriceI18nPipe,
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
        this.appMenuService.currentCategoryValue(),
    );
    protected readonly currentMenuValue = computed(() => this.appMenuService.currentMenuValue());
    protected readonly menuComputed = computed(() => this.appMenuService.menuValue());

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
    ) {
        super();
    }

    ngAfterViewInit() {
        const rightBlock = document.querySelector('.right_block');
        if (!rightBlock) return;

        this.scrollSub = fromEvent(rightBlock, 'scroll')
            .pipe(throttleTime(100)) // 节流避免频繁触发
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
                if (currentId) {
                    this.appMenuService.setCurrentCategory(currentId); // 左侧高亮
                    // 可选：让左侧滚动到可视区域
                    const leftCate = document.querySelector('.left_cate');
                    const leftItem = leftCate?.querySelector(`.cate_item[data-id="${currentId}"]`);
                    if (leftItem) {
                        leftItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
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
        console.log('voice Text:', voiceText);
        this.voiceService.speak(voiceText).catch((err) => console.error('语音播放失败:', err));

        this.appMenuService.setCurrentCategory(item.categoryId);

        this.scrollToCategory(item.categoryId);
    }

    // 滚动到指定分类
    private scrollToCategory(categoryId: string): void {
        const target = document.getElementById('category-' + categoryId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    // 切换分类
    changeCurCategory(type: CategoryOperation) {
        this.appMenuService.categoryUpDown(type);

        this.scrollToCategory(this.currentCategoryValue());
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
        this.cartVisible = true;
    }
}
