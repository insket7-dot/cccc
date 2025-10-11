import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModelStateService {
  private readonly _curModel = signal<string>('Normal');

  // 暴露只读信号供组件使用
  get curModel() {
    return this._curModel.asReadonly();
  }

  // 更新模型状态的方法
  setCurModel(model: string) {
    this._curModel.set(model);
  }
}
