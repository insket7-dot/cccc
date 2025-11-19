import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '@app/shared/services/cart/cart.service';
import { AppUrlService } from '@app/shared/services/util/app.url.service';
import { OrderShareService } from '@app/shared/services/order/order.share.service';
import { PriceI18nPipe, I18nFieldPipe } from '@app/shared/pipes/i18n-field.pipe';
import { ProductType } from '@app/shared/constants/menu.constants';
import { MenuFacadeService } from '@app/shared/services/ui/menu-facade.service';
import { ClearService } from '@app/shared/services/ui/clear.service';

@Component({
    selector: 'app-orderConfirm',
    templateUrl: './submitOrder.html',
    styleUrls: ['./submitOrder.scss'],
    imports: [TranslateModule, CommonModule, PriceI18nPipe, I18nFieldPipe],
})
export class SubmitOrder extends AbstractAppPage {
    constructor(
        private cartService: CartService,
        private menuFacadeService: MenuFacadeService,
        private readonly appUrlService: AppUrlService,
        private orderShareService: OrderShareService,
        private clearService: ClearService,
    ) {
        super();
    }

    protected readonly ProductType = ProductType;

    orderInfo = computed(() => this.orderShareService.getOrderInfoValue());
    userRealPrice = computed(() => this.cartService.cartTotal().total);

    // 购物车列表UI数据
    cartList = computed(() => {
        return this.menuFacadeService.cartListValue();
    });

    // 总价
    cartTotalPrice = computed(() => {
        return this.cartService.cartTotal().total;
    });

    cartTotalCount = computed(() => {
        return this.cartService.cartTotal().count;
    });

    goHome() {
        this.clearService.clearAll();

        this.router
            .navigate([this.appUrlService.getPageUrlValue('PAGE_SCREEN')], { replaceUrl: true })
            .catch(console.error);
    }
}
