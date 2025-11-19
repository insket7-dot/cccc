import { Injectable } from '@angular/core';
import { menuListItem } from '@app/shared/types/menu.shared.types';
import { CartExtra, ShopCartProduct } from '@app/shared/types/cart.shared.types';
import { ProductType } from '@app/shared/constants/menu.constants';
import { SubtotalService } from '@app/shared/services/cart/subtotal.service';

export interface BuildCartData {
    item: menuListItem;
    data: CartExtra;
    addQuantity: number;
}

@Injectable({ providedIn: 'root' })
export class DetailsService {
    constructor(private subtotalService: SubtotalService) {}
    // 组装购物车报文
    buildCartProduct({ item, data, addQuantity }: BuildCartData) {
        const payload: ShopCartProduct = {
            cartId: '',
            productType: item?.productType ?? '',
            productId: item?.productId ?? '',
            quantity: addQuantity ?? 1,
            price: item?.price ?? 0,
            taxGroupCode: item?.taxGroupCode,
        };
        // 单品数据组装
        if (item?.productType === ProductType.PRODUCT) {
            payload.skuId = data?.skuId ?? '';
            payload.skuPrice = data?.skuPrice ?? 0;
            payload.grillList = data?.grillList ?? [];
            // 单品唯一ID设计： productType + productId + skuId + (n * (grillId + n * productId))
            const gillKey = (data?.grillList ?? [])
                .sort((a, b) => a.grillId.localeCompare(b.grillId))
                .map((g) => `${g.grillId}${g?.itemList.map((t) => t.productId).join('-')}`)
                .join('-');
            const keyList = [payload.productType, payload.productId, payload.skuId, gillKey];
            payload.cartId = keyList.filter(Boolean).join('-');
        }

        // 套餐数据组装
        if (item?.productType === ProductType.COMBO) {
            payload.rounds = data?.rounds ?? [];
            // 组合唯一ID设计： productType + productId + (n * (roundId + n * skuId))
            const roundKey = (data?.rounds ?? [])
                .sort((a, b) => a.roundId - b.roundId)
                .map((r) => `${r.roundId}${r?.itemList.map((t) => t.skuId).join('-')}`)
                .join('-');
            const keyList = [payload.productType, payload.productId, roundKey];
            payload.cartId = keyList.filter(Boolean).join('-');
        }

        return payload;
    }

    detailSubtotal(data: BuildCartData): number {
        return this.subtotalService.subtotalComputed(this.buildCartProduct(data)).subtotal ?? 0;
    }
}
