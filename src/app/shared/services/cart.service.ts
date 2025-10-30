import { Injectable, signal, computed } from '@angular/core';
import { ShopCartProduct } from '@app/shared/types/cart.shared.types';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private cart = signal<ShopCartProduct[]>([]);

    readonly cartList = computed(() => this.cart());
    readonly cartMap = computed(() => {
        const newMap = new Map<string, ShopCartProduct>();
        const list = this.cart();
        list.forEach((product) => {
            newMap.set(product.id, product);
        });
        return newMap;
    });

    /**
     * @desc 添加商品到购物车内
     */
    addToCart(product: ShopCartProduct) {}

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
        this.cart.set([]);
    }
}
