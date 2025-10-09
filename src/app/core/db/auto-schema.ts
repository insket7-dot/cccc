/// <reference types="vite/client" />
// 自动 Schema 扫描和合并
// 使用 Vite 的 import.meta.glob 和 TypeScript 的类型合并

import { BaseDB } from './base-schema';

// 收集 features/**/schemas/*.schema.ts（构建期静态收集）
const schemaModules = import.meta.glob('../../features/**/schemas/*.schema.ts', { eager: true });

type SchemaModule = Record<string, unknown>;

type DiscoveredSchema = {
    moduleName: string;
    schemas: Array<{ name: string; definition: Record<string, unknown> }>;
};

function discoverSchemas(): DiscoveredSchema[] {
    const result: DiscoveredSchema[] = [];

    Object.entries(schemaModules).forEach(([path, mod]) => {
        const m = mod as SchemaModule;
        const names = Object.keys(m).filter((k) => k.endsWith('DB'));
        result.push({
            moduleName: path.replace(/^.*features\//, '').replace(/\.schema\.ts$/, ''),
            schemas: names.map((name) => ({ name, definition: (m[name] ?? {}) as Record<string, unknown> })),
        });
    });

    return result;
}

// 自动扫描结果
export const autoDiscoveredSchemas = discoverSchemas();

// 导出自动扫描的 Schema 信息（用于调试和验证）
export function getSchemaInfo() {
    return {
        totalFiles: Object.keys(schemaModules).length,
        schemas: autoDiscoveredSchemas.map((s) => ({ module: s.moduleName, schemas: s.schemas.map((x) => x.name) })),
    };
}

// 类型合并仍靠显式类型导入，保证 TS 类型安全（仅类型导入）
import type { MenuDB } from '../../features/menu/schemas/menu.schema';
import type { UserDB } from '../../features/users/schemas/user.schema';
// import type { OrderDB } from '../../features/orders/schemas/order.schema';

export interface AutoDB extends BaseDB, MenuDB, UserDB /* , OrderDB */ {}

export type DB = AutoDB;