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
import { MenuData } from '@app/shared/types/menu.shared.types';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { ModelStateService } from '@app/core/services/model-state.service';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { detailsComponent } from './components/details/details.component';
import { AppVoiceService } from '@app/shared/services/app.voice.service';
import { LanguageService } from '@app/core/services/language.service';
import { fromEvent, Subscription, throttleTime } from 'rxjs';

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
export class Menu extends AbstractAppPage implements OnInit, AfterViewInit, OnDestroy {
    private appMenuService = inject(AppMenuService);
    // 菜品数据
    protected readonly categoryList = computed(() => this.appMenuService.categoryListValue());
    protected readonly currentCategoryValue = computed(() =>
        this.appMenuService.currentCategoryValue(),
    );
    protected readonly currentMenuValue = computed(() => this.appMenuService.currentMenuValue());
    protected readonly menuComputed = computed(() => this.appMenuService.menuValue());

    protected readonly items = signal<MenuData[]>([]);

    private readonly modelStateService = inject(ModelStateService);

    // details数据
    protected readonly showDetails = signal<boolean>(false);
    protected readonly currentItem = signal<any>(null);

    private scrollSub?: Subscription;

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
        const textKey = this.languageService.getCurrentLanguageKey('categoryName');
        const voiceText = item[textKey];
        console.log('voice Text:', voiceText);
        this.voiceService.speak(voiceText).catch((err) => console.error('语音播放失败:', err));

        this.appMenuService.setCurrentCategory(item.categoryId);

        this.scrollToCategory(item.categoryId);
    }

    // 获取分类名称
    getCategoryName(key: any) {
        return this.categoryList().find((item: any) => item.categoryId === key)?.categoryNameCn;
    }

    // 滚动到指定分类
    private scrollToCategory(categoryId: string): void {
        // 找右侧对应标题
        const target = document.getElementById('category-' + categoryId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // requestAnimationFrame(() => {
        //     const targetElement = document.getElementById(`category-${categoryId}`);
        //     const rightBlock = document.querySelector('.right_block');
        //
        //     if (!targetElement || !rightBlock) return;
        //
        //     const offset = this.curModel === 'Accessibility' ? 300 : 20;
        //     rightBlock.scrollTo({
        //         top: targetElement.offsetTop - offset,
        //         behavior: 'smooth',
        //     });
        // });
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
