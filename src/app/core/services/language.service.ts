import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
}

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    private readonly STORAGE_KEY = 'app-language';
    private readonly DEFAULT_LANGUAGE = 'zh-cn';

    private readonly availableLanguages: LanguageOption[] = [
        { code: 'zh-cn', name: '简体中文', nativeName: '简体中文' },
        { code: 'en-us', name: 'English', nativeName: 'English' },
        { code: 'zh-tw', name: '繁體中文', nativeName: '繁體中文' },
    ];

    private currentLanguageSubject = new BehaviorSubject<string>(this.DEFAULT_LANGUAGE);
    public currentLanguage$ = this.currentLanguageSubject.asObservable();

    constructor(private translate: TranslateService) {
        this.initializeLanguage();
    }

    private initializeLanguage(): void {
        // 从本地存储获取保存的语言，如果没有则使用默认语言
        const savedLanguage = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANGUAGE;
        this.setLanguage(savedLanguage);
    }

    public getAvailableLanguages(): LanguageOption[] {
        return [...this.availableLanguages];
    }

    public getCurrentLanguage(): string {
        return this.currentLanguageSubject.value;
    }

    public setLanguage(languageCode: string): void {
        if (this.availableLanguages.some((lang) => lang.code === languageCode)) {
            this.translate.use(languageCode);
            this.currentLanguageSubject.next(languageCode);
            localStorage.setItem(this.STORAGE_KEY, languageCode);
        }
    }

    public getCurrentLanguageOption(): LanguageOption | undefined {
        return this.availableLanguages.find((lang) => lang.code === this.getCurrentLanguage());
    }
}
