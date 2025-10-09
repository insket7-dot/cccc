// src/app/core/services/web-database.service.ts
import { Injectable } from '@angular/core';
import type {
    IDatabaseService,
    CompiledQuery,
    DatabaseResult,
    BatchInsertResult,
    BatchInsertConfig,
    BuildableQuery
} from '../interfaces/database.interface';
import { Capacitor } from '@capacitor/core';
import {
    CapacitorSQLite,
    CapacitorSQLitePlugin,
    SQLiteConnection,
    SQLiteDBConnection,
} from '@capacitor-community/sqlite';

@Injectable()
export class WebDatabaseService implements IDatabaseService {
    private isWeb: boolean = false;
    private sqlitePlugin: CapacitorSQLitePlugin | null = null;
    private sqlite: SQLiteConnection | null = null;
    private db: SQLiteDBConnection | null = null;
    private readonly dbName: string = 'app_db';

    constructor() {
    }

    getPlatform(): string {
        return Capacitor.getPlatform();
    }

    /**
     * Plugin Initialization
     */
    async initializePlugin(): Promise<boolean> {
        this.isWeb = Capacitor.getPlatform() === 'web';
        this.sqlitePlugin = CapacitorSQLite;
        this.sqlite = new SQLiteConnection(this.sqlitePlugin);

        // 如果是 Web 平台，需要初始化 WebStore
        if (this.isWeb) {
            try {
                await this.initialize();
                console.log('WebDatabaseService: WebStore initialized successfully');
            } catch (error) {
                console.error('WebDatabaseService: Failed to initialize WebStore:', error);
                // 即使初始化失败，也返回 true，让应用继续运行
            }
        }

        return true;
    }

    async initialize(): Promise<void> {
        if(this.sqlite != null) {
            try {
                // 检查 jeep-sqlite 元素是否存在
                const jeepSqliteEl = document.querySelector('jeep-sqlite');
                if (!jeepSqliteEl) {
                    throw new Error('jeep-sqlite element not found in DOM. Please ensure the element is present in index.html');
                }
                console.log('jeep-sqlite element found in DOM');

                await this.sqlite.initWebStore();
                console.log('WebDatabaseService: initWebStore completed successfully');
                return Promise.resolve();
            } catch (err) {
                console.error('WebDatabaseService initialize error:', err);
                return Promise.reject(err);
            }
        } else {
            return Promise.reject(new Error(`no connection open`));
        }
    }

    /**
     * 打开数据库连接
     */
    private async openDatabase(): Promise<void> {
        if (!this.sqlite) {
            throw new Error('SQLite connection not initialized');
        }

        try {
            // 检查数据库是否已存在
            const isDB = await this.sqlite.isDatabase(this.dbName);
            console.log(`Database ${this.dbName} exists:`, isDB.result);

            if (isDB.result) {
                // 数据库存在，尝试检索连接
                try {
                    this.db = await this.sqlite.retrieveConnection(this.dbName, false);
                    console.log('Retrieved existing database connection');
                } catch (retrieveError) {
                    console.log('Failed to retrieve connection, creating new one:', retrieveError);
                    // 如果检索失败，创建新连接
                    this.db = await this.sqlite.createConnection(this.dbName, false, "no-encryption", 1, false);
                    await this.db.open();
                    console.log('Created and opened new database connection');
                }
            } else {
                // 数据库不存在，创建并打开
                console.log('Creating new database connection...');
                this.db = await this.sqlite.createConnection(this.dbName, false, "no-encryption", 1, false);
                await this.db.open();
                console.log('Created and opened new database connection');
            }
        } catch (error) {
            console.error('Failed to open database:', error);
            throw error;
        }
    }

    /**
     * 确保数据库连接已打开
     */
    private async ensureDatabaseOpen(): Promise<void> {
        if (!this.db) {
            await this.openDatabase();
        }
    }

    public async query<T>(query: BuildableQuery): Promise<T[]> {
        const compiled: CompiledQuery = query.compile();
        await this.ensureDatabaseOpen();
        const res = await this.db!.query(compiled.sql, [...compiled.parameters]);
        return (res.values as T[]) || [];
    }

    public async insert(query: BuildableQuery): Promise<DatabaseResult> {
        const compiled: CompiledQuery = query.compile();
        await this.ensureDatabaseOpen();
        const res = await this.db!.run(compiled.sql, [...compiled.parameters]);
        await this.saveToStoreSafely();
        return {
            changes: res.changes?.changes || 0,
            lastId: res.changes?.lastId || -1,
            executionTime: 0 // TODO: 实现执行时间计算
        };
    }

    public async update(query: BuildableQuery): Promise<DatabaseResult> {
        const compiled: CompiledQuery = query.compile();
        await this.ensureDatabaseOpen();
        const res = await this.db!.run(compiled.sql, [...compiled.parameters]);
        await this.saveToStoreSafely();
        return {
            changes: res.changes?.changes || 0,
            lastId: res.changes?.lastId || -1,
            executionTime: 0 // TODO: 实现执行时间计算
        };
    }

    public async delete(query: BuildableQuery): Promise<DatabaseResult> {
        const compiled: CompiledQuery = query.compile();
        await this.ensureDatabaseOpen();
        const res = await this.db!.run(compiled.sql, [...compiled.parameters]);
        await this.saveToStoreSafely();
        return {
            changes: res.changes?.changes || 0,
            lastId: res.changes?.lastId || -1,
            executionTime: 0 // TODO: 实现执行时间计算
        };
    }

    public async batchInsert(
        query: BuildableQuery,
        config?: BatchInsertConfig
    ): Promise<BatchInsertResult> {
        const compiled: CompiledQuery = query.compile();
        await this.ensureDatabaseOpen();

        const batchSize = config?.batchSize || 1000;
        const commitPerBatch = config?.commitPerBatch ?? true;

        // 这里需要根据实际的批量插入逻辑来实现
        // 暂时使用简单的单次插入
        const res = await this.db!.run(compiled.sql, [...compiled.parameters]);
        await this.saveToStoreSafely();

        return {
            totalInserted: res.changes?.changes || 0,
            batches: 1,
            executionTime: 0 // TODO: 实现执行时间计算
        };
    }

    // ==================== 事务管理 ====================

    public async beginTransaction(): Promise<void> {
        await this.ensureDatabaseOpen();
        await this.db!.execute('BEGIN TRANSACTION');
    }

    public async commit(): Promise<void> {
        if (this.db) {
            await this.db.execute('COMMIT');
        }
    }

    public async rollback(): Promise<void> {
        if (this.db) {
            await this.db.execute('ROLLBACK');
        }
    }

    public inTransaction(): boolean {
        // TODO: 实现事务状态检查
        return false;
    }

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

    public async tableExists(tableName: string): Promise<boolean> {
        await this.ensureDatabaseOpen();
        const res = await this.db!.query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            [tableName]
        );
        return (res.values && res.values.length > 0) || false;
    }

    public async getTableColumns(tableName: string): Promise<Array<{name: string, type: string, nullable: boolean}>> {
        await this.ensureDatabaseOpen();
        const res = await this.db!.query(`PRAGMA table_info(${tableName})`);
        return (res.values || []).map((row: any) => ({
            name: row.name,
            type: row.type,
            nullable: !row.notnull
        }));
    }

    // ==================== 迁移专用方法 ====================

    public async executeRaw(sql: string, params?: any[]): Promise<DatabaseResult> {
        await this.ensureDatabaseOpen();
        const res = params && params.length ? await this.db!.run(sql, params) : await this.db!.execute(sql);
        await this.saveToStoreSafely();
        return {
            changes: res.changes?.changes || 0,
            lastId: res.changes?.lastId || -1,
            executionTime: 0 // TODO: 实现执行时间计算
        };
    }

    public async queryRaw<T>(sql: string, params?: any[]): Promise<T[]> {
        await this.ensureDatabaseOpen();
        const res = await this.db!.query(sql, params || []);
        return (res.values as T[]) || [];
    }

    /**
     * 将当前数据库保存到 WebStore（IndexedDB），避免刷新丢数据。
     */
    private async saveToStoreSafely(): Promise<void> {
        try {
            // 优先：通过连接对象保存
            if (this.sqlite && (this.sqlite as any).saveToStore) {
                await (this.sqlite as any).saveToStore(this.dbName);
                return;
            }
            // 其次：通过全局插件保存
            if ((CapacitorSQLite as any)?.saveToStore) {
                const fn = (CapacitorSQLite as any).saveToStore;
                try {
                    await fn({ database: this.dbName });
                } catch {
                    await fn(this.dbName);
                }
                return;
            }
            // 兜底：某些版本支持从 db 调用
            if (this.db && (this.db as any).saveToStore) {
                await (this.db as any).saveToStore(this.dbName);
            }
        } catch (e) {
            console.warn('saveToStore failed or not supported:', e);
        }
    }
}
