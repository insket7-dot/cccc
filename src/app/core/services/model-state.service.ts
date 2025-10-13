import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModelStateService {
  private readonly _curModel = signal<string>('Normal');
  private readonly _curWay = signal<string>('');

  // 暴露只读信号供组件使用
  get curModel() {
    return this._curModel.asReadonly();
  }

  get curWay() {
    return this._curWay.asReadonly();
  }

  // 更新模型状态的方法
  setCurModel(model: string) {
    this._curModel.set(model);
  }
  setCurWay(way: string) {
    this._curWay.set(way);
  }
}
