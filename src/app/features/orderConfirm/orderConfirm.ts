import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { OrderConfirmService } from './services/orderConfirm.service';
import { Location } from '@angular/common';
import { AddTipsComponent } from './components/add-tips.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AppStoreService } from '@/app/shared/services/app.store.service';
import { CartService } from '@app/shared/services/cart.service';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { PriceI18nPipe,I18nFieldPipe } from '@app/shared/pipes/i18n-field.pipe';
import { AppUrlService } from '@app/shared/services/app.url.service';
import { ModelStateService } from '@app/shared/services/model-state.service';
<<<<<<< HEAD
import {  ProductType } from '@app/shared/constants/menu.constants';


=======
import { SerialNumberService } from '@app/shared/services/serial-number.service';
>>>>>>> 620428cd4863ec7ce9f5926a3a98084977184c94

@Component({
    selector: 'app-orderConfirm',
    templateUrl: './orderConfirm.html',
    styleUrls: ['./orderConfirm.scss'],
    imports: [TranslateModule, CommonModule, PriceI18nPipe,I18nFieldPipe],
})
export class OrderConfirm extends AbstractAppPage {
    constructor(
        private orderConfirmService: OrderConfirmService,
        private location: Location,
        private bottomSheet: MatBottomSheet,
        private appStoreService: AppStoreService,
        private cartService: CartService,
        private appMenuService: AppMenuService,
        private readonly appUrlService: AppUrlService,
        private readonly modelStateService: ModelStateService,
        private readonly serialNumberService: SerialNumberService,
    ) {
        super();
    }
     protected readonly ProductType = ProductType;

    storeBaseInfo = computed(() => this.appStoreService.storeBaseInfoValue());

    // 购物车列表UI数据
    cartList = computed(() => {
        return this.appMenuService.cartListValue();
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
    orderConfirm() {
        this.confirm('app.order.confirmPlaceOrder', {}, async (res) => {
            if (res.role === 'ok') {
<<<<<<< HEAD
                 this.router
                            .navigate([this.appUrlService.getPageUrlValue('PAGE_ORDER_SUBMIT')])
=======
                this.orderConfirmService.orderConfirmRequest().then((res) => {
                    if (res.success) {
                        // 清空购物车
                        this.cartService.clearCart();
                        // 清空选择状态
                        this.modelStateService.clearUserSelectState();
                        // 流水号增加
                        this.serialNumberService.generateNextSerialNumber().catch(console.error);
                        this.router
                            .navigate([this.appUrlService.getPageUrlValue('PAGE_HOME')])
>>>>>>> 620428cd4863ec7ce9f5926a3a98084977184c94
                            .catch(console.error);
                // this.orderConfirmService.orderConfirmRequest().then((res) => {
                //     if (res.success) {
                //         // 清空购物车
                //         this.cartService.clearCart();
                //         // 清空选择状态
                //         this.modelStateService.clearUserSelectState();
                //         this.router
                //             .navigate([this.appUrlService.getPageUrlValue('PAGE_HOME')])
                //             .catch(console.error);
                //     }
                // });
            }
            return true;
        }).catch(console.error);
    }
}
