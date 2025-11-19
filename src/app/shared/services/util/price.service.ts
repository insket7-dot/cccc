import { Injectable } from '@angular/core';
import Decimal from 'decimal.js';

/**
 * @desc 金额计算服务（统一处理浮点误差）
 */
@Injectable({
    providedIn: 'root',
})
export class PriceService {
    constructor() {
        // 可全局设置小数精度和舍入规则
        Decimal.set({
            precision: 20, // 最大精度
            rounding: Decimal.ROUND_HALF_UP, // 四舍五入
        });
    }

    /** 安全转换成 Decimal 实例 */
    private d(value: number | string | Decimal): Decimal {
        if (value instanceof Decimal) return value;
        return new Decimal(value ?? 0);
    }

    /** 零 */
    zero(): Decimal {
        return new Decimal(0);
    }

    /** 初始化金额实例 */
    init(value: number | string | Decimal): Decimal {
        return this.d(value);
    }

    /** 加法 */
    add(...values: (number | string | Decimal)[]): Decimal {
        return values.reduce<Decimal>((sum, v) => sum.plus(this.d(v)), new Decimal(0));
    }

    /** 减法 */
    sub(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return this.d(a).minus(this.d(b));
    }

    /** 乘法 */
    mul(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return this.d(a).times(this.d(b));
    }

    /** 除法 */
    div(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return this.d(a).div(this.d(b || 1)); // 避免除以 0
    }

    /** 比较大小 */
    compare(a: number | string | Decimal, b: number | string | Decimal): number {
        return this.d(a).comparedTo(this.d(b)); // 返回 -1 | 0 | 1
    }

    /** 判断相等 */
    equals(a: number | string | Decimal, b: number | string | Decimal): boolean {
        return this.d(a).equals(this.d(b));
    }

    /** 累加列表中的价格 */
    sumList(values: (number | string | Decimal)[]): Decimal {
        return this.add(...values);
    }

    /** 格式化显示（保留两位小数） */
    format(value: number | string | Decimal, digits = 2): string {
        return this.d(value).toFixed(digits);
    }

    /** 输出安全的两位小数 Number */
    toNumber(value: number | string | Decimal, digits = 2): number {
        return this.d(value).toDecimalPlaces(digits).toNumber();
    }

    /** 输出安全的固定小数位数字符串 */
    toFixed(value: number | string | Decimal, digits = 2): string {
        return this.d(value).toFixed(digits);
    }

    /** 格式化成货币 */
    formatCurrency(value: number | string | Decimal, currency = '¥', digits = 2): string {
        return `${currency}${this.format(value, digits)}`;
    }

    /**
     * @desc 转换成分
     * @param value 金额
     * @returns 分
     */
    toFen(value: number | string | Decimal): number {
        return this.mul(value, 100).toDecimalPlaces(0).toNumber();
    }

    /**
     * @desc 百分比转换为小数
     */
    toPercentage(value: number | string | Decimal): number {
        return this.div(value, 100).toNumber();
    }
}
