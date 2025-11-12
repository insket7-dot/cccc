import { Component, Inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { Router, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppUrlService } from '@app/shared/services/app.url.service';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProductLimit, ProductType } from '@app/shared/constants/menu.constants';
import { I18nFieldPipe, PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';
import { CartService } from '@app/shared/services/cart.service';
import { CartUpdateResult } from '@app/shared/constants/app.enums';
import { AbstractAppPage } from '@/app/shared/abstracts/abstract.app.page';




@Component({
    selector: 'app-cart-details-bottom-sheet',
    standalone: true,
    imports: [CommonModule, MatButtonModule, TranslateModule, I18nFieldPipe,PriceI18nPipe],
    template: `
        <div class="bottom-sheet-content">
            <div class="top">
                <div>
                    <span class="num">{{ cartList().length }}</span
                    >{{ 'page.items' | translate }}
                </div>
                <div class="clear" (click)="clearCart()" >{{ 'page.clear' | translate }}</div>
            </div>

            <div class="list">
                @for (item of cartList(); track item.cartId) {
                    <div class="item-div">
                        <div class="text-div">
                            <div class="productName">{{ item.productName }}</div>
                            @if (item.productType === ProductType.PRODUCT) {
                                <div class="spec">
                                    {{ item.spec?.skuNameCn }} /
                                    @for (
                                        grillList of item.grill || [];
                                        track grillList.grillCode
                                    ) {
                                        @for (
                                            grillItem of grillList.itemList || [];
                                            track grillItem.productId
                                        ) {
                                            {{ grillItem | i18nField: 'productName' }}
                                        }
                                    }
                                </div>
                            }
                            @if (item.productType === ProductType.COMBO) {
                                <div class="spec">
                                    @for (
                                        grillList of item.rounds || [];
                                        track grillList.roundNameCn
                                    ) {
                                        @for (
                                            grillItem of grillList.itemList || [];
                                            track grillItem.skuId
                                        ) {
                                            {{ grillItem.productName }} /
                                        }
                                    }
                                </div>
                            }
                        </div>

                        <span class="price">{{ item.subtotal | priceI18n }}</span>
                        <div class="cart-control">
                            <span class="add" (click)="itemSubtraction(item.cartId)">
                                <img src="/assets/image/minus.png" alt="" height="20" width="20" />
                            </span>
                            <span>{{ item.quantity }}</span>
                            <span class="add" (click)="itemAdd(item.cartId)">
                                <img src="/assets/image/add.png" alt="" height="20" width="20" />
                            </span>
                        </div>
                    </div>
                }
            </div>
            <!-- <button mat-raised-button color="primary" (click)="closeSheet()">关闭</button> -->
        </div>
    `,
    styles: [
        `
            .bottom-sheet-content {
                padding: 16px;
                padding-bottom: 100px;
            }
            .top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 18px;
                color: #a3a3a3;
                .num {
                    color: var(--app-primary-color);
                }
            }
            .list {
                margin-top: 15px;
                font-size: 16px;

                .item-div {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top:10px;

                    .text-div {
                        width: 280px;
                        .productName,
                        .spec {
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            -webkit-line-clamp: 1;
                        }
                    }
                }

                .cart-control {
                    width: 80px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .spec {
                    color: #b3b3b3;
                    font-size: 14px;
                }
            }
            h3 {
                margin: 0 0 16px 0;
            }
        `,
    ],
})
export class CartDetailsBottomSheetComponent extends AbstractAppPage implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    constructor(
        private bottomSheetRef: MatBottomSheetRef<CartDetailsBottomSheetComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private appMenuService: AppMenuService,
        private appUrlService: AppUrlService,
        private cartService: CartService,
    ) {
        super();
    }
    protected readonly ProductType = ProductType;
    cartList = computed(() => {
        return this.appMenuService.cartListValue();
    });


    ngOnInit(): void {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationStart),
                filter(
                    (event: NavigationStart) =>
                        event.url === this.appUrlService.getPageUrlValue('PAGE_SCREEN'),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe(() => {
                this.bottomSheetRef.dismiss({
                    closed: true,
                    reason: 'navigated to screen',
                });
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    closeSheet() {
        this.bottomSheetRef.dismiss({ closed: true });
    }

    itemSubtraction(cartId: string) {
        const result = this.cartService.decreaseQuantity(cartId);

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

    clearCart() {

        this.cartService.clearCart();
    }
}
