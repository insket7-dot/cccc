import { Injectable, signal, computed, inject } from '@angular/core';
import { MenuType, OrderMode } from '@app/shared/constants/menu.constants';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { Router } from '@angular/router';
import { AppUrlService } from '@app/shared/services/util/app.url.service';
import { DeviceIdLoadStatus } from '@app/shared/constants/app.enums';

@Injectable({ providedIn: 'root' })
export class ModelStateService {
    private readonly router = inject(Router);
    private readonly appUrlService = inject(AppUrlService);
    private readonly _curModel = signal<string>(MenuType.NORMAL);
    private readonly _curWay = signal<string>('');
    private readonly _deviceId = signal<string>('');
    private initialized = false;

    readonly curModelValue = computed(() => this._curModel());
    readonly curWayValue = computed(() => this._curWay());
    readonly deviceIdValue = computed(() => this._deviceId());

    // 普通模式
    readonly isNormal = computed(() => this.curModelValue() === MenuType.NORMAL);
    // 儿童、无障碍
    readonly isAccessibility = computed(() => this.curModelValue() === MenuType.ACCESSIBILITY);

    // 堂食
    readonly isDineIn = computed(() => this.curWayValue() === OrderMode.DINE_IN);
    // 外卖
    readonly isTakeOut = computed(() => this.curWayValue() === OrderMode.TAKE_OUT);

    /**
     * 确保设备ID已加载
     */
    async ensureDeviceIdLoaded(): Promise<DeviceIdLoadStatus> {
        const loginPath = this.appUrlService.getPageUrlValue('PAGE_LOGIN');
        const isSkipPages = [loginPath].some(
            (path) => this.router.url.startsWith(path) || this.router.url === path,
        );

        if (isSkipPages) {
            return DeviceIdLoadStatus.SKIPPED;
        }

        if (this.initialized) {
            return DeviceIdLoadStatus.LOADED;
        }

        try {
            await this.loadDeviceId();
            return DeviceIdLoadStatus.LOADED;
        } catch (error) {
            return DeviceIdLoadStatus.FAILED;
        }
    }

    /**
     * @desc 加载设备ID
     */
    private async loadDeviceId(): Promise<void> {
        try {
            const id: string | null = await LocalStorage.getItem(CacheKey.DEVICE_ID);
            console.log('加载设备ID:', id);
            if (id) {
                this._deviceId.set(id);
            }
            this.initialized = true;
        } catch (error) {
            console.error('读取设备ID失败:', error);
            this.initialized = false;
            throw error;
        }
    }

    // 暴露只读信号供组件使用
    get curModel() {
        return this._curModel.asReadonly();
    }

    get curWay() {
        return this._curWay.asReadonly();
    }

    get deviceId() {
        return this._deviceId.asReadonly();
    }

    setCurModel(model: string) {
        this._curModel.set(model);
    }
    setCurWay(way: string) {
        this._curWay.set(way);
    }

    setDeviceId(deviceId: string) {
        this._deviceId.set(deviceId);
        LocalStorage.setItem(CacheKey.DEVICE_ID, deviceId).catch((err) => {
            console.error('保存设备ID失败:', err);
        });
    }

    /**
     * @desc 清空选择状态
     */
    clearUserSelectState() {
        this.setCurModel(MenuType.NORMAL);
        this.setCurWay('');
    }
}
