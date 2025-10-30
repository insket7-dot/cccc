import { Injectable, signal, computed } from '@angular/core';
import { MenuType, OrderMode } from '@app/shared/constants/menu.constants';

@Injectable({ providedIn: 'root' })
export class ModelStateService {
    private readonly _curModel = signal<string>(MenuType.NORMAL);
    private readonly _curWay = signal<string>('');
    private readonly _deviceId = signal<string>('');

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
    }
}
