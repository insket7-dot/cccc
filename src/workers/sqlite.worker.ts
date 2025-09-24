// src/workers/sqlite.worker.ts
/// <reference lib="webworker" />

import {CapacitorSQLite, SQLiteConnection, SQLiteDBConnection} from '@capacitor-community/sqlite';

// --- 状态管理 ---
let db: SQLiteDBConnection | null = null;
const dbName = 'app_db'; // 数据库名称
const dbVersion = 1; // 数据库版本

// --- 消息处理器 ---
addEventListener('message', async ({data}) => {
    const {type, payload} = data;

    try {
        switch (type) {
            case 'init':
                await initDatabase();
                postMessage({type: 'init_success'});
                break;
            case 'execute':
                if (!db) throw new Error('数据库未初始化');
                const result = await db.execute(payload.sql, payload.params);
                postMessage({type: 'execute_success', payload: result});
                break;
            case 'query':
                if (!db) throw new Error('数据库未初始化');
                const queryResult = await db.query(payload.sql, payload.params);
                postMessage({type: 'query_success', payload: queryResult.values || []});
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
                stack: error.stack
            }
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

    await db.open();
    await runMigrations(db); // 执行数据库迁移/建表
    console.log('[sqlite.worker] 数据库初始化成功');
}

/**
 * 数据库迁移与建表
 * @param connection 数据库连接实例
 */
async function runMigrations(connection: SQLiteDBConnection): Promise<void> {
    // 在这里定义你的建表语句
    const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS menus (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            tags TEXT,
            keywords TEXT
        );
    `;
    await connection.execute(createTablesSQL);
    console.log('[sqlite.worker] 数据库表结构检查/创建完成');
}
