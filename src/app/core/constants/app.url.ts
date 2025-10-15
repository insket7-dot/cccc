import { Method, Url } from '@rydeen/angular-framework';

/**
 * 前端页面地址枚举类
 */
export class AppUrl {
    public static readonly API_PREFIX: string = '/xxx/xxx';

    /** 页面导航：登录页地址页 */
    public static readonly PAGE_HOME: Url = new Url('PAGE_HOME', 'home', Method.NAVIGATOR);

    public static readonly PAGE_MENU: Url = new Url('PAGE_MENU', 'menu', Method.NAVIGATOR);

    public static readonly PAGE_USERS: Url = new Url('PAGE_USERS', 'users', Method.NAVIGATOR);

    public static readonly PAGE_SCREEN: Url = new Url('PAGE_SCREEN', 'screen', Method.NAVIGATOR);

    public static readonly PAGE_LOGIN: Url = new Url('PAGE_LOGIN', 'login', Method.NAVIGATOR);

    /** Mock 菜单：全量菜单 */
    public static readonly MENU_ALL: Url = new Url('MENU_ALL', '/api/menu/all', Method.GET);
    public static readonly MENU_ALL_TW: Url = new Url(
        'MENU_ALL_TW',
        '/api/menu/tw-all',
        Method.GET,
    );
    /** Mock 门店信息 */
    public static readonly STORE_INFO: Url = new Url('STORE_INFO', '/api/store/info', Method.GET);

    public static readonly RESTAURANT_PAGE: Url = new Url(
        'RESTAURANT_PAGE',
        '/store/restaurant/page',
        Method.GET,
    );
    public static readonly BINDDEVICE: Url = new Url(
        'BIND_DEVICE',
        '/yakiSer/o2o/yaki-out/device/bind',
        Method.POST,
    );
    public static readonly GET_RESOURCE: Url = new Url(
        'GET_RESOURCE',
        '/yakiSer/o2o/yaki-out/resource/get',
        Method.POST,
    );
}
