import { Component, Input, Output, EventEmitter, inject, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { I18nFieldPipe } from '@app/shared/pipes/i18n-field.pipe';
import { ProductType } from '@app/shared/constants/menu.constants';
import { SingleItem } from '@app/features/menu/components/single-item/single-item';
import { ComboItem } from '@app/features/menu/components/combo-item/combo-item';
import { CartService } from '@app/shared/services/cart.service';
import { ShopCartProduct } from '@app/shared/types/cart.shared.types';

@Component({
    selector: 'app-details',
    standalone: true,
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss',

    imports: [CommonModule, TranslateModule, I18nFieldPipe, SingleItem, ComboItem],
})
export class detailsComponent extends AbstractAppPage {
    appMenuService = inject(AppMenuService);
    @Input() id: string | null = '';
    @Output() onClose = new EventEmitter<void>();

    constructor(private cartService: CartService) {
        super();
    }
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
        return this.item()?.price;
    });

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
            const data = productRef?.getSelection();
            const payload: ShopCartProduct = {
                cartId: '',
                productType: this.item()?.productType ?? '',
                productId: this.item()?.productId ?? '',
                quantity: 1,
            };
            // 单品数据组装
            if (this.item()?.productType === ProductType.PRODUCT) {
                payload.skuId = data?.skuId ?? '';
                payload.grillList = data?.grillList ?? [];
                // 单品唯一ID设计： productType + productId + skuId + (n * (grillId + n * productId))
                const gillKey = (data?.grillList ?? [])
                    .sort((a, b) => a.grillId.localeCompare(b.grillId))
                    .map((g) => `${g.grillId}${g?.itemList.map((t) => t.productId).join('-')}`)
                    .join('-');
                const keyList = [payload.productType, payload.productId, payload.skuId, gillKey];
                payload.cartId = keyList.filter(Boolean).join('-');
            }

            console.log('add cart', payload);

            // 套餐数据组装
            if (this.item()?.productType === ProductType.COMBO) {
            }

            await this.cartService.addToCart(payload);
            this.close();
        }
    }

    close() {
        this.onClose.emit();
    }
}
