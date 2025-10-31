export const MENU_STORAGE_NAMESPACE = 'menu';

export const MenuStorageKeys = {
    INDEX: 'menu.index',
    BY_ID: 'menu.byId',
    BY_CATEGORY: 'menu.byCategory',
} as const;

export const MenuWorkerTimeout = {
    PROCESS_MS: 20000,
    SEARCH_MS: 10000,
} as const;
