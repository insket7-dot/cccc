/**
 * @desc 订单相关常量
 */
export const OrderConstants = {
    ORDER_CHANNEL: '201', // 订单渠道
    ORDER_TYPE_TAKE_IN: 2, // 订单类型-自取
    ORDER_PAY_MODE_ONLINE: 2, // 支付模式：2、ONLINE
    ORDER_BOOKING_FLAG_INSTANT: 0, // 是否是预约单 0：即时单
    ORDER_BOOKING_FLAG_PAC: 1, // 是否是预约单 1:PAC
} as const;

// 同时定义类型，方便在需要类型的地方使用
export type OrderConstants = typeof OrderConstants;
