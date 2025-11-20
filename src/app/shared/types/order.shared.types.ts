/**
 * @desc 订单上传报文
 */
export interface OrderRequestVO {
    orderId?: string; // 润典中台订单ID
    brandCode: string; // 品牌编码
    brandName: string; // 品牌名称
    storeAddr: string; // 门店地址
    channelId: string; // 点餐渠道编码: 201
    thirdOrderId: string; // 点餐端渠道的订单ID，如，小程序、美团、饿了么、POS的订单ID
    extOrderId?: string; // 外部中台订单ID
    orderType: number; // 订单类型(取餐类型)1: 外卖 2: 自取
    storeCode: string; // 中台分配的门店编码
    storeName: string; // 中台分配的门店名称
    createTime: string; // 订单创建时间，格式：yyyy-MM-dd HH:mm:ss
    orderTime?: string; // 下单时间（订单支付完成时间） 格式：yyyy-MM-dd HH:mm:ss
    cashierId?: string; // 收银员id
    cashierName?: string; // 收银员姓名
    takeNo?: string; // 点餐端的取餐码或流水号
    tableNo?: string; // 桌码
    deliveryPay?: number; // 配送费(分)
    userRealPrice: number; // 用户实付金额
    income?: number; // 店家实收(分)
    roundDown?: number; // 抹零金额(分)
    overCharge?: number; // 超收金额(分)
    originalPrice?: number; // 订单原价合计(分)
    note?: string; // 忌口或备注 用户填写的备注
    bookFlag: number; // 是否是预约单 1：预约单0：即时单
    takeOrderTime?: string; // 取单时间/预计送达时间 格式：yyyy-MM-dd HH:mm
    peopleNumber?: number; // 人数
    needInvoice?: number; // 是否开发票 0：不开，1：开，默认不开
    taxAmt?: number; // 税额
    taxRate?: number; // 税率
    storeServiceFee?: number; // 门店服务费
    payMode: number; // 支付模式：1：PAC 2、ONLINE
    orderDetails: OrderDetailItem[];
}

/**
 * @desc 套餐子项
 */
export interface OrderItemTypes {
    round?: string; // 套餐轮次/套餐组别
    roundNameCn?: string; // 轮次名称/组别名称
    spuId?: string; // 商品spuId
    spuName?: string; // 商品spu名称
    skuId: string; // 菜品id 子项商品的skuId
    productNameCn: string; // 商品名称
    quantity: number; // 商品数量
    price?: number; // 价格(分) 子项在套餐中的售卖价，（预留）
    originalPrice: number; // 商品原价(分) （子项商品的原始单价，不含属性、加料）
    realPrice: number; // 商品价格(分) （价格 + 属性+加料价格），餐盒费时为合计的餐盒费
    productRemark?: string; // 商品备注
    taxAmt?: number; // 商品税额(分)
    specList?: OrderSpecItem[]; // 子项规格列表
    grillList?: OrderGrillItem[]; // 子项加料列表
}

/**
 * @desc 加料配置
 */
export interface OrderGrillItem {
    grillItemId: string; // 加料行标识
    grillType: string; // 加料类型、加料组
    grillTypeNameCn?: string; // 加料类型、加料组名称
    grillCode: string; // 加料编码
    grillNameCn: string; // 加料中文名称
    quantity: number; // 加料数量
    price: number; // 加料价格(分)
    taxAmt?: number; // 加料税额(分)
}

/**
 * @desc 规格
 */
export interface OrderSpecItem {
    specsCategoryType?: string; // 规格组
    specsCategoryTypeNameCn?: string; // 规格组描述
    specsCategoryCode?: string; // 规格编码
    specsCategoryNameCn?: string; // 规格中文名称
}

/**
 * @desc 订单商品详情（商品项、餐盒费）
 */
export interface OrderDetailItem {
    orderItemId: string; // 订单商品行标识 订单内菜品的唯一标识，用于后续部分退的业务功能
    spuId?: string; // 商品spuId
    spuName?: string; // 商品spu名称
    skuId: string; // 商品id 单品使用所选规格对应的skuId，套餐使用套餐头的skuId；餐盒费固定编码
    productNameCn: string; // 菜品名称 餐盒费固定为"餐盒费"
    originalPrice: number; // 商品原价 商品自己本身的价格，不含属性，不包含加料；餐盒费时为合计的餐盒费，单位分
    realPrice: number; // 商品价格 商品原价+含属性+加料价格；餐盒费时为合计的餐盒费，单位分
    quantity: number; // 商品数量
    foodType: number; // 商品类型 1:单品;2:套餐;11:餐盒费；
    productRemark?: string; // 商品备注
    taxAmt?: number; // 菜品税额
    specList?: OrderSpecItem[];
    grillList?: OrderGrillItem[];
    itemList?: OrderItemTypes[];
}
