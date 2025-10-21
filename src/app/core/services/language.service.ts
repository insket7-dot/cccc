import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorage } from '@rydeen/angular-framework';

export interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
    shortName: string;
    available: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    private readonly STORAGE_KEY = 'app-language';
    private readonly DEFAULT_LANGUAGE = 'zh-cn';

    private readonly availableLanguages: LanguageOption[] = [
        {
            code: 'zh-cn',
            name: '简体中文',
            nativeName: '简体中文',
            shortName: '简',
            available: true,
        },
        { code: 'en-us', name: 'English', nativeName: 'English', shortName: 'En', available: true },
        {
            code: 'zh-tw',
            name: '繁體中文',
            nativeName: '繁體中文',
            shortName: '繁',
            available: true,
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

    public getCurrentLanguage(): string {
        return this.currentLanguageSubject.value;
    }

    public async setLanguage(languageCode: string) {
        if (this.availableLanguages.some((lang) => lang.code === languageCode)) {
            this.translate.use(languageCode);
            this.currentLanguageSubject.next(languageCode);
            await LocalStorage.setItem(this.STORAGE_KEY, languageCode);
        }
    }

    public getCurrentLanguageOption(): LanguageOption | undefined {
        return this.availableLanguages.find((lang) => lang.code === this.getCurrentLanguage());
    }
}
