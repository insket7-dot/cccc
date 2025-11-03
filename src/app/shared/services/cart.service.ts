import { computed, Injectable, signal } from '@angular/core';
import { ShopCartProduct } from '@app/shared/types/cart.shared.types';
import { debounceTime, Subject } from 'rxjs';
import { ProductType } from '@app/shared/constants/menu.constants';
import { CartUpdateResult } from '@app/shared/constants/app.enums';
import { PriceService } from '@app/shared/services/price.service';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private maxCartCount = 99;
    private _cartMap: Map<string, ShopCartProduct> = new Map();
    private cartMapSignal = signal<Map<string, ShopCartProduct>>(new Map());
    private cartChanges$ = new Subject<void>();

    // 购物车列表
    readonly cartList = computed(() => Array.from(this.cartMapSignal().values()));
    // 唯一ID -> 商品勾选参数
    readonly cartMap = computed(() => this.cartMapSignal());

    constructor(private priceService: PriceService) {
        this.cartChanges$
            .pipe(
                debounceTime(200), // 防抖 200ms
            )
            .subscribe(() => {
                this.cartMapSignal.set(new Map(this._cartMap));
            });
    }

    private emitChange() {
        this.cartChanges$.next();
    }

    /**
     * @desc 更新小计价格
     */
    private updateSubtotal(item: ShopCartProduct) {
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

        item.subtotal = this.priceService.toNumber(this.priceService.mul(subtotal, item.quantity));

        return item;
    }

    /**
     * @desc 添加商品到购物车内
     */
    async addToCart(product: ShopCartProduct) {
        const hasKey = this._cartMap.has(product.cartId);
        if (hasKey) {
            const cartItem = this._cartMap.get(product.cartId)!;
            cartItem.quantity++;
            this.updateSubtotal(cartItem);
        } else {
            const data = this.updateSubtotal(product);
            this._cartMap.set(product.cartId, data);
        }
        console.log(this._cartMap);

        // 发射事件
        this.emitChange();
    }

    /**
     * @desc 触发更新
     */
    private applyQuantityChange(item: ShopCartProduct, newQuantity: number): void {
        item.quantity = newQuantity;
        this.updateSubtotal(item);
        this.emitChange();
    }

    /**
     * @desc 增加商品数量
     * @param cartId 商品唯一ID
     * @param delta 减少数量（默认 1）
     * @returns CartUpdateResult
     */
    increaseQuantity(cartId: string, delta = 1): CartUpdateResult {
        const cartItem = this._cartMap.get(cartId);
        if (!cartItem) {
            return CartUpdateResult.NotFound;
        }
        if (delta <= 0) {
            return CartUpdateResult.InvalidDelta;
        }

        let newQuantity = cartItem.quantity + delta;

        // 处理数量溢出
        if (newQuantity > this.maxCartCount) {
            newQuantity = this.maxCartCount;
        }

        // 更新
        this.applyQuantityChange(cartItem, newQuantity);

        return newQuantity >= this.maxCartCount
            ? CartUpdateResult.LimitReached
            : CartUpdateResult.Updated;
    }

    /**
     *  @desc 减少商品数量
     *  @param cartId 商品唯一ID
     *  @param delta 减少数量（默认 1）
     *  @returns CartUpdateResult
     */
    decreaseQuantity(cartId: string, delta = 1): CartUpdateResult {
        const cartItem = this._cartMap.get(cartId);
        if (!cartItem) {
            return CartUpdateResult.NotFound;
        }

        // 防止非法 delta
        if (delta <= 0) {
            return CartUpdateResult.InvalidDelta;
        }

        const newQuantity = cartItem.quantity - delta;

        // 若减少后小于等于0，则提示删除
        if (newQuantity <= 0) {
            return CartUpdateResult.Deleted;
        }
        // 更新
        this.applyQuantityChange(cartItem, newQuantity);

        return CartUpdateResult.Updated;
    }

    /**
     * @desc 移除单个商品
     */
    removeFromCart(cartId: string) {
        this._cartMap.delete(cartId);
        this.emitChange();
    }

    /**
     * @desc 清空
     */
    clearCart() {
        this._cartMap.clear();
        this.emitChange();
    }
}
