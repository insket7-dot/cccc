// Home 模块 UI 常量：统一维护 data-id，避免魔法字符串
export const HomeUi = {
    syncMenu: 'home.syncMenu',
    searchInput: 'home.searchInput',
    searchBtn: 'home.searchBtn',
} as const;

export type HomeUiKey = keyof typeof HomeUi;

