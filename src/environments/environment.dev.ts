import { DriverType } from '@rydeen/logger';

export const environment = {
    /** 是否生产环境 */
    production: false,
    /** 是否启用mock数据 */
    mock: false,
    /** 后台服务接口地址 */
    dynamicUrl: 'https://staging.yakiapp.io/',
    /** 资源包版本号 */
    assetsVersion: '20251119',
    /** App版本号 */
    appVersion: '1.0.0',
    /** 最大可用版本号 */
    maxVersionCode: '32',
    /** 最小可用版本Code */
    minVersionName: '1.0.0',
    /** 最小可用版本号 */
    minVersionCode: '1',
    /** 版本更新检查接口 */
    checkPatchUrl: '',
    /** 运行版本上报接口 */
    versionReportUrl: '',
    /** 发布补丁接口 */
    patchServerUrl: '',
    /** 文件桶基础地址 */
    bucketBaseUrl: '',
    /** 补丁存放路径 */
    patchPathKey: '',
    /** 国际化资源文件存放路径 */
    i18nPathKey: 'assets/i18n',
    /** 日志驱动类型 */
    logDriverType: DriverType.CONSOLE,
    /** 客户端标识 */
    logClientCode: '',
    /** 云日志项目ID */
    logProjectId: 'rydeen-sxx',
    /** 云日志分组名 */
    logGroupId: 'app-log-prod',
    /** 云日志储存库名 */
    logStoreId: 'rydeen-sxx-frontend',
    /** 云日志服务域名 */
    logHost: 'cn-shanghai.log.aliyuncs.com',
    /** 云日志服务端点 */
    logEndpoint: 'cn-shanghai.log.aliyuncs.com',
    /** 云日志服务区域 */
    logRegion: 'cn-shanghai',
    /** 云日志服务访问KEY */
    logAccessKey: '',
    /** 云日志服务访问秘钥 */
    logAccessSecret: '',
    /** 云日志服务版本 */
    logApiVersion: '',
    /** 调试日志等级 */
    logDebug: false,
};
