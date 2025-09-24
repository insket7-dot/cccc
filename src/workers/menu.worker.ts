// 菜单处理示例：构建查询索引与分类映射，并提供查询能力

type MenuItem = { id: string; name: string; category: string; price: number; tags?: string[] };
type ProcessedMenu = {
  byId: Record<string, MenuItem>;
  byCategory: Record<string, string[]>; // category -> itemIds
  index: Record<string, string[]>; // token -> itemIds
  count: number;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ctx: DedicatedWorkerGlobalScope = self as any;

function tokenize(text: string): string[] {
  const t = (text || '').toLowerCase();
  return Array.from(new Set(t.split(/[^a-z0-9\u4e00-\u9fa5]+/).filter(Boolean)));
}

function buildIndex(items: MenuItem[]): ProcessedMenu {
  const byId: Record<string, MenuItem> = {};
  const byCategory: Record<string, string[]> = {};
  const index: Record<string, string[]> = {};
  for (const item of items) {
    byId[item.id] = item;
    (byCategory[item.category] ||= []).push(item.id);
    const tokens = new Set<string>([
      ...tokenize(item.name),
      ...(item.tags || []).flatMap(tokenize)
    ]);
    for (const tk of tokens) {
      (index[tk] ||= []).push(item.id);
    }
  }
  // 排序以稳定
  for (const k of Object.keys(byCategory)) byCategory[k].sort();
  for (const k of Object.keys(index)) index[k] = Array.from(new Set(index[k])).sort();
  return { byId, byCategory, index, count: items.length };
}

function searchIds(index: Record<string, string[]>, query: string): string[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  let result: string[] | null = null;
  for (const tk of tokens) {
    const ids = index[tk] || [];
    result = result == null ? ids.slice() : result.filter((id) => ids.includes(id));
    if (result.length === 0) break;
  }
  return Array.from(new Set(result || [])).sort();
}

ctx.onmessage = async (e: MessageEvent) => {
  const { task, payload } = e.data || {};
  try {
    switch (task) {
      case 'processMenu': {
        const items: MenuItem[] = Array.isArray(payload) ? payload : [];
        // 模拟初始化耗时
        await new Promise((r) => setTimeout(r, 200));
        const processed = buildIndex(items);
        ctx.postMessage({ ok: true, result: processed });
        break;
      }
      case 'searchMenu': {
        const { index, query } = payload || {};
        const ids = searchIds(index || {}, String(query || ''));
        ctx.postMessage({ ok: true, result: ids });
        break;
      }
      default:
        ctx.postMessage({ ok: false, error: 'Unknown task' });
    }
  } catch (err: any) {
    ctx.postMessage({ ok: false, error: String(err?.message || err) });
  }
};

export {};
