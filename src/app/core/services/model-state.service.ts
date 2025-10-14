import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModelStateService {
  private readonly _curModel = signal<string>('Normal');
  private readonly _curWay = signal<string>('');
  private readonly _deviceId = signal<string>('');

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
