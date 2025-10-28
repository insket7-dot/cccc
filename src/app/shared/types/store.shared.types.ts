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

    taxGroup?: StoreTaxGroupVO;

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
     * 试用于
     */
    useType?: string[];
    /**
     * 试用于
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
     * 税类型
     */
    taxType?: string;
    /**
     * 税种类
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
     * 类别
     */
    extraChargeType?: string;

    /**
     * 名称
     */
    extraChargeName?: string;

    /**
     * 计算类型
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
     * 计算方式
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

    useOrderTypes?: string;

    usePayType?: string[];
    useOrderType?: string[];

    changeNumber?: number;

    /**
     * 有效期
     */
    validityTime?: ChangeTime[];
}

export interface ChangeTime {
    startTime?: string;
    endTime?: string;
}
