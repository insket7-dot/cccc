/**
 * @desc 购物车菜品子项
 */
export interface ShopCartProduct {
    id: string; // 菜品ID
    quantity: number;
    price: number;
    [key: string]: any;
}

/**
 * @desc 购物车价格报文
 */
export interface ShopCartPrice {
    [key: string]: any;
}

/**
 * @desc 购物车订单生成报文结构
 */
export interface ShopCartOrder {
    [key: string]: any;
}
