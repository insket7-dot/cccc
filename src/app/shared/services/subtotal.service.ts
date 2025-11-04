import { Injectable } from '@angular/core';
import { PriceService } from '@app/shared/services/price.service';
import { ShopCartProduct } from '@app/shared/types/cart.shared.types';
import { ProductType } from '@app/shared/constants/menu.constants';

@Injectable({ providedIn: 'root' })
export class SubtotalService {
    constructor(private priceService: PriceService) {}

    subtotalComputed(item: Partial<ShopCartProduct>) {
        let subtotal = this.priceService.zero();
        // 单品价格
        if (item.productType === ProductType.PRODUCT) {
            // 规格
            subtotal = this.priceService.add(subtotal, item.skuPrice ?? 0);

            // 加料
            if (item.grillList?.length) {
                const grillTotal = item.grillList.reduce((sum, g) => {
                    const list = g.itemList ?? [];
                    const groupTotal = list.reduce((s, i) => {
                        return this.priceService.add(
                            s,
                            this.priceService.mul(i.price ?? 0, i.quantity ?? 1),
                        );
                    }, this.priceService.zero());

                    return this.priceService.add(sum, groupTotal);
                }, this.priceService.zero());

                subtotal = this.priceService.add(subtotal, grillTotal);
            }
        }
        // 套餐价格
        if (item.productType === ProductType.COMBO) {
        }

        return this.priceService.toNumber(this.priceService.mul(subtotal, item.quantity));
    }
}
