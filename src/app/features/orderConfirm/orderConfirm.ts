import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AddTipsComponent } from './components/add-tips.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AppStoreService } from '@app/shared/services/data/app.store.service';
import { CartService } from '@app/shared/services/cart/cart.service';
import { PriceI18nPipe, I18nFieldPipe } from '@app/shared/pipes/i18n-field.pipe';
import { AppUrlService } from '@app/shared/services/util/app.url.service';
import { ProductType } from '@app/shared/constants/menu.constants';
import { SerialNumberService } from '@app/shared/services/order/serial-number.service';
import { MenuFacadeService } from '@app/shared/services/ui/menu-facade.service';
import { OrderConfirmService } from './services/orderConfirm.service';
import { OrderShareService } from '@app/shared/services/order/order.share.service';

@Component({
    selector: 'app-orderConfirm',
    templateUrl: './orderConfirm.html',
    styleUrls: ['./orderConfirm.scss'],
    imports: [TranslateModule, CommonModule, PriceI18nPipe, I18nFieldPipe],
})
export class OrderConfirm extends AbstractAppPage {
    constructor(
        private location: Location,
        private bottomSheet: MatBottomSheet,
        private appStoreService: AppStoreService,
        private cartService: CartService,
        private menuFacadeService: MenuFacadeService,
        private readonly appUrlService: AppUrlService,
        private readonly serialNumberService: SerialNumberService,
        private orderConfirmService: OrderConfirmService,
        private orderShareService: OrderShareService,
    ) {
        super();
    }
    protected readonly ProductType = ProductType;

    storeBaseInfo = computed(() => this.appStoreService.storeBaseInfoValue());

    // 购物车列表UI数据
    cartList = computed(() => {
        return this.menuFacadeService.cartListValue();
    });

    // 总价
    cartTotalPrice = computed(() => {
        return this.cartService.cartTotal().total;
    });
    // 总数量
    cartTotalCount = computed(() => {
        return this.cartService.cartTotal().count;
    });

    addTip() {
        const bottomSheetRef = this.bottomSheet.open(AddTipsComponent, {
            data: [],
            panelClass: 'cart-details-sheet',
            disableClose: false,
        });

        bottomSheetRef.afterDismissed().subscribe((result) => {
            console.log('bottomSheetRef.afterDismissed:', result);
        });
    }

    back() {
        this.location.back();
    }

    /**
     * @desc 订单确认
     */
    async orderConfirm() {
        this.confirm('app.order.confirmPlaceOrder', {}, async (res) => {
            if (res.role === 'ok') {
                this.serialNumberService.generateNextSerialNumber().catch(console.error);
                const res = await this.orderConfirmService.orderConfirmRequest();
                if (res.success) {
                    // 订单提交成功后，更新订单信息
                    this.orderShareService.updateOrderSuccessInfo(res.data);
                    this.router
                        .navigate([this.appUrlService.getPageUrlValue('PAGE_ORDER_SUBMIT')])
                        .catch(console.error);
                }
            }
            return true;
        }).catch(console.error);
    }
}
