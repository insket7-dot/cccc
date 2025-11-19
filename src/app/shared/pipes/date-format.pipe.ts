import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateUtils } from '@app/shared/services/util/date-utils.service';

@Pipe({
    name: 'dateFormat',
    standalone: true,
    pure: false, // 语言切换时需要重新计算
})
export class DateFormatPipe implements PipeTransform {
    private readonly translate = inject(TranslateService);
    private readonly dateUtils = inject(DateUtils);

    transform(value: string | Date | null | undefined, format?: string): string {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return '';
        const fmt = format || this.translate.instant('app.common.dateFormat') || 'yyyy-MM-dd';

        return this.dateUtils.formatDate(date, fmt);
    }
}

@Pipe({
    name: 'dateTimeFormat',
    standalone: true,
    pure: false, // 语言切换时需要重新计算
})
export class DateTimeFormatPipe implements PipeTransform {
    private readonly translate = inject(TranslateService);
    private readonly dateUtils = inject(DateUtils);

    transform(value: string | Date | null | undefined, format?: string): string {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return '';
        const fmt =
            format || this.translate.instant('app.common.dateTimeFormat') || 'yyyy-MM-dd HH:mm:ss';
        return this.dateUtils.formatDateTime(date, fmt);
    }
}
