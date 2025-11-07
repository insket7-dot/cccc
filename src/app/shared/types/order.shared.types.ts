/**
 * @desc 订单确认结果VO
 */
export interface OrderResultVO {
    orderId: string;
    [key: string]: any;
}

/**
 * @desc 订单上传报文
 */
export interface OrderRequestVO {
    orderId: string;
    [key: string]: any;
}
