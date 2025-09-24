import { Injectable } from '@angular/core';
import { MenuWorkerTimeout } from '../constants/menu.constants';
import { MenuData } from "../../../shared/types/menu.shared.types";

// 定义 Worker 返回的增强型菜单数据类型
export type MenuWithKeywords = MenuData & { keywords: string };

@Injectable({ providedIn: 'root' })
export class MenuWorkerService {

  /**
   * 调用 Web Worker 为菜单项数组添加 'keywords' 字段.
   * @param items 原始菜单数据数组
   * @returns 一个 Promise，解析为带有 'keywords' 字段的菜单数据数组
   */
  addKeywordsToMenus(items: MenuData[]): Promise<MenuWithKeywords[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../workers/menu.worker.ts', import.meta.url), { type: 'module' });
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Worker for adding keywords timed out'));
      }, MenuWorkerTimeout.PROCESS_MS);

      worker.onmessage = (e: MessageEvent) => {
        clearTimeout(timeout);
        worker.terminate();
        const { ok, result, error } = e.data || {};
        if (ok) {
          resolve(result as MenuWithKeywords[]);
        } else {
          reject(new Error(error || 'Worker failed to add keywords'));
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(err);
      };

      worker.postMessage({ task: 'addKeywords', payload: items });
    });
  }
}
