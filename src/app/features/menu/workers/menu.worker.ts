// 菜单处理示例：为菜单项添加用于全文搜索的关键词

type MenuItem = { id: string; name: string; category: string; price: number; tags?: string[] };
type MenuItemWithKeywords = MenuItem & { keywords: string };

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ctx: DedicatedWorkerGlobalScope = self as any;

function tokenize(text: string): string[] {
    const t = (text || '').toLowerCase();
    return Array.from(new Set(t.split(/[^a-z0-9\u4e00-\u9fa5]+/).filter(Boolean)));
}

/**
 * 为菜单项数组添加 'keywords' 字段.
 * 'keywords' 字段是一个由名称和标签分词后组成的、空格分隔的字符串.
 * @param items 原始菜单项数组
 * @returns 带有 'keywords' 字段的菜单项数组
 */
function addKeywordsToMenus(items: MenuItem[]): MenuItemWithKeywords[] {
    return items.map((item) => {
        const tokens = new Set<string>([
            ...tokenize(item.name),
            ...(item.tags || []).flatMap(tokenize),
        ]);
        return {
            ...item,
            keywords: Array.from(tokens).join(' '),
        };
    });
}

ctx.onmessage = async (e: MessageEvent) => {
    const { task, payload } = e.data || {};
    try {
        switch (task) {
            case 'addKeywords': {
                const items: MenuItem[] = Array.isArray(payload) ? payload : [];
                // 模拟CPU密集型处理的耗时
                await new Promise((r) => setTimeout(r, 200));
                const processedItems = addKeywordsToMenus(items);
                ctx.postMessage({ ok: true, result: processedItems });
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
