import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nTextService {
    constructor(private translate: TranslateService) {}
    /**
     * 获取多语言字段值
     */
    get<T extends Record<string, any>>(obj: T | null | undefined, baseKey: string): string {
        if (!obj) return '';
        const lang = (this.translate.getCurrentLang() || 'zh').toLowerCase();
        const suffixMap: Record<string, string> = {
            zh: 'Cn',
            'zh-tw': 'Cn',
            en: 'En',
        };
        const suffix = suffixMap[lang] ?? 'Cn';

        const key = `${baseKey}${suffix}`;
        return obj[key] ?? obj[`${baseKey}Cn`] ?? '';
    }
}
