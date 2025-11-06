import { Inject, Injectable } from '@angular/core';
import { APP_URLS } from '@app/core/tokens/app.url.token';
import { AppUrl } from '@app/core/constants/app.url';
import { ApiUrls, PageUrls } from '@app/shared/types/url.types';
import { Url } from '@rydeen/angular-framework';

@Injectable({ providedIn: 'root' })
export class AppUrlService {
    constructor(@Inject(APP_URLS) private readonly appUrl: typeof AppUrl) {}

    /**
     * 获取AppUrl对象的属性访问器
     */
    get url(): typeof AppUrl {
        return this.appUrl;
    }

    /**
     * 获取页面URL对象
     * @param key 页面URL的键名
     * @returns Url对象
     */
    getPageUrl(key: keyof PageUrls): Url {
        return this.appUrl[key];
    }

    /**
     * 获取页面URL字符串值
     * @param key 页面URL的键名
     * @returns URL字符串
     */
    getPageUrlValue(key: keyof PageUrls): string {
        return `/${this.getPageUrl(key).value()}`;
    }

    /**
     * 获取API URL对象
     * @param key API URL的键名
     * @returns Url对象
     */
    getApiUrl(key: keyof ApiUrls): Url {
        return this.appUrl[key];
    }

    /**
     * 获取API URL字符串值
     * @param key API URL的键名
     * @returns URL字符串
     */
    getApiUrlValue(key: keyof ApiUrls): string {
        return this.getApiUrl(key).value();
    }

    /**
     * 检查页面URL键是否有效
     * @param key 要检查的键名
     * @returns 是否有效
     */
    isValidPageUrl(key: string): key is keyof PageUrls {
        return key in this.appUrl;
    }

    /**
     * 检查API URL键是否有效
     * @param key 要检查的键名
     * @returns 是否有效
     */
    isValidApiUrl(key: string): key is keyof ApiUrls {
        return key in this.appUrl;
    }
}
