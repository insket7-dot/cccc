import { MenuConstantsItem } from '@app/shared/types/menu.shared.types';

/**
 * @desc 菜品数量限制
 */
export enum ProductLimit {
    // 不限制
    UNLIMITED = -1,
    // 限制最小数量
    LIMIT = 1,
    // 限制最大 数量
    LIMIT_MAX = 99,
}

/**
 * @desc 分类操作
 */
export enum CategoryOperation {
    //上一个
    PREV = 'prev',
    // 下一个
    NEXT = 'next',
}

/**
 * @desc 商品类型
 */
export enum ProductType {
    // 单品
    PRODUCT = '1',
    // 套餐
    COMBO = '2',
    // 餐盒费
    BOX = '11',
}

/**
 * @desc 菜品类型枚举
 */
export enum MenuType {
    // 普通模式
    NORMAL = 'Normal',
    // 儿童模式
    ACCESSIBILITY = 'Accessibility',
}

/**
 * @desc 点餐模式枚举 1 堂食 2 外卖
 */
export enum OrderMode {
    // 堂食
    DINE_IN = '1',
    // 外带
    TAKE_OUT = '2',
}

/**
 * @desc 点餐模式
 */
export const wayList: MenuConstantsItem[] = [
    {
        type: OrderMode.DINE_IN,
        name: 'page.way1',
        icon: '/assets/image/dinein.png',
    },
    {
        type: OrderMode.TAKE_OUT,
        name: 'page.way2',
        icon: '/assets/image/takeout.png',
    },
];

/**
 * @desc 模式列表
 */
export const modeList: MenuConstantsItem[] = [
    {
        type: MenuType.NORMAL,
        name: 'page.model1',
        icon: '/assets/image/icon_mr2.png',
    },
    {
        type: MenuType.ACCESSIBILITY,
        name: 'page.model2',
        icon: '/assets/image/Acc.png',
    },
];
