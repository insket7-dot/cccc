// src/app/core/data/app-data-source.ts
import { DataSource } from 'typeorm';
import * as entities from '../../shared/entities';
import {MenuEntity, UserEntity} from "../../shared/entities"; // 从 "桶" 中导入所有实体

/**
 * 这是一个“虚拟”的 DataSource.
 * 我们只使用它来获取对查询构建器 (QueryBuilder) 的访问权限.
 * 实际的数据库连接由 sqlite.worker.ts 通过 Capacitor 插件处理.
 */
export const AppDataSource = new DataSource({
    type: 'sqljs',
    // entities: Object.values(entities), // 自动获取所有导出的实体
    entities: [MenuEntity, UserEntity],
    synchronize: false, // 我们在 worker 中手动管理数据库表的创建.
});
