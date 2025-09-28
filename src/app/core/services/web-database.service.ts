// src/app/core/services/web-database.service.ts
import { Injectable } from '@angular/core';
import { EntityTarget, ObjectLiteral, QueryBuilder } from 'typeorm';
import type { IDatabaseService } from '../interfaces/database.interface';
import { Capacitor } from '@capacitor/core';
import {
    CapacitorSQLite,
    CapacitorSQLitePlugin,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { AppDataSource } from '../data/app-data-source';

@Injectable()
export class WebDatabaseService implements IDatabaseService {
    private sqlite: SQLiteConnection | null = null;
    private db: SQLiteDBConnection | null = null;
    private sqlitePlugin: CapacitorSQLitePlugin | null = null;

    constructor() {}

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Capacitor.getPlatform() !== 'web') {
                reject('WebDatabaseService can only be used on web platform');
                return;
            }
            this.sqlitePlugin = CapacitorSQLite;
            this.initMainThread().then(() => resolve()).catch(err => {
                console.error('Failed to initialize database:', err);
                reject(err);
            });
        })
    }

    private async initMainThread(): Promise<void> {
        console.log('Starting WebDatabaseService initialization...');

        // 等待 jeep-sqlite 元素完全就绪
        const jeepSqliteEl: any = document.querySelector('jeep-sqlite');
        if(!jeepSqliteEl) {
            throw new Error('jeep-sqlite element not found in DOM');
        }

        console.log('jeep-sqlite element found:', jeepSqliteEl);

        // 等待元素完全初始化
        if (jeepSqliteEl.componentOnReady) {
            await jeepSqliteEl.componentOnReady();
            console.log('jeep-sqlite component ready');
        }

        // 验证 WASM 文件并初始化 WebStore
        await this.ensureWasmReady();

        // 直接尝试初始化 WebStore，如果失败则重试
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                console.log(`Attempting to initialize WebStore (attempt ${retryCount + 1}/${maxRetries})...`);
                await CapacitorSQLite.initWebStore();
                console.log('WebStore initialized successfully');
                break;
            } catch (error) {
                retryCount++;
                console.log(`WebStore init failed (attempt ${retryCount}/${maxRetries}):`, error);

                if (retryCount >= maxRetries) {
                    console.error('WebStore initialization failed after all retries');
                    throw error;
                }

                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
            }
        }

        // 创建 SQLite 连接
        this.sqlite = new SQLiteConnection(this.sqlitePlugin);
        const dbName = 'app_db';

        try {
            // 检查数据库是否存在
            const exists = (await this.sqlite.isDatabase(dbName)).result;
            console.log(`Database ${dbName} exists:`, exists);

            // 创建或检索数据库连接
            this.db = exists
                ? await this.sqlite.retrieveConnection(dbName, false)
                : await this.sqlite.createConnection(dbName, false, 'no-encryption', 1, false);

            console.log('Database connection created successfully');

            // 打开数据库连接
            await this.db.open();
            console.log('Database opened successfully');

        } catch (error: any) {
            console.error('Database connection failed:', error);
            throw new Error(`Database connection failed: ${error.message}`);
        }

        // 简单创建表
        const createTablesSQL = `
            CREATE TABLE IF NOT EXISTS menus (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                tags TEXT,
                keywords TEXT
            );
        `;
        await this.db.execute(createTablesSQL);
    }

    /**
     * Initialize the Web store
     */
    private async initWebStore(): Promise<void> {
        if(this.sqlite != null) {
            try {
                await this.sqlite.initWebStore();
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            }
        } else {
            return Promise.reject(new Error(`no connection open`));
        }
    }

    public createQueryBuilder<T extends ObjectLiteral>(entity: EntityTarget<T>, alias: string): QueryBuilder<T> {
        return AppDataSource.createQueryBuilder(entity, alias);
    }

    public async query<T>(sqlOrQb: string | QueryBuilder<any>, params?: any[]): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');
        const { sql, parameters } = this.normalize(sqlOrQb, params);
        const res = await this.db.query(sql, parameters);
        return (res.values as T[]) || [];
    }

    public async execute(sqlOrQb: string | QueryBuilder<any>, params?: any[]): Promise<{ changes: number; lastId: number; }> {
        if (!this.db) throw new Error('Database not initialized');
        const { sql, parameters } = this.normalize(sqlOrQb, params);
        const res = await this.db.run(sql, parameters);
        return { changes: res.changes?.changes || 0, lastId: res.changes?.lastId || -1 };
    }

    private normalize(sqlOrQb: string | QueryBuilder<any>, params?: any[]): { sql: string; parameters: any[] } {
        if (typeof sqlOrQb === 'string') return { sql: sqlOrQb, parameters: params || [] };
        const [sql, parameters] = sqlOrQb.getQueryAndParameters();
        return { sql, parameters };
    }

    /**
     * 确保 WASM 文件准备就绪
     */
    private async ensureWasmReady(): Promise<void> {
        console.log('Ensuring WASM is ready...');

        // 检查 WASM 文件是否可访问
        try {
            const wasmUrl = '/assets/sql-wasm.wasm';
            const response = await fetch(wasmUrl, { method: 'HEAD' });
            if (!response.ok) {
                console.warn(`WASM file not found at ${wasmUrl}, trying alternative path...`);
                // 尝试其他可能的路径
                const altUrl = '/node_modules/jeep-sqlite/dist/jeep-sqlite/assets/sql-wasm.wasm';
                const altResponse = await fetch(altUrl, { method: 'HEAD' });
                if (!altResponse.ok) {
                    console.warn(`WASM file also not found at ${altUrl}`);
                }
            } else {
                console.log('WASM file found and accessible');
            }
        } catch (error) {
            console.warn('Could not verify WASM file availability:', error);
        }

        // 等待 jeep-sqlite 元素完全就绪
        const jeepEl = document.querySelector('jeep-sqlite') as any;
        if (!jeepEl) {
            throw new Error('jeep-sqlite element not found');
        }

        // 等待元素完全初始化
        if (jeepEl.componentOnReady) {
            await jeepEl.componentOnReady();
        }

        // 额外等待时间确保 WASM 加载完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('WASM ready check completed');
    }

}


