import { Injectable } from '@angular/core';
import { LoggerManage, LoggerMessage } from '@rydeen/logger';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LogContext {
    private readonly _logger: LoggerManage;

    constructor() {
        this._logger = new LoggerManage({
            driver: environment.logDriverType,
            code: '',
            debug: environment.logDebug,
            host: environment.logHost,
            accessKey: environment.logAccessKey,
            accessSecret: environment.logAccessSecret,
            endpoint: environment.logEndpoint,
            apiVersion: environment.logApiVersion,
            region: environment.logRegion,
            groupName: environment.logGroupId,
            projectId: environment.logProjectId,
            storeName: environment.logStoreId,
        });
    }

    /**
     * 初始化日志组件
     * @param code 身份标识（比如：门店号、用户ID等）
     */
    initialize(code: string) {
        this._logger.code = code;
    }

    get logger(): LoggerManage {
        return this._logger;
    }

    /**
     * 发送调试日志（简单消息）
     * @param message 日志消息
     */
    info(message: string) {
        this._logger.info(message);
    }

    /**
     * 发送警告日志（简单消息）
     * @param message 日志消息
     */
    warn(message: string) {
        this._logger.warn(message);
    }

    /**
     * 发送错误日志（简单消息）
     * @param message 日志消息
     */
    error(message: string) {
        this._logger.error(message);
    }

    /**
     * 发送自定义日志
     * @param message 日志消息
     */
    send(message: LoggerMessage) {
        this._logger.send(message);
    }

    /**
     * 批量发送自定义日志
     * @param logs 日志列表
     */
    sendBatch(logs: LoggerMessage[]) {
        this._logger.sendBatch(logs);
    }
}
