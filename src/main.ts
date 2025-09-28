import 'reflect-metadata';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from 'jeep-sqlite/loader';

if (Capacitor.getPlatform() === 'web') {
  // 注册自定义元素（同步 API），随后插入元素
  defineCustomElements(window);
  if (!document.querySelector('jeep-sqlite')) {
    const el = document.createElement('jeep-sqlite');
    document.body.appendChild(el);
  }
  
  // 等待元素完全就绪后再启动应用
  customElements.whenDefined('jeep-sqlite').then(() => {
    const jeepEl = document.querySelector('jeep-sqlite') as any;
    if (jeepEl?.componentOnReady) {
      return jeepEl.componentOnReady();
    }
  }).then(() => {
    // 元素完全就绪后再启动 Angular 应用
    bootstrapApplication(App, appConfig)
      .catch((err) => console.error(err));
  });
} else {
  // 非 Web 平台直接启动
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
}

