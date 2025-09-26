// src/app/core/services/database.service.ts
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {AppDataSource} from '../data/app-data-source';
import {EntityTarget, ObjectLiteral, QueryBuilder} from 'typeorm';

// --- 类型定义 ---
export interface DbOperation {
    type: 'query' | 'execute';
    sql: string;
    params?: any[];
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private readonly worker: Worker | null = null;
    private isInitialized = false;
    private operationQueue: DbOperation[] = [];
    private readonly dbReady = new Subject<void>();

    constructor() {
        if (typeof Worker !== 'undefined') {
            this.worker = new Worker(new URL('../../../workers/sqlite.worker', import.meta.url), {type: 'module'});
            this.worker.onmessage = ({data}) => this.handleWorkerMessage(data);
            this.worker.onerror = (error) => {
                console.error('[DatabaseService] Worker error:', error);
                this.isInitialized = false;
            };
            this.init();
        } else {
            console.error('Web Workers are not supported in this environment.');
        }
    }

    /**
     * 初始化数据库连接 (由构造函数自动调用)
     */
    private init(): void {
        if (this.isInitialized || !this.worker) return;
        this.worker.postMessage({type: 'init'});
    }

    /**
     * 为给定的实体创建一个新的查询构建器 (QueryBuilder).
     * @param entity 要查询的实体
     * @param alias 查询中实体的别名
     * @returns 一个 TypeORM QueryBuilder 实例
     */
    public createQueryBuilder<T extends ObjectLiteral>(entity: EntityTarget<T>, alias: string): QueryBuilder<T> {
        return AppDataSource.createQueryBuilder(entity, alias);
    }

    /**
     * 执行一个会返回数据的查询 (SELECT).
     * 可以接受一个原始 SQL 字符串或一个 TypeORM QueryBuilder 实例.
     * @param sqlOrQb SQL 查询语句或 QueryBuilder 实例
     * @param params 如果第一个参数是字符串，则为查询参数
     * @returns Promise<T[]> 查询结果数组
     */
    public query<T>(sqlOrQb: string | QueryBuilder<any>, params: any[] = []): Promise<T[]> {
        if (typeof sqlOrQb === 'string') {
            return this.postOperation({type: 'query', sql: sqlOrQb, params});
        } else {
            const [sql, parameters] = sqlOrQb.getQueryAndParameters();
            return this.postOperation({type: 'query', sql, params: parameters});
        }
    }

    /**
     * 执行一个不会返回数据的操作 (INSERT, UPDATE, DELETE).
     * 可以接受一个原始 SQL 字符串或一个 TypeORM QueryBuilder 实例.
     * @param sqlOrQb SQL 操作语句或 QueryBuilder 实例
     * @param params 如果第一个参数是字符串，则为操作参数
     * @returns Promise<{ changes: number, lastId: number }> 操作结果
     */
    public execute(sqlOrQb: string | QueryBuilder<any>, params: any[] = []): Promise<{ changes: number, lastId: number }> {
        if (typeof sqlOrQb === 'string') {
            return this.postOperation({type: 'execute', sql: sqlOrQb, params});
        } else {
            const [sql, parameters] = sqlOrQb.getQueryAndParameters();
            return this.postOperation({type: 'execute', sql, params: parameters});
        }
    }

    /**
     * 将操作推入队列或立即执行
     * @param operation 数据库操作
     */
    private postOperation(operation: Omit<DbOperation, 'resolve' | 'reject'>): Promise<any> {
        return new Promise((resolve, reject) => {
            const op: DbOperation = {...operation, resolve, reject};
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
        const {type, payload} = data;
        const pendingOp = this.operationQueue.shift();

        switch (type) {
            case 'init_success':
                console.log('[DatabaseService] 数据库已就绪');
                this.isInitialized = true;
                this.dbReady.next();
                this.dbReady.complete();
                // 处理在初始化期间排队的所有操作
                this.operationQueue.forEach(op => this.worker!.postMessage(op));
                this.operationQueue = [];
                break;

            case 'query_success':
                pendingOp?.resolve(payload);
                break;

            case 'execute_success':
                pendingOp?.resolve(payload);
                break;

            case 'operation_error':
                console.error('[DatabaseService] Worker operation error:', payload);
                pendingOp?.reject(new Error(payload.message));
                // 清空队列以防后续操作持续失败
                this.operationQueue.forEach(op => op.reject(new Error('Database initialization failed.')));
                this.operationQueue = [];
                this.isInitialized = false;
                break;
        }
    }
}
