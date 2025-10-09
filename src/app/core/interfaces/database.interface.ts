// src/app/core/interfaces/database.interface.ts

/**
 * 数据库操作结果接口
 */
export interface DatabaseResult {
    changes: number;
    lastId: number;
    executionTime: number;
}

/**
 * 批量插入配置接口
 */
export interface BatchInsertConfig {
    /** 每批处理的数据条数，默认1000 */
    batchSize?: number;
    /** 是否在每批之间提交事务，默认true */
    commitPerBatch?: boolean;
    /** 是否忽略重复数据，默认false */
    ignoreDuplicates?: boolean;
}

/**
 * 批量插入结果接口
 */
export interface BatchInsertResult {
    /** 总插入条数 */
    totalInserted: number;
    /** 总批次数 */
    batches: number;
    /** 执行时间（毫秒） */
    executionTime: number;
}

/**
 * 已编译查询对象
 */
export interface CompiledQuery {
    sql: string;
    parameters: readonly unknown[];
}

/**
 * 可编译查询对象（构建器）
 * 约束：必须通过 compile() 生成 CompiledQuery，禁止直接传入 SQL 字符串
 */
export interface BuildableQuery {
    compile(): CompiledQuery;
}

/**
 * 数据库服务接口
 * 定义了数据库操作的标准契约，便于测试和实现替换
 * 
 * 设计原则：
 * 1. 强制使用查询构建器，避免直接编写SQL字符串
 * 2. 类型安全，所有操作都有完整的类型定义
 * 3. 统一接口，支持不同平台的数据库实现
 */
export interface IDatabaseService {

    /** 初始化数据库插件 */
    initializePlugin(): Promise<boolean>;

    /** 获取当前应用平台 */
    getPlatform(): string;

    /** 初始化数据库连接 */
    initialize(): Promise<void>;

    // ==================== 推荐使用的方法 ====================

    /** 执行查询构建器并返回结果 */
    query<T>(query: BuildableQuery): Promise<T[]>;

    /** 执行插入构建器并返回结果 */
    insert(query: BuildableQuery): Promise<DatabaseResult>;

    /** 执行更新构建器并返回结果 */
    update(query: BuildableQuery): Promise<DatabaseResult>;

    /** 执行删除构建器并返回结果 */
    delete(query: BuildableQuery): Promise<DatabaseResult>;

    /** 批量插入记录 */
    batchInsert(
        query: BuildableQuery,
        config?: BatchInsertConfig
    ): Promise<BatchInsertResult>;

    // ==================== 事务管理 ====================
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    inTransaction(): boolean;

    // ==================== 工具方法 ====================
    transaction<T>(operations: () => Promise<T>): Promise<T>;
    tableExists(tableName: string): Promise<boolean>;
    getTableColumns(tableName: string): Promise<Array<{name: string, type: string, nullable: boolean}>>;

    // ==================== 迁移专用方法 ====================
    executeRaw(sql: string, params?: any[]): Promise<DatabaseResult>;
    queryRaw<T>(sql: string, params?: any[]): Promise<T[]>;
}
