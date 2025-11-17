import { Method, Url } from '@rydeen/angular-framework';
import { environment } from '@/environments/environment';

/**
 * 前端页面地址枚举类
 */
export class AppUrl {
    public static readonly API_PREFIX: string = 'o2o/yaki-out';

    /** 页面导航：登录页地址页 */
    public static readonly PAGE_HOME: Url = new Url('PAGE_HOME', 'home', Method.NAVIGATOR);

    public static readonly PAGE_MENU: Url = new Url('PAGE_MENU', 'menu', Method.NAVIGATOR);

    public static readonly PAGE_USERS: Url = new Url('PAGE_USERS', 'users', Method.NAVIGATOR);

    public static readonly PAGE_SCREEN: Url = new Url('PAGE_SCREEN', 'screen', Method.NAVIGATOR);

    public static readonly PAGE_LOGIN: Url = new Url('PAGE_LOGIN', 'login', Method.NAVIGATOR);

    public static readonly PAGE_ORDER_CONFIRM: Url = new Url(
        'PAGE_ORDER_CONFIRM',
        'orderConfirm',
        Method.NAVIGATOR,
    );
    public static readonly PAGE_ORDER_SUBMIT: Url = new Url(
        'PAGE_ORDER_SUBMIT',
        'submitOrder',
        Method.NAVIGATOR,
    );

    /**
     * @desc 拼接完整请求url方法
     */
    private static requestFullUrl(url: string): string {
        return `${environment.dynamicUrl}${AppUrl.API_PREFIX}${url}`;
    }

    /** Mock 菜单：全量菜单 */
    public static readonly MENU_ALL: Url = new Url('MENU_ALL', '/api/menu/all', Method.GET);

    /** Mock 门店信息 */
    public static readonly STORE_INFO: Url = new Url('STORE_INFO', '/api/store/info', Method.GET);

    public static readonly RESTAURANT_PAGE: Url = new Url(
        'RESTAURANT_PAGE',
        '/store/restaurant/page',
        Method.GET,
    );

    /**
     * @desc 门店菜单接口
     */
    public static readonly STORE_MENU: Url = new Url(
        'STORE_MENU',
        AppUrl.requestFullUrl('/menu/baseInfo'),
        Method.GET,
    );

    /**
     * @desc 绑定设备
     */
    public static readonly BIND_DEVICE: Url = new Url(
        'BIND_DEVICE',
        AppUrl.requestFullUrl('/device/bind'),
        Method.POST,
    );

    /**
     * @desc 门店轮播图
     */
    public static readonly GET_RESOURCE: Url = new Url(
        'GET_RESOURCE',
        AppUrl.requestFullUrl('/resource/get'),
        Method.POST,
    );

    /**
     * @desc 心跳接口
     */
    public static readonly HEART_BEAT: Url = new Url(
        'HEART_BEAT',
        AppUrl.requestFullUrl('/device/heartBeat'),
        Method.GET,
    );

    /**
     * @desc 门店营业时间
     */
    public static readonly STORE_BUS_TIME: Url = new Url(
        'STORE_BUS_TIME',
        AppUrl.requestFullUrl('/store/bus/time'),
        Method.GET,
    );

    /**
     * @desc 门店基础信息
     */
    public static readonly STORE_BASE_INFO: Url = new Url(
        'STORE_BASE_INFO',
        AppUrl.requestFullUrl('/store/baseInfo'),
        Method.GET,
    );

    /**
     * @desc 订单确认
     */
    public static readonly API_ORDER_CONFIRM: Url = new Url(
        'API_ORDER_CONFIRM',
        AppUrl.requestFullUrl('/submitOrder'),
        Method.POST,
    );
}
