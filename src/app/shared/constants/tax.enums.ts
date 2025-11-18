/**
 * @desc 税率方式 1 百分比税率 2 固定金额
 */
export enum TaxTypeEnums {
    /** 税率方式-百分比税率 */
    PERCENTAGE = '1',
    /** 税率方式-固定金额 */
    FIXED_AMOUNT = '2',
}

/**
 * @desc 税别分类 1 内含税 2 外加税
 */
export enum TaxCategoryEnum {
    /** 税别分类-内含税 */
    INCLUSIVE = '1',
    /** 税别分类-外加税 */
    EXCLUSIVE = '2',
}

/**
 * 附加费
 */
/**
 * @desc 附加费类型 1 订单附加费 2 支付手续费
 */
export enum ExtraChargeTypeEnum {
    /** 附加费类型-订单附加费 */
    ORDER = '1',
    /** 附加费类型-支付手续费 */
    PAY = '2',
}

/**
 * @desc 计算类型 1 金额 2 百分比
 */
export enum NumberCountTypeEnum {
    /** 计算类型-金额 */
    AMOUNT = '1',
    /** 计算类型-百分比 */
    PERCENTAGE = '2',
}

/**
 * @desc 计算方式 1: 折扣前计算 2: 折扣后计算
 */
export enum CountTypeEnum {
    /** 计算方式-折扣前计算 */
    BEFORE_DISCOUNT = '1',
    /** 计算方式-折扣后计算 */
    AFTER_DISCOUNT = '2',
}

/**
 * @desc 支付方式 1 现金支付 2 VISA支付 3 信用卡支付
 */
export enum UsePayTypesEnum {
    /** 支付方式-现金支付 */
    CASH = '1',
    /** 支付方式-VISA支付 */
    VISA = '2',
    /** 支付方式-信用卡支付 */
    CREDIT_CARD = '3',
}

/**
 * @desc 服务费计算方式
 */
export enum ServiceChargeTypeEnum {
    /** BEFORE_TAX*/
    BEFORE_TAX = 'BEFORE_TAX',
    /** INCLUDE_TAX */
    INCLUDE_TAX = 'INCLUDE_TAX',
}
