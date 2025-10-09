// src/app/core/services/database.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IDatabaseService, BuildableQuery, CompiledQuery, DatabaseResult, BatchInsertResult, BatchInsertConfig } from '../interfaces/database.interface';
import { Capacitor } from '@capacitor/core';

// --- 类型定义 ---
export interface DbOperation {
    type: 'query' | 'execute' | 'insert' | 'update' | 'delete' | 'batchInsert' | 'beginTransaction' | 'commit' | 'rollback' | 'tableExists' | 'getTableColumns';
    sql?: string;
    params?: any[];
    query?: CompiledQuery;
    config?: BatchInsertConfig;
    tableName?: string;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}

@Injectable()
export class DatabaseService implements IDatabaseService {
    private worker: Worker | null = null;
    private isInitialized = false;
    private operationQueue: DbOperation[] = [];
    private readonly dbReady = new Subject<void>();
    private inTransactionFlag = false;

    constructor() {}

    initializePlugin(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getPlatform(): string {
        return Capacitor.getPlatform();
    }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Capacitor.getPlatform() === 'web') {
                reject('DatabaseService can only be used on native platforms');
                return;
            }
            if (typeof Worker !== 'undefined') {
                this.worker = new Worker(
                    new URL('../../../workers/sqlite.worker', import.meta.url),
                    { type: 'module' },
                );
                this.worker.onmessage = ({ data }) => this.handleWorkerMessage(data);
                this.worker.onerror = (error) => {
                    console.error('[DatabaseService] Worker error:', error);
                    this.isInitialized = false;
                };
                this.init();
                resolve();
            } else {
                reject('Web Workers are not supported in this environment.');
            }
        });
    }

    /**
     * 初始化数据库连接 (由构造函数自动调用)
     */
    private init(): void {
        if (this.isInitialized || !this.worker) return;
        this.worker.postMessage({ type: 'init' });
    }

    // ==================== 推荐使用的方法 ====================

    /**
     * 执行查询构建器并返回结果
     * @param query 已编译的查询对象
     * @returns Promise<T[]> 查询结果数组
     */
    public async query<T>(query: BuildableQuery): Promise<T[]> {
        const c = query.compile();
        return this.postOperation({ type: 'query', sql: c.sql, params: [...c.parameters] });
    }

    /**
     * 执行插入构建器并返回结果
     * @param query 已编译的插入查询对象
     * @returns Promise<DatabaseResult> 插入结果
     */
    public async insert(query: BuildableQuery): Promise<DatabaseResult> {
        const c = query.compile();
        return this.postOperation({ type: 'insert', sql: c.sql, params: [...c.parameters] });
    }

    /**
     * 执行更新构建器并返回结果
     * @param query 已编译的更新查询对象
     * @returns Promise<DatabaseResult> 更新结果
     */
    public async update(query: BuildableQuery): Promise<DatabaseResult> {
        const c = query.compile();
        return this.postOperation({ type: 'update', sql: c.sql, params: [...c.parameters] });
    }

    /**
     * 执行删除构建器并返回结果
     * @param query 已编译的删除查询对象
     * @returns Promise<DatabaseResult> 删除结果
     */
    public async delete(query: BuildableQuery): Promise<DatabaseResult> {
        const c = query.compile();
        return this.postOperation({ type: 'delete', sql: c.sql, params: [...c.parameters] });
    }

    /**
     * 批量插入记录
     * @param query 已编译的插入查询对象（包含批量数据）
     * @param config 批量插入配置
     * @returns Promise<BatchInsertResult> 批量插入结果
     */
    public async batchInsert(
        query: BuildableQuery, 
        config?: BatchInsertConfig
    ): Promise<BatchInsertResult> {
        const c = query.compile();
        return this.postOperation({ 
            type: 'batchInsert', 
            sql: c.sql, 
            params: [...c.parameters],
            config 
        });
    }

    // ==================== 迁移专用方法 ====================

    /**
     * 执行原始SQL语句（仅用于数据库迁移）
     * @param sql SQL语句
     * @param params 参数
     * @returns Promise<DatabaseResult> 执行结果
     */
    public async executeRaw(sql: string, params?: any[]): Promise<DatabaseResult> {
        return this.postOperation({ type: 'execute', sql, params });
    }

    /**
     * 执行原始查询语句（仅用于数据库迁移）
     * @param sql SQL查询语句
     * @param params 参数
     * @returns Promise<T[]> 查询结果
     */
    public async queryRaw<T>(sql: string, params?: any[]): Promise<T[]> {
        return this.postOperation({ type: 'query', sql, params });
    }

    // ==================== 事务管理 ====================

    /**
     * 开始事务
     */
    public async beginTransaction(): Promise<void> {
        this.inTransactionFlag = true;
        return this.postOperation({ type: 'beginTransaction' });
    }

    /**
     * 提交事务
     */
    public async commit(): Promise<void> {
        this.inTransactionFlag = false;
        return this.postOperation({ type: 'commit' });
    }

    /**
     * 回滚事务
     */
    public async rollback(): Promise<void> {
        this.inTransactionFlag = false;
        return this.postOperation({ type: 'rollback' });
    }

    /**
     * 检查是否在事务中
     * @returns 是否在事务中
     */
    public inTransaction(): boolean {
        return this.inTransactionFlag;
    }

    /**
     * 执行事务操作
     * @param operations 事务操作函数
     * @returns Promise<T> 操作结果
     */
    public async transaction<T>(operations: () => Promise<T>): Promise<T> {
        await this.beginTransaction();
        try {
            const result = await operations();
            await this.commit();
            return result;
        } catch (error) {
            await this.rollback();
            throw error;
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 检查表是否存在
     * @param tableName 表名
     * @returns Promise<boolean> 表是否存在
     */
    public async tableExists(tableName: string): Promise<boolean> {
        return this.postOperation({ type: 'tableExists', tableName });
    }

    /**
     * 获取表的列信息
     * @param tableName 表名
     * @returns Promise<Array<{name: string, type: string, nullable: boolean}>> 列信息
     */
    public async getTableColumns(tableName: string): Promise<Array<{name: string, type: string, nullable: boolean}>> {
        return this.postOperation({ type: 'getTableColumns', tableName });
    }

    /**
     * 将操作推入队列或立即执行
     * @param operation 数据库操作
     */
    private postOperation(operation: Omit<DbOperation, 'resolve' | 'reject'>): Promise<any> {
        return new Promise((resolve, reject) => {
            const op: DbOperation = { ...operation, resolve, reject };
            if (this.isInitialized) {
                this.worker!.postMessage(op);
            } else {
                this.operationQueue.push(op);
            }
        });
    }

    /**
     * 处理来自 Worker 的消息
     * @param data 消息数据
     */
    private handleWorkerMessage(data: any): void {
        const { type, payload } = data;
        const pendingOp = this.operationQueue.shift();

        switch (type) {
            case 'init_success':
                console.log('[DatabaseService]', 'Database is ready');
                this.isInitialized = true;
                this.dbReady.next();
                this.dbReady.complete();
                // 处理在初始化期间排队的所有操作
                this.operationQueue.forEach((op) => this.worker!.postMessage(op));
                this.operationQueue = [];
                break;

            case 'query_success':
            case 'insert_success':
            case 'update_success':
            case 'delete_success':
            case 'batchInsert_success':
            case 'execute_success':
                pendingOp?.resolve(payload);
                break;

            case 'beginTransaction_success':
            case 'commit_success':
            case 'rollback_success':
                pendingOp?.resolve(undefined);
                break;

            case 'tableExists_success':
            case 'getTableColumns_success':
                pendingOp?.resolve(payload);
                break;

            case 'operation_error':
                console.error('[DatabaseService] Worker operation error:', payload);
                pendingOp?.reject(new Error(payload.message));
                // 清空队列以防后续操作持续失败
                this.operationQueue.forEach((op) =>
                    op.reject(new Error('Database initialization failed.')),
                );
                this.operationQueue = [];
                this.isInitialized = false;
                break;
        }
    }
}
