import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
    inject,
    EnvironmentInjector,
    LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { MigrationService } from './core/services/migration.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DATABASE_SERVICE } from './core/tokens/database.token';
import { DatabaseService } from './core/services/database.service';
import { WebDatabaseService } from './core/services/web-database.service';
import { Capacitor } from '@capacitor/core';
import { registerLocaleData } from '@angular/common';
import localeZh from '@angular/common/locales/zh-Hans';
import localeEn from '@angular/common/locales/en';
import localeZhTw from '@angular/common/locales/zh-Hant';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import {
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
    MomentDateAdapter,
} from '@angular/material-moment-adapter';


export const CUSTOM_DATE_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD',
    },
    display: {
        dateInput: 'YYYY-MM-DD',
        monthYearLabel: 'YYYY年MM月',
        dateA11yLabel: 'YYYY年MM月DD日',
        monthYearA11yLabel: 'YYYY年MM月',
    },
};

import { routes } from './app.routes';
import { TranslateLoader, TranslationObject, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
import { environment } from '@/environments/environment';
import { MockInterceptor, provideMock } from '@rydeen/angular-framework';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LanguageService } from './core/services/language.service';

// 注册本地化数据
registerLocaleData(localeZh, 'zh-cn');
registerLocaleData(localeEn, 'en-us');
registerLocaleData(localeZhTw, 'zh-tw');

/**
 * 自定义翻译加载器
 */
export class CustomTranslateLoader implements TranslateLoader {
    constructor(
        private httpClient: HttpClient,
        public prefix: string = '/assets/i18n/',
        public suffix: string = '.json',
    ) {}

    public getTranslation(lang: string): Observable<TranslationObject> {
        // 统一使用小写语言码，匹配文件名（如 zh-cn.json、en-us.json）
        const normalized = String(lang || '').toLowerCase();
        const base = this.prefix.endsWith('/') ? this.prefix : `${this.prefix}/`;
        return this.httpClient
            .get<TranslationObject>(`${base}${normalized}${this.suffix}`)
            .pipe(switchMap((translations) => of(translations)));
    }
}

/**
 * 创建自定义翻译加载器工厂函数
 */
export function createTranslateLoader(http: HttpClient): TranslateLoader {
    return new CustomTranslateLoader(http, environment.i18nPathKey || '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routes),
        provideBrowserGlobalErrorListeners(),
        provideAnimationsAsync(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        ...TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
            fallbackLang: 'zh-cn',
        }).providers!,
        // ...provideMock(), // 本地mock 拦截器
        { provide: HTTP_INTERCEPTORS, useClass: MockInterceptor, multi: true },
        // 显式提供两种实现，供 EnvironmentInjector 动态解析
        WebDatabaseService,
        DatabaseService,
        MigrationService,
        LanguageService,
        {
            provide: DATABASE_SERVICE,
            useFactory: () => {
                const injector = inject(EnvironmentInjector);
                return Capacitor.getPlatform() === 'web'
                    ? injector.get(WebDatabaseService)
                    : injector.get(DatabaseService);
            },
        },
        // Angular Material 国际化配置
        {
            provide: LOCALE_ID,
            useFactory: () => {
                const languageService = inject(LanguageService);
                return languageService.getCurrentLanguage();
            },
        },
        {
            provide: MAT_DATE_LOCALE,
            useFactory: () => {
                const languageService = inject(LanguageService);
                return languageService.getCurrentLanguage();
            },
        },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: CUSTOM_DATE_FORMATS,
        },
        {
            provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
            useValue: { useUtc: true },
        },
    ],
};
