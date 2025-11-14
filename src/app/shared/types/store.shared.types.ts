/**
 * @desc 门店营业时间
 */
export interface StoreBusTimeInterface {
    channelBusinessStatus: string; // 0 关 1启
    exceptionTimeVOS: {
        beginDate: string;
        endDate: string;
        weeks: number;
    }[];
}

/**
 * @desc 轮播图返回体
 */
export interface CarouselImageResponseVO {
    /** 主键ID */
    id: string;

    /** 品牌代码，如 HL01 */
    brandCode: string;

    /** 渠道代码，如 201 */
    channelCode: string;

    /** 资源代码，如 RS00000002 */
    resourceCode: string;

    /** 页面代码，如 page001 */
    pageCode: string;

    /** 页面名称，如 首页轮播 */
    pageName: string;

    /** 业务开始时间（格式：YYYY-MM-DD HH:mm:ss） */
    businessStartTime: string;

    /** 业务结束时间（格式：YYYY-MM-DD HH:mm:ss） */
    businessEndTime: string;

    /** 时段标识，例如 period1 */
    dayPart: string;

    /** 操作区域代码，如 oper001 */
    operationAreaCode: string;

    /** 操作区域名称，如 首页轮播图 */
    operationAreaName: string;

    /** 操作人名称 */
    operateName: string;

    /** 门店代码集合（逗号分隔） */
    storeCode: string;

    /** 创建时间 */
    createTime: string;

    /** 更新时间 */
    updateTime: string;

    /** 删除标志：0=未删除，1=已删除 */
    deleted: number;

    /** 状态：1=启用，0=停用 */
    status: number;

    /**
     * 图片数据（后端返回为字符串，需解析为 JSON 数组）
     * CarouselImage
     */
    pics: string;
}

/**
 * @desc 轮播图
 */
export interface CarouselImage {
    image: string;
    alt: string;
    index: number;
}

/**
 * @desc 门店信息
 */
export interface StoreBaseInfoInterface {
    /**
     * @desc 语音播放开关
     */
    voiceFlag?: boolean;
    /**
     * 餐厅编码
     */
    storeCode?: string;
    /**
     * 餐厅名称
     */
    storeName?: string;
    /**
     * 品牌
     */
    brandCode?: string;

    taxSubjectCode?: string;

    /**
     * 消费税率 taxRate（百分比）
     */
    taxRate?: string;

    /**
     * 服务费率 serviceCharge（百分比）
     */
    serviceCharge?: string;

    /**
     * 服务费计算方式 scCalcMode（BEFORE_TAX、 INCLUDE_TAX 两个选项）
     */
    scCalcMode?: string;

    /**
     * 菜品价格是否包含消费税 （Y/N）
     */
    menuTaxRate?: string;

    /**
     * 消费税名称
     */
    consumptionTaxName?: string;
    /**
     * 钱币符号
     */
    currencySymbol?: string;

    /**
     * 扩展字段
     */
    extendParam?: Record<string, any>;
    /**
     * yoyo 门店编码
     */
    yoyoStoreCode?: string;

    /**
     * 税率组
     */
    taxGroupCode?: string;

    taxGroup?: StoreTaxGroupVO[];

    /**
     * 附加费
     */
    extraChargeFee?: string;

    extraChange?: TrdMasterStoreExtraChangeInfoVo[];
}

export interface StoreTaxGroupVO {
    /**
     * 税率组编码
     */
    groupCode?: string;
    /**
     * 税率组名称
     */
    groupName?: string;

    taxList?: TaxInfo[];
}

export interface TaxInfo {
    /**
     * 税率编码
     */
    taxCode?: string;
    /**
     * 税率名
     */
    taxName?: string;
    /**
     * 税率值
     */
    taxValue?: string;
    /**
     * 适用于 1 堂食 2 外卖
     */
    useType?: string[];
    /**
     * 适用于 1 堂食 2 外卖
     */
    useTypeStr?: string;
    /**
     * 免税最小
     */
    dutyFreeMin?: number;
    /**
     * 免税最大
     */
    dutyFreeMax?: number;
    /**
     * 税率方式 1 百分比税率 2 固定金额
     */
    taxType?: string;
    /**
     * 税分类 1 内含税 2 外加税
     */
    taxCategory?: string;
    /**
     * 状态
     */
    status?: number;
}

export interface TrdMasterStoreExtraChangeInfoVo {
    id?: number;

    /**
     * 类别 1:内含税  2:外加税
     */
    extraChargeType?: string;

    /**
     * 名称
     */
    extraChargeName?: string;

    /**
     * 计算类型 1 金额 2 百分比
     */
    numberCountType?: string;

    /**
     * 数值
     */
    number?: number;

    /**
     * 税率组
     */
    taxGroup?: string;

    /**
     * 计算方式 1: 折扣前计算 2: 折扣后计算
     */
    countType?: string;

    /**
     * 按人收费 0 否 1 是
     */
    perChangeFee?: number;

    /**
     * 最少人数
     */
    minNum?: number;

    /**
     * 最大人数
     */
    maxNum?: number;

    /**
     * 创建时间，排序
     */
    createTime?: Date;

    /**
     * 适用的支付方式 1 现金支付 2 VISA支付 3 信用卡支付
     */
    usePayTypes?: string;

    /**
     * 适用的订单类型 1 堂食 2 外卖
     */
    useOrderTypes?: string;

    /**
     * 适用的支付方式 1 现金支付 2 VISA支付 3 信用卡支付
     */
    usePayType?: string[];
    /**
     * 适用的订单类型 1 堂食 2 外卖
     */
    useOrderType?: string[];

    changeNumber?: number;

    /**
     * 有效期
     */
    validityTime?: ChangeTime[];
}

export interface ChangeTime {
    startTime: string;
    endTime: string;
}
