console.time('total-load');
console.time('reflect-metadata');
import 'reflect-metadata';
console.timeEnd('reflect-metadata');
console.timeEnd('total-load');
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@app/app.config';
import { App } from '@app/app';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

console.log('Starting application initialization...');

// 初始化 jeep-sqlite
jeepSqlite(window);
console.log('jeep-sqlite custom elements defined');

// 添加延迟确保 jeep-sqlite 完全初始化
setTimeout(() => {
    bootstrapApplication(App, appConfig).catch((err: any) => {
        console.error('Bootstrap application failed:', err);
    });
}, 500);
