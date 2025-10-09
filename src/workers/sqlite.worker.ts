// src/workers/sqlite.worker.ts
/// <reference lib="webworker" />

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

// --- 状态管理 ---
let db: SQLiteDBConnection | null = null;
const dbName = 'app_db'; // 数据库名称
const dbVersion = 1; // 数据库版本

// --- 消息处理器 ---
addEventListener('message', async ({ data }) => {
    const { type, payload } = data;

    try {
        switch (type) {
            case 'init':
                await initDatabase();
                postMessage({ type: 'init_success' });
                break;
            case 'execute':
                if (!db) throw new Error('Database not initialized');
                const result = await db.execute(payload.sql, payload.params);
                postMessage({ type: 'execute_success', payload: result });
                break;
            case 'query':
                if (!db) throw new Error('Database not initialized');
                const queryResult = await db.query(payload.sql, payload.params);
                postMessage({ type: 'query_success', payload: queryResult.values || [] });
                break;
            default:
                throw new Error(`未知的 Worker 操作: ${type}`);
        }
    } catch (error: any) {
        postMessage({
            type: 'operation_error',
            payload: {
                originalType: type,
                message: error.message,
                stack: error.stack,
            },
        });
    }
});

// --- 核心功能 ---

/**
 * 初始化数据库连接并执行建表操作
 */
async function initDatabase(): Promise<void> {
    if (db) return; // 防止重复初始化

    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const isDbExists = (await sqlite.isDatabase(dbName)).result;

    if (isDbExists) {
        db = await sqlite.retrieveConnection(dbName, false);
    } else {
        db = await sqlite.createConnection(dbName, false, 'no-encryption', dbVersion, false);
    }

    // 开启数据库连接
    await db.open();
    console.log('[sqlite.worker] Database initialized successfully');
}
