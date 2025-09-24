import { Injectable } from '@angular/core';
import { LocalStorage } from '@rydeen/angular-framework';
import { MenuData } from '../../commons/types/menu.types';

@Injectable({ providedIn: 'root' })
export class WorkerSampleService {

  processMenu(items: MenuData[]): Promise<MenuData[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../../workers/menu.worker.ts', import.meta.url), { type: 'module' });
      const timeout = setTimeout(() => { worker.terminate(); reject(new Error('Worker timed out')); }, 20000);
      worker.onmessage = async (e: MessageEvent) => {
        clearTimeout(timeout);
        worker.terminate();
        const { ok, result, error } = e.data || {};
        if (!ok) { reject(new Error(error || 'Worker error')); return; }
        // 本地缓存：示例将索引与映射保存（命名空间 menu）
        await LocalStorage.setItem('menu.index', result.index, 'menu');
        await LocalStorage.setItem('menu.byId', result.byId, 'menu');
        await LocalStorage.setItem('menu.byCategory', result.byCategory, 'menu');
        // 组装业务友好的返回结构
        const byId: Record<string, MenuData> = result.byId as Record<string, MenuData>;
        const list: MenuData[] = Object.entries(byId).map(([id, v]) => ({ ...(v || {}), id }));
        resolve(list);
      };
      worker.onerror = (err) => { clearTimeout(timeout); worker.terminate(); reject(err); };
      worker.postMessage({ task: 'processMenu', payload: items });
    });
  }

  searchMenu(query: string): Promise<MenuData[]> {
    return new Promise(async (resolve, reject) => {
      const index = await LocalStorage.getItem<Record<string, string[]>>('menu.index', 'menu');
      const byId = await LocalStorage.getItem<Record<string, any>>('menu.byId', 'menu');
      const worker = new Worker(new URL('../../workers/menu.worker.ts', import.meta.url), { type: 'module' });
      const timeout = setTimeout(() => { worker.terminate(); reject(new Error('Worker timed out')); }, 10000);
      worker.onmessage = (e: MessageEvent) => {
        clearTimeout(timeout);
        worker.terminate();
        const { ok, result, error } = e.data || {};
        if (!ok) { reject(new Error(error || 'Worker error')); return; }
        let ids = result as string[];
        const kw = (query || '').trim().toLowerCase();
        // 额外：索引键的包含匹配（如分词差异导致key与用户输入不完全一致）
        if (kw && index) {
          Object.entries(index).forEach(([token, arr]) => {
            if (token.toLowerCase().includes(kw)) {
              ids = Array.from(new Set<string>([...ids, ...arr]));
            }
          });
        }
        // 兜底：基于名称/标签的包含匹配，防止索引未刷新导致漏查
        if (kw && byId) {
          const supplement: string[] = [];
          Object.entries(byId).forEach(([id, item]: [string, any]) => {
            const name: string = (item?.name || '').toLowerCase();
            const tags: string[] = Array.isArray(item?.tags) ? item.tags : [];
            const hit = name.includes(kw) || tags.some(t => String(t).toLowerCase().includes(kw));
            if (hit) supplement.push(id);
          });
          const set = new Set<string>([...ids, ...supplement]);
          ids = Array.from(set);
        }
        const items = (ids || [])
          .map((id) => ({ id, ...(byId?.[id] || {}) }))
          .filter((it) => it && it.name);
        resolve(items);
      };
      worker.onerror = (err) => { clearTimeout(timeout); worker.terminate(); reject(err); };
      worker.postMessage({ task: 'searchMenu', payload: { index: index || {}, query } });
    });
  }
}


