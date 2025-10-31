import { ProductType } from '@app/shared/constants/menu.constants';

/**
 * @desc 套餐轮次组
 */
export interface ComboRoundItem {
    roundId: string;
    min: number; // 默认 1
    max: number;
    itemList: ComboSkuItem[];
}

/** 套餐子项中的SKU项 */
export interface ComboSkuItem {
    skuId: string;
    quantity: number; // 默认1
    price: number;
}

/**
 * @desc 单品加料组
 */
export interface GrillItem {
    grillId: string;
    itemList: GrillItemSku[];
}

/**
 * @desc 单品加料组子项
 */
export interface GrillItemSku {
    productId: string;
    price: number;
    quantity: number; // 默认1
}

export interface CartExtra {
    // 单品字段
    skuId?: string; // 规格ID(单品)
    grillList?: GrillItem[]; // 加料 ID(单品)

    // 套餐字段
    rounds?: ComboRoundItem[];
}

/**
 * @desc 购物车菜品子项
 * 单品唯一ID设计： productType + productId + skuId + (n * (grillId + n * productId))
 * 组合唯一ID设计： productType + productId + (n * (roundId + n * skuId))
 */
export interface ShopCartProduct extends CartExtra {
    cartId: string; // 购物车组合唯一ID
    productType: ProductType | string; // 商品类型(单品、套餐）
    productId: string; // 商品ID
    quantity: number;
}

/**
 * @desc 购物车列表
 */
export interface ShopCartList extends ShopCartProduct {
    title: string;
    image: string;
    price: number;
    quantity: number;
    desc: string;
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
