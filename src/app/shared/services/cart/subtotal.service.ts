import { Injectable } from '@angular/core';
import { PriceService } from '@app/shared/services/util/price.service';
import { CartTaxTypes, ShopCartProduct } from '@app/shared/types/cart.shared.types';
import { ProductType } from '@app/shared/constants/menu.constants';
import { AppMenuService } from '@app/shared/services/data/app.menu.service';
import { TaxCategoryEnum } from '@app/shared/constants/tax.enums';
import { AppStoreService } from '@app/shared/services/data/app.store.service';

@Injectable({ providedIn: 'root' })
export class SubtotalService {
    constructor(
        private readonly priceService: PriceService,
        private readonly appMenuService: AppMenuService,
        private readonly appStoreService: AppStoreService,
    ) {}

    /**
     * @desc 菜品小计计算
     */
    subtotalComputed(item: ShopCartProduct) {
        let subtotal = this.priceService.init(item.price ?? 0);

        // 单品价格
        if (item.productType === ProductType.PRODUCT) {
            // 规格
            subtotal = this.priceService.add(subtotal, item.skuPrice ?? 0);

            // 加料
            if (item.grillList?.length) {
                const grillTotal = item.grillList.reduce((sum, g) => {
                    const groupTotal = (g.itemList ?? []).reduce((s, i) => {
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
            if (item.rounds?.length) {
                const roundTotal = item.rounds.reduce((sum, r) => {
                    const groupTotal = (r.itemList ?? []).reduce((s, i) => {
                        return this.priceService.add(
                            s,
                            this.priceService.mul(i.price ?? 0, i.quantity ?? 1),
                        );
                    }, this.priceService.zero());

                    return this.priceService.add(sum, groupTotal);
                }, this.priceService.zero());

                subtotal = this.priceService.add(subtotal, roundTotal);
            }
        }

        const qty = item.quantity ?? 1;

        // ---------- 税种处理 菜品和门店税率不一致时，不计算 ----------
        const targetTax = this.appStoreService.isTaxGroupSame(item.taxGroupCode ?? '')
            ? this.appMenuService.getTaxGroupByCode(item.taxGroupCode ?? '')
            : undefined;

        // 按单价（单件）计算，再乘以 qty。也可以先乘 qty 再算，取决于你的四舍五入策略。
        let internalTaxSingle = this.priceService.zero();
        let externalTaxSingle = this.priceService.zero();
        let priceExclInternalSingle = subtotal;

        if (
            targetTax &&
            targetTax.taxCategory === TaxCategoryEnum.INCLUSIVE &&
            targetTax.taxValue
        ) {
            // 内含税：从 subtotal 中剥离税额
            const taxRate = this.priceService.toPercentage(targetTax.taxValue);
            internalTaxSingle = this.priceService
                .mul(subtotal, taxRate)
                .div(this.priceService.add(1, taxRate));
            priceExclInternalSingle = this.priceService.sub(subtotal, internalTaxSingle);
        } else if (
            targetTax &&
            targetTax.taxCategory === TaxCategoryEnum.EXCLUSIVE &&
            targetTax.taxValue
        ) {
            // 外含税：需要额外计算
            externalTaxSingle = this.priceService.mul(
                subtotal,
                this.priceService.toPercentage(targetTax.taxValue),
            );
        }

        // 按 quantity 计算行级金额（并在这里做四舍五入到分）
        const displaySubtotal = this.priceService.mul(subtotal, qty); // 菜单上显示的合计（含内含税）
        const internalTax = this.priceService.mul(internalTaxSingle, qty);
        const externalTax = this.priceService.mul(externalTaxSingle, qty);
        const priceExcludingInternalTax = this.priceService.mul(priceExclInternalSingle, qty);

        // lineTotal: 顾客应付该菜目小计（注意：内含税已包含在 displaySubtotal；外含税需加上）
        const lineTotal = this.priceService.add(displaySubtotal, externalTax);

        const data: CartTaxTypes = {
            displaySubtotal: this.priceService.toNumber(displaySubtotal),
            priceExcludingInternalTax: this.priceService.toNumber(priceExcludingInternalTax),
            internalTax: this.priceService.toNumber(internalTax),
            externalTax: this.priceService.toNumber(externalTax),
            subtotal: this.priceService.toNumber(lineTotal),
            taxType: targetTax?.taxType,
            taxRate: targetTax?.taxValue,
        };
        console.log('subtotal', data);
        return data;
    }
}
