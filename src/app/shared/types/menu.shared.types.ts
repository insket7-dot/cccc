export interface MenuModel {
    id: string;
    name: string;
    category: string;
    price: number;
    tags?: string[];
    keywords?: string[];
    created_at?: string;
    updated_at?: string;
}

export const MenuTable = 'menus' as const;
export const MenuFields = {
    id: 'id',
    name: 'name',
    category: 'category',
    price: 'price',
    tags: 'tags',
    keywords: 'keywords',
    created_at: 'created_at',
    updated_at: 'updated_at',
} as const;
export type MenuFieldKey = keyof typeof MenuFields;


export interface MenuData {
    id: string;
    name: string;
    category: string;
    price: number;
    tags?: string[];
    keywords?: string[];
}
