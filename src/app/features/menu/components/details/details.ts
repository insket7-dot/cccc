import {
    Component,
    Input,
    Output,
    EventEmitter,
    inject,
    computed,
    ViewChild,
    signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { I18nFieldPipe, PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';
import { ProductLimit, ProductType } from '@app/shared/constants/menu.constants';
import { SingleItem } from '@app/features/menu/components/single-item/single-item';
import { ComboItem } from '@app/features/menu/components/combo-item/combo-item';
import { CartService } from '@app/shared/services/cart.service';
import { CartExtra } from '@app/shared/types/cart.shared.types';
import { DetailsService } from '@app/features/menu/components/details/details.service';

@Component({
    selector: 'menu-details-component',
    standalone: true,
    templateUrl: './details.html',
    styleUrl: './details.scss',

    imports: [
        CommonModule,
        TranslateModule,
        I18nFieldPipe,
        SingleItem,
        ComboItem,
        PriceI18nPipe,
        NgOptimizedImage,
    ],
})
export class DetailsComponent extends AbstractAppPage {
    appMenuService = inject(AppMenuService);
    @Input() id: string | null = '';
    @Output() onClose = new EventEmitter<void>();

    constructor(
        private cartService: CartService,
        private detailsService: DetailsService,
    ) {
        super();
    }
    // 加购数量
    addQuantity = signal(1);
    // 用户选择的缓存
    selected = signal<CartExtra>({});
    protected readonly ProductType = ProductType;
    // 单品ref
    @ViewChild('singleItemRef') singleItemRef?: SingleItem;
    // 套餐ref
    @ViewChild('comboItemRef') comboItemRef?: ComboItem;

    // 菜品详情数据
    item = computed(() => {
        const menuMap = this.appMenuService.menuIdMapValue();
        return this.id ? menuMap.get(this.id) : null;
    });

    totalPrice = computed(() => {
        if (!this.item()) return 0;
        return this.detailsService.detailSubtotal({
            item: this.item()!,
            data: this.selected(),
            addQuantity: this.addQuantity(),
        });
    });

    selectedChange(value: CartExtra) {
        this.selected.set(value);
    }

    /**
     * @desc 添加购物车
     */
    async addToCart() {
        const productRef =
            this.item()?.productType === ProductType.PRODUCT
                ? this.singleItemRef
                : this.comboItemRef;
        const valid = productRef?.validate();
        if (valid) {
            await this.cartService.addToCart(
                this.detailsService.buildCartProduct({
                    item: this.item()!,
                    data: this.selected(),
                    addQuantity: this.addQuantity(),
                }),
            );
            this.close();
        }
    }

    increaseQuantity() {
        this.addQuantity.update((n) =>
            n + 1 > ProductLimit.LIMIT_MAX ? ProductLimit.LIMIT_MAX : n + 1,
        );
    }
    decreaseQuantity() {
        this.addQuantity.update((n) => (n > ProductLimit.LIMIT ? n - 1 : ProductLimit.LIMIT));
    }

    close() {
        this.onClose.emit();
    }
}
