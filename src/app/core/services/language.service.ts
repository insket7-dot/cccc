import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';

export interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
    shortName: string;
    available: boolean;
    key: string;
}

/**
 * @desc 语言code
 */
export enum LanguageEnum {
    ZH_CN = 'zh-cn',
    EN_US = 'en-us',
    ZH_TW = 'zh-tw',
}

/**
 * @desc 后端多语言字段后缀标识
 */
export enum LanguageKeyEnum {
    ZH_CN = 'Cn',
    EN_US = 'En',
    ZH_TW = 'Cn',
}

/**
 * @desc 货币标识符
 */
export enum LanguagePriceEnum {
    ZH_CN = '$',
    EN_US = '$',
    ZH_TW = '￥',
}

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    private readonly STORAGE_KEY = CacheKey.APP_LANGUAGE;
    private readonly DEFAULT_LANGUAGE = LanguageEnum.ZH_CN;

    private readonly availableLanguages: LanguageOption[] = [
        {
            code: LanguageEnum.ZH_CN,
            name: '简体中文',
            nativeName: '简体中文',
            shortName: '简',
            key: LanguageKeyEnum.ZH_CN,
            available: true,
        },
        {
            code: LanguageEnum.EN_US,
            name: 'English',
            nativeName: 'English',
            shortName: 'En',
            available: true,
            key: LanguageKeyEnum.EN_US,
        },
        {
            code: LanguageEnum.ZH_TW,
            name: '繁體中文',
            nativeName: '繁體中文',
            shortName: '繁',
            available: true,
            key: LanguageKeyEnum.ZH_TW,
        },
    ];

    private currentLanguageSubject = new BehaviorSubject<string>(this.DEFAULT_LANGUAGE);
    public currentLanguage$ = this.currentLanguageSubject.asObservable();

    constructor(private translate: TranslateService) {
        this.initializeLanguage().catch((error) => console.error(error));
    }

    private async initializeLanguage() {
        // 从本地存储获取保存的语言，如果没有则使用默认语言
        const savedLanguage: string =
            (await LocalStorage.getItem(this.STORAGE_KEY)) || this.DEFAULT_LANGUAGE;
        this.setLanguage(savedLanguage).catch((error) => console.error(error));
    }

    public getAvailableLanguages(): LanguageOption[] {
        return this.availableLanguages.filter((lang) => lang.available);
    }

    /**
     * @desc 获取当前语言值
     */
    public getCurrentLanguage(): string {
        return this.currentLanguageSubject.value;
    }

    /**
     * @desc 设置语言
     */
    public async setLanguage(languageCode: string) {
        if (this.availableLanguages.some((lang) => lang.code === languageCode)) {
            this.translate.use(languageCode);
            this.currentLanguageSubject.next(languageCode);
            await LocalStorage.setItem(this.STORAGE_KEY, languageCode);
        }
    }

    /**
     * @desc 获取当前语言选项
     */
    public getCurrentLanguageOption(): LanguageOption | undefined {
        return this.availableLanguages.find((lang) => lang.code === this.getCurrentLanguage());
    }

    /**
     * @desc 输出当前字段拼接上多语言的字段
     */
    public getCurrentLanguageKey(name: string): string {
        const languageOption = this.getCurrentLanguageOption();
        const languageKey = languageOption ? languageOption.key : LanguageKeyEnum.ZH_CN;
        return `${name}${languageKey}`;
    }

    /**
     * @desc 根据当前语言获取当前的货币标识符
     */
    public getCurrencyCode() {
        switch (this.getCurrentLanguage()) {
            case LanguageEnum.ZH_CN:
                return LanguagePriceEnum.ZH_CN;
            case LanguageEnum.EN_US:
                return LanguagePriceEnum.EN_US;
            case LanguageEnum.ZH_TW:
                return LanguagePriceEnum.ZH_TW;
            default:
                return LanguagePriceEnum.ZH_CN;
        }
    }
}
