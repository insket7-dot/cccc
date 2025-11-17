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

/**
 * @desc 设备ID加载状态枚举
 */
export enum DeviceIdLoadStatus {
    /** 已加载 */
    LOADED = 'loaded',

    /** 加载中 */
    LOADING = 'loading',

    /** 跳过 */
    SKIPPED = 'skipped',

    /** 加载失败 */
    FAILED = 'failed',
}

/** 渠道枚举 */
export enum OrderChannelEnums {
    /** 订单渠道 */
    ORDER_CHANNEL = '201',
}

/** 订单类型枚举 */
export enum OrderTypeEnums {
    /** 订单类型-自取 */
    ORDER_TYPE_TAKE_IN = 2,
    /** 订单类型-外送 */
    ORDER_TYPE_DELIVERY = 1,
}

/** 支付模式枚举 */
export enum OrderPayModeEnums {
    /** 支付模式-在线支付 */
    ORDER_PAY_MODE_ONLINE = 2,
    /** 支付模式-线下支付 */
    ORDER_PAY_MODE_PAC = 1,
}

/** 是否是预约单 */
export enum OrderBookingFlagEnums {
    /** 是否是预约单 0：即时单 */
    ORDER_BOOKING_FLAG_INSTANT = 0,
    /** 是否是预约单 1:预约单 */
    ORDER_BOOKING_FLAG_RESERVATION = 1,
}

/** 是否开发票 */
export enum OrderNeedInvoiceEnums {
    /** 是否开发票 0：不开发票 */
    ORDER_NEED_INVOICE_NO = 0,
    /** 是否开发票 1：开发票 */
    ORDER_NEED_INVOICE_YES = 1,
}

/**
 * @desc 是否枚举
 */
export enum YesNoNumberEnums {
    /** 是否-否 */
    NO = 0,
    /** 是否-是 */
    YES = 1,
}

export enum YesNoStringEnums {
    /** 是否-否 */
    NO = '0',
    /** 是否-是 */
    YES = '1',
}

/**
 * @desc 小费类型
 */
export enum TipTypeEnums {
    /** 小费类型-固定金额 */
    FIXED = 'fixed',
    /** 小费类型-百分比 */
    PERCENT = 'percent',
}
