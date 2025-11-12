import { computed, Injectable, signal } from '@angular/core';
import { ShopCartProduct } from '@app/shared/types/cart.shared.types';
import { debounceTime, Subject } from 'rxjs';
import { CartUpdateResult } from '@app/shared/constants/app.enums';
import { SubtotalService } from '@app/shared/services/subtotal.service';
import { PriceService } from '@app/shared/services/price.service';
import { ProductLimit } from '@app/shared/constants/menu.constants';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private maxCartCount = ProductLimit.LIMIT_MAX;
    private _cartMap: Map<string, ShopCartProduct> = new Map();
    private cartMapSignal = signal<Map<string, ShopCartProduct>>(new Map());
    private cartChanges$ = new Subject<void>();

    // 购物车列表
    readonly cartList = computed(() => Array.from(this.cartMapSignal().values()));
    // 唯一ID -> 商品勾选参数
    readonly cartMap = computed(() => this.cartMapSignal());
    // 购物车总价
    readonly cartTotal = computed(() => {
        const total = this.priceService.toNumber(
            this.priceService.sumList(this.cartList().map((item) => item.subtotal ?? 0)),
        );
        const totalCount = this.cartList().reduce((acc, item) => acc + item.quantity, 0);
        return {
            total,
            count: totalCount,
        };
    });

    constructor(
        private subtotalService: SubtotalService,
        private priceService: PriceService,
    ) {
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
     * @desc 计算并更新购物车商品的小计价格
     * @param item 购物车商品项
     * @returns 更新后的购物车商品项（新对象）
     */
    private updateSubtotal(item: ShopCartProduct) {
        // 计算小计相关数据
        const computedData = this.subtotalService.subtotalComputed(item);

        // 创建包含计算结果的新对象
        const updatedItem = { ...item, subtotal: computedData.subtotal, taxData: computedData };

        // 更新购物车中的商品数据
        this._cartMap.set(item.cartId, updatedItem);

        // 返回更新后的新对象，保持API一致性
        return updatedItem;
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
