import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import {routes} from './app.routes';
import {TranslateLoader, TranslationObject, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {Observable, switchMap, of} from "rxjs";
import {environment} from "../environments/environment";
import {MockInterceptor, provideMock} from "@rydeen/angular-framework";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

/**
 * 自定义翻译加载器 - ngx-translate 17.0.0 版本
 */
export class CustomTranslateLoader implements TranslateLoader {
    constructor(private httpClient: HttpClient,
                public prefix: string = '/assets/i18n/',
                public suffix: string = '.json') {
    }

    public getTranslation(lang: string): Observable<TranslationObject> {
        // 统一使用小写语言码，匹配文件名（如 zh-cn.json、en-us.json）
        const normalized = String(lang || '').toLowerCase();
        const base = this.prefix.endsWith('/') ? this.prefix : `${this.prefix}/`;
        return this.httpClient
            .get<TranslationObject>(`${base}${normalized}${this.suffix}`)
            .pipe(switchMap(translations => of(translations)));
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
        provideZoneChangeDetection({eventCoalescing: true}),
        ...TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            fallbackLang: 'zh-cn'
        }).providers!,
        ...provideMock(),
        { provide: HTTP_INTERCEPTORS, useClass: MockInterceptor, multi: true }
    ]
};
