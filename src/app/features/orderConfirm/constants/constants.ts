import {
    OrderBookingFlagEnums,
    OrderChannelEnums,
    OrderPayModeEnums,
    OrderTypeEnums,
} from '@app/shared/constants/app.enums';

/**
 * @desc 订单相关常量
 */
export const OrderConstants = {
    ORDER_CHANNEL: OrderChannelEnums.ORDER_CHANNEL, // 订单渠道
    ORDER_TYPE_TAKE_IN: OrderTypeEnums.ORDER_TYPE_TAKE_IN, // 订单类型-自取
    ORDER_PAY_MODE_ONLINE: OrderPayModeEnums.ORDER_PAY_MODE_ONLINE, // 支付模式：2、ONLINE
    ORDER_BOOKING_FLAG_INSTANT: OrderBookingFlagEnums.ORDER_BOOKING_FLAG_INSTANT, // 是否是预约单 0：即时单
    ORDER_BOOKING_FLAG_PAC: OrderPayModeEnums.ORDER_PAY_MODE_PAC, // 是否是预约单 1:PAC
} as const;

// 同时定义类型，方便在需要类型的地方使用
export type OrderConstants = typeof OrderConstants;
