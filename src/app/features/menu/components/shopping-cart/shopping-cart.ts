import { Component, computed, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CartDetailsBottomSheetComponent } from '../cart-details-bottom-sheet.component';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { MatListModule } from '@angular/material/list';
import { PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';
import { CartService } from '@app/shared/services/cart.service';
import { CartUpdateResult } from '@app/shared/constants/app.enums';
import { AppUrlService } from '@app/shared/services/app.url.service';

@Component({
    selector: 'menu-shopping-cart',
    standalone: true,
    templateUrl: './shopping-cart.html',
    styleUrl: './shopping-cart.scss',
    imports: [MatListModule, CommonModule, TranslateModule, PriceI18nPipe, NgOptimizedImage],
})
export class ShoppingCartComponent extends AbstractAppPage {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    constructor(
        private bottomSheet: MatBottomSheet,
        private appMenuService: AppMenuService,
        private cartService: CartService,
        private readonly appUrlService: AppUrlService,
    ) {
        super();
    }

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

    itemSubtraction(cartId: string) {
        const result = this.cartService.decreaseQuantity(cartId);
        console.log('subtraction:', result);

        if (result === CartUpdateResult.Deleted) {
            this.confirm('menu.cart.deleteTip', {}, async (result) => {
                if (result.role === 'ok') {
                    this.cartService.removeFromCart(cartId);
                }
                return true;
            }).catch(console.error);
        }
    }

    itemAdd(cartId: string) {
        this.cartService.increaseQuantity(cartId);
    }

    async continue() {
        if (this.cartTotalCount() <= 0) {
            this.info(this.translate.instant('menu.cart.addRequired')).catch(console.error);
            return;
        }
        await this.confirm('page.continue', {}, async (result) => {
            if (result.role === 'ok') {
                this.close()
                this.router
                    .navigate([this.appUrlService.getPageUrlValue('PAGE_ORDER_CONFIRM')])
                    .catch((error) => console.error(error));
                return true;
            } else {
                return false;
            }
        });
    }

    showDetails() {
        const bottomSheetRef = this.bottomSheet.open(CartDetailsBottomSheetComponent, {
            data: [{ id: 1, name: '商品1', price: 99 }],
            panelClass: 'cart-details-sheet',
            disableClose: false,
        });

        bottomSheetRef.afterDismissed().subscribe((result) => {
        });
    }

    /**
     * @desc 关闭购物车弹框
     */
    close() {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    }
}
