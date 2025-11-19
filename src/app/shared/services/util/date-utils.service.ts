import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DateUtils {
    constructor(private translate: TranslateService) {}

    /**
     * 解析语言标识为标准locale格式
     * 复用date-format.pipe中的语言映射逻辑，保证一致性
     */
    private resolveLocale(): string {
        const lang = (this.translate.getCurrentLang() || '').toLowerCase();
        switch (lang) {
            case 'en-us':
            case 'en':
                return 'en-US';
            case 'zh-tw':
            case 'zh-hant':
                return 'zh-TW';
            case 'zh-cn':
            case 'zh':
            case 'zh-hans':
                return 'zh-CN';
            default:
                return 'en-US';
        }
    }

    /**
     * 格式化日期（仅日期部分）
     * @param value 日期字符串或Date对象
     * @param format 自定义格式（可选，默认使用i18n配置）
     * @returns 格式化后的日期字符串
     */
    formatDate(value: string | number | Date | null | undefined, format?: string): string {
        if (!value) return '';

        // 转换为Date对象
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return '';

        // 确定格式（自定义 > i18n配置 > 默认）
        const fmt = format || this.translate.instant('app.common.dateFormat') || 'yyyy-MM-dd';

        return formatDate(date, fmt, this.resolveLocale());
    }

    /**
     * 格式化日期时间（包含时间部分）
     * @param value 日期字符串或Date对象
     * @param format 自定义格式（可选，默认使用i18n配置）
     * @returns 格式化后的日期时间字符串
     */
    formatDateTime(value: string | number | Date | null | undefined, format?: string): string {
        if (!value) return '';

        // 转换为Date对象
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return '';

        // 确定格式（自定义 > i18n配置 > 默认）
        const fmt =
            format || this.translate.instant('app.common.dateTimeFormat') || 'yyyy-MM-dd HH:mm:ss';

        return formatDate(date, fmt, this.resolveLocale());
    }

    /**
     * 将Date对象转换为本地日期字符串（yyyy-MM-dd）
     * 解决时区偏移问题，仅保留年月日
     * @param date Date对象
     * @returns 本地日期字符串
     */
    toLocalDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 检查日期字符串是否有效
     * @param value 日期字符串
     * @returns 是否有效
     */
    isValidDate(value: string | Date): boolean {
        const date = value instanceof Date ? value : new Date(value);
        return !isNaN(date.getTime());
    }

    /**
     * 计算两个日期之间的天数差
     * @param start 开始日期
     * @param end 结束日期
     * @returns 天数差（可为负数）
     */
    getDayDiff(start: string | Date, end: string | Date): number {
        if (!this.isValidDate(start) || !this.isValidDate(end)) {
            return 0;
        }

        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);

        // 转换为当天的起始时间（00:00:00）
        const startTimestamp = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
        ).getTime();

        const endTimestamp = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
        ).getTime();

        return Math.floor((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24));
    }

    /**
     * 检查两个日期是否在同一天
     * @param date1 日期1
     * @param date2 日期2
     * @returns 是否同一天
     */
    isSameDay(date1: string | number | Date, date2: string | number | Date): boolean {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    }
}
