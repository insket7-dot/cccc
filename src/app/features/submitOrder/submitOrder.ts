import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '@app/shared/services/cart.service';
import { AppUrlService } from '@app/shared/services/app.url.service';

import { PriceI18nPipe, I18nFieldPipe } from '@app/shared/pipes/i18n-field.pipe';
import { ProductType } from '@app/shared/constants/menu.constants';
import { MenuFacadeService } from '@app/shared/services/ui/menu-facade.service';

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
    ) {
        super();
    }

    protected readonly ProductType = ProductType;

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
        this.router
            .navigate([this.appUrlService.getPageUrlValue('PAGE_HOME')], { replaceUrl: true })
            .catch(console.error);
    }
}
