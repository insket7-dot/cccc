import type { NullifyOptionals } from '../../../shared/types/type-utils';
import type { MenuModel } from '../../../shared/types/menu.shared.types';

export type MenuRow = NullifyOptionals<MenuModel>;

// 菜单模块的 Schema 定义（供 Kysely 使用）
export interface MenuDB {
    menus: MenuRow;
}


