import {
    AbstractService,
    EventManager,
    RequestHeader,
    ResultVO,
    Url,
} from '@rydeen/angular-framework';
import { inject } from '@angular/core';
import { AppEvent } from '@app/core/constants/app.event';
import { ModelStateService } from '@app/shared/services/model-state.service';
import { DeviceIdLoadStatus } from '@app/shared/constants/app.enums';

export abstract class AbstractAppService extends AbstractService {
    private readonly eventManager = inject(EventManager);
    private readonly modelStateService = inject(ModelStateService);

    protected constructor() {
        super();
    }

    /**
     * 重写父类的HTTP请求方法，增强设备ID处理逻辑
     *
     * 该方法是一个异步泛型方法，用于发送HTTP请求并根据设备ID加载状态智能处理请求参数。
     * 核心功能包括：确保设备ID已加载、条件性添加设备ID参数到请求体、管理全局加载状态。
     *
     * @template T 响应数据的类型
     * @param {Url} url 请求URL配置对象，包含请求路径和名称等信息
     * @param {any} [body] 可选，请求体数据
     * @param {RequestHeader} [header] 可选，请求头配置
     * @returns {Promise<ResultVO<T>>} 返回一个Promise，解析为包含泛型T类型数据的结果对象
     *
     * @example
     * // 调用示例
     * const result = await this.request<UserInfo>(
     *   { name: 'GET_USER_INFO', path: '/api/user/info' },
     *   { userId: '123' },
     *   { 'Content-Type': 'application/json' }
     * );
     *
     * @remarks
     * 1. 设备ID处理：
     *    - 当设备ID加载状态为SKIPPED时（如登录页面），直接使用原始请求体
     *    - 其他情况下，自动添加deviceCode字段到请求体
     *
     * 2. 全局加载状态：
     *    - 除'HEART_BEAT'类型请求外，其他请求会触发全局加载指示器显示
     *    - 请求完成后自动隐藏加载指示器
     *
     * 3. 继承关系：
     *    - 该方法重写自AbstractService类的同名方法
     *    - 保留了父类的请求处理逻辑，同时增强了设备ID管理功能
     */
    override async request<T>(url: Url, body?: any, header?: RequestHeader): Promise<ResultVO<T>> {
        // 确保设备ID已加载
        const deviceIdLoadStatus = await this.modelStateService.ensureDeviceIdLoaded();

        // 构建请求数据，根据设备ID加载状态添加deviceCode
        // 如果设备ID加载状态为SKIPPED，直接使用原始body
        // 否则，添加deviceCode到请求体
        const data =
            deviceIdLoadStatus === DeviceIdLoadStatus.SKIPPED
                ? body
                : { ...body, deviceCode: this.modelStateService.deviceIdValue() };

        if (!['HEART_BEAT'].includes(url.name)) {
            this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, true);
        }

        return await super.request<T>(url, data, header, async () => {
            this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, false);
        });
    }
}
