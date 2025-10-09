import { DriverType } from '@rydeen/logger';

export const environment = {
    /** 是否生产环境 */
    production: false,
    /** 是否启用mock数据 */
    mock: true,
    /** 后台服务接口地址 */
    dynamicUrl: '/',
    /** 资源包版本号 */
    assetsVersion: '20240615',
    /** App版本号 */
    appVersion: '3.0.0',
    /** 最大可用版本号 */
    maxVersionCode: '7',
    /** 最小可用版本Code */
    minVersionName: '3.0.0',
    /** 最小可用版本号 */
    minVersionCode: '1',
    /** 版本更新检查接口 */
    checkPatchUrl: 'http://10.20.1.68:8888/version/live-updates',
    /** 运行版本上报接口 */
    versionReportUrl: 'http://10.20.1.68:8888/version/report',
    /** 发布补丁接口 */
    patchServerUrl: 'https://sxx-v3.rydeen.com.cn/general/version/report',
    /** 文件桶基础地址 */
    bucketBaseUrl: 'https://sxx-bucket.rydeen.com.cn/',
    /** 补丁存放路径 */
    patchPathKey: 'sxx/patch_dev/',
    /** 国际化资源文件存放路径 */
    i18nPathKey: 'sxx/i18n/test',
    /** 日志驱动类型 */
    logDriverType: DriverType.CONSOLE,
    /** 客户端标识 */
    logClientCode: '',
    /** 云日志项目ID */
    logProjectId: '',
    /** 云日志分组名 */
    logGroupId: '',
    /** 云日志储存库名 */
    logStoreId: '',
    /** 云日志服务域名 */
    logHost: '',
    /** 云日志服务端点 */
    logEndpoint: '',
    /** 云日志服务区域 */
    logRegion: '',
    /** 云日志服务访问KEY */
    logAccessKey: '',
    /** 云日志服务访问秘钥 */
    logAccessSecret: '',
    /** 云日志服务版本 */
    logApiVersion: '',
    /** 调试日志等级 */
    logDebug: false,
};
