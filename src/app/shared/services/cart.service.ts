import { Injectable, signal, computed } from '@angular/core';
import { ShopCartProduct } from '@app/shared/types/cart.shared.types';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private cartMapSignal = signal<Map<string, ShopCartProduct>>(new Map());

    // 购物车列表
    readonly cartList = computed(() => Array.from(this.cartMapSignal().values()));
    // 唯一ID -> 商品勾选参数
    readonly cartMap = computed(() => this.cartMapSignal());

    /**
     * @desc 添加商品到购物车内
     */
    async addToCart(product: ShopCartProduct) {
        const hasKey = this.cartMapSignal().has(product.cartId);
        if (hasKey) {
            const cartItem = this.cartMapSignal().get(product.cartId)!;
            cartItem.quantity++;
        } else {
            this.cartMapSignal().set(product.cartId, product);
        }
    }

    /**
     * @desc 增加商品数量
     */
    increaseQuantity(product: ShopCartProduct) {}

    /**
     * @desc 减少商品数量
     */
    decreaseQuantity(product: ShopCartProduct) {}

    /**
     * @desc 移除单个商品
     */
    removeFromCart(product: ShopCartProduct) {}

    /**
     * @desc 清空
     */
    clearCart() {
        this.cartMapSignal().clear();
    }
}
