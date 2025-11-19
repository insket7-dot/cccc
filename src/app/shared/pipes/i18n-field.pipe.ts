import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nTextService } from '@app/shared/services/util/i18n-text.service';
import { CurrencyPipe } from '@angular/common';
import { LanguageService } from '@app/core/services/language.service';

@Pipe({
    name: 'i18nField',
    standalone: true,
    pure: false,
})
export class I18nFieldPipe implements PipeTransform {
    constructor(private i18nTextService: I18nTextService) {}

    transform(obj: any, baseKey: string): string {
        return this.i18nTextService.get(obj, baseKey);
    }
}

// 货币符号展示
@Pipe({
    name: 'priceI18n',
    standalone: true,
    pure: false,
})
export class PriceI18nPipe implements PipeTransform {
    lang = inject(LanguageService);
    private currencyPipe = new CurrencyPipe(this.lang.getCurrentLanguage());

    transform(
        value: number | string | null | undefined,
        digits: string = '1.2-2',
        showSymbol: boolean = true,
    ): string {
        if (value == null) return '';

        const display = showSymbol ? 'symbol' : 'code';

        const formatted =
            this.currencyPipe.transform(
                value,
                this.lang.getCurrencyCode(),
                display,
                digits,
                this.lang.getCurrentLanguage(),
            ) ?? '';

        // 保证符号与金额之间有一个空格
        return formatted.replace(/^(\D+)/, '$1\u00A0');
    }
}
