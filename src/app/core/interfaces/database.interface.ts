// src/app/core/interfaces/database.interface.ts
import { EntityTarget, ObjectLiteral, QueryBuilder } from 'typeorm';

/**
 * 数据库服务接口
 * 定义了数据库操作的标准契约，便于测试和实现替换
 */
export interface IDatabaseService {
  /**
   * 初始化数据库连接
   */
  initialize(): Promise<void>;

  /**
   * 为给定的实体创建一个新的查询构建器 (QueryBuilder)
   * @param entity 要查询的实体
   * @param alias 查询中实体的别名
   * @returns 一个 TypeORM QueryBuilder 实例
   */
  createQueryBuilder<T extends ObjectLiteral>(entity: EntityTarget<T>, alias: string): QueryBuilder<T>;

  /**
   * 执行一个会返回数据的查询 (SELECT)
   * 可以接受一个原始 SQL 字符串或一个 TypeORM QueryBuilder 实例
   * @param sqlOrQb SQL 查询语句或 QueryBuilder 实例
   * @param params 如果第一个参数是字符串，则为查询参数
   * @returns Promise<T[]> 查询结果数组
   */
  query<T>(sqlOrQb: string | QueryBuilder<any>, params?: any[]): Promise<T[]>;

  /**
   * 执行一个不会返回数据的操作 (INSERT, UPDATE, DELETE)
   * 可以接受一个原始 SQL 字符串或一个 TypeORM QueryBuilder 实例
   * @param sqlOrQb SQL 操作语句或 QueryBuilder 实例
   * @param params 如果第一个参数是字符串，则为操作参数
   * @returns Promise<{ changes: number, lastId: number }> 操作结果
   */
  execute(sqlOrQb: string | QueryBuilder<any>, params?: any[]): Promise<{ changes: number, lastId: number }>;
}
