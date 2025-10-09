import { EventNameEnum } from '@rydeen/angular-framework';

/** 全局应用事件 */
export class AppEvent extends EventNameEnum {
    /** 控制全局加载遮罩显隐 */
    static SHOW_GLOBAL_LOADING = new AppEvent('SHOW_GLOBAL_LOADING', 'app.showGlobalLoading');

    /** 语言切换 */
    static readonly EVENT_LANGUAGES = new AppEvent('EVENT_LANGUAGES', 'event_languages');
    /** 语言切换刷新 */
    static readonly EVENT_LANGUAGES_REFRESH = new AppEvent(
        'EVENT_LANGUAGES_REFRESH',
        'event_languages_refresh',
    );
    /** 打印设置 */
    static readonly EVENT_PRINTER_CONFIG = new AppEvent(
        'EVENT_PRINTER_CONFIG',
        'event_printer_config',
    );
    /** 帮助 */
    static readonly EVENT_HELP_FEEDBACK = new AppEvent(
        'EVENT_HELP_FEEDBACK',
        'event_help_feedback',
    );
    /** 版本更新 */
    static readonly EVENT_CHECK_UPDATE = new AppEvent('EVENT_CHECK_UPDATE', 'event_check_update');
    /** 关于 */
    static readonly EVENT_ABOUT = new AppEvent('EVENT_ABOUT', 'event_about');
    /**日期格式设置 */
    static readonly EVENT_SET_DATE_FORMAT = new AppEvent(
        'EVENT_SET_DATE_FORMAT',
        'event_set_date_format',
    );
    /** 登出 */
    static readonly EVENT_LOGOUT = new AppEvent('EVENT_LOGOUT', 'event_logout');
    /** 页面刷新 */
    static readonly EVENT_PAGE_REFRESH = new AppEvent('EVENT_PAGE_REFRESH', 'event_page_refresh');
    /** 重新加载打印机数据 */
    static readonly EVENT_RELOAD_PRINTER = new AppEvent(
        'EVENT_RELOAD_PRINTER',
        'event_reload_printer',
    );
    /**升级资源包下载进度*/
    static readonly EVENT_DOWNLOAD_PROGRESS = new AppEvent(
        'EVENT_DOWNLOAD_PROGRESS',
        'EVENT_DOWNLOAD_PROGRESS',
    );

    private constructor(name: string, value: string) {
        super(name, value);
    }
}
