import type { Url } from '@rydeen/angular-framework';

/**
 * 页面URL类型定义
 */
export interface PageUrls {
    PAGE_HOME: Url;
    PAGE_MENU: Url;
    PAGE_USERS: Url;
    PAGE_SCREEN: Url;
    PAGE_LOGIN: Url;
    PAGE_ORDER_CONFIRM: Url;
    PAGE_ORDER_SUBMIT: Url;
}

/**
 * API URL类型定义
 */
export interface ApiUrls {
    MENU_ALL: Url;
    STORE_INFO: Url;
    RESTAURANT_PAGE: Url;
    STORE_MENU: Url;
    BIND_DEVICE: Url;
    GET_RESOURCE: Url;
    HEART_BEAT: Url;
    STORE_BUS_TIME: Url;
    STORE_BASE_INFO: Url;
    API_ORDER_CONFIRM: Url;
}

/**
 * 所有URL的联合类型
 */
export type AppUrls = PageUrls & ApiUrls;

/**
 * URL键名类型
 */
export type UrlKey = keyof AppUrls;
