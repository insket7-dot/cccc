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
import { PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';
import { AppUrlService } from '@app/shared/services/app.url.service';
import { ModelStateService } from '@app/shared/services/model-state.service';

@Component({
    selector: 'app-orderConfirm',
    templateUrl: './orderConfirm.html',
    styleUrls: ['./orderConfirm.scss'],
    imports: [TranslateModule, CommonModule, PriceI18nPipe],
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
    ) {
        super();
    }

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
                this.orderConfirmService.orderConfirmRequest().then((res) => {
                    if (res.success) {
                        // 清空购物车
                        this.cartService.clearCart();
                        // 清空选择状态
                        this.modelStateService.clearUserSelectState();
                        this.router
                            .navigate([this.appUrlService.getPageUrlValue('PAGE_HOME')])
                            .catch(console.error);
                    }
                });
            }
            return true;
        }).catch(console.error);
    }
}
