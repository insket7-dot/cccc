/**
 * @desc MQTT 消息接收枚举
 */
export enum AppMqttEnums {
    // 菜品发布
    MENU_PUBLISH = 1,
    // 菜品上下架
    MENU_LOW_UP = 2,
    // 菜品售罄恢复
    MENU_SELL_0UT = 3,
    // 门店基本信息
    STORE_INF0 = 4,
    // 门店营业时间和状态
    STORE_BUSINESS_TIME_STATUS = 5,
    // ESC订单打印
    ESC_PRINT_ORDER = 6,
    // 门店轮播图更新
    STORE_CAROUSEL_UPDATE = 7,
}

/**
 * @desc 购物车更新结果
 */
export enum CartUpdateResult {
    /** 找不到商品 */
    NotFound = 'not-found',

    /** 数量已更新 */
    Updated = 'updated',

    /** 数量减少至0，应删除 */
    Deleted = 'deleted',

    /** 非法数量变更  */
    InvalidDelta = 'invalid-delta',

    /** 到达最大数量限制 */
    LimitReached = 'limit-reached',
}
