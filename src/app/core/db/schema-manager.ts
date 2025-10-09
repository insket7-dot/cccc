// Schema 管理器
// 提供 Schema 的自动发现、验证和管理功能

import { autoDiscoveredSchemas, getSchemaInfo } from './auto-schema';

/**
 * Schema 管理器
 * 提供 Schema 的自动发现、验证和管理功能
 */
export class SchemaManager {
    private static instance: SchemaManager;
    
    private constructor() {}
    
    static getInstance(): SchemaManager {
        if (!SchemaManager.instance) {
            SchemaManager.instance = new SchemaManager();
        }
        return SchemaManager.instance;
    }
    
    /**
     * 获取所有已发现的 Schema 信息
     */
    getSchemaInfo() {
        return getSchemaInfo();
    }
    
    /**
     * 验证 Schema 定义
     */
    validateSchemas(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // 检查是否有重复的表名
        const tableNames = new Set<string>();
        
        autoDiscoveredSchemas.forEach(schema => {
            schema.schemas.forEach(s => {
                if (s.definition && typeof s.definition === 'object') {
                    Object.keys(s.definition).forEach(tableName => {
                        if (tableNames.has(tableName)) {
                            errors.push(`Duplicate table name: ${tableName}`);
                        } else {
                            tableNames.add(tableName);
                        }
                    });
                }
            });
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 获取所有表名
     */
    getAllTableNames(): string[] {
        const tableNames: string[] = [];
        
        autoDiscoveredSchemas.forEach(schema => {
            schema.schemas.forEach(s => {
                if (s.definition && typeof s.definition === 'object') {
                    tableNames.push(...Object.keys(s.definition));
                }
            });
        });
        
        return tableNames;
    }
    
    /**
     * 检查表是否存在
     */
    hasTable(tableName: string): boolean {
        return this.getAllTableNames().includes(tableName);
    }
    
    /**
     * 获取表的 Schema 定义
     */
    getTableSchema(tableName: string): any {
        for (const schema of autoDiscoveredSchemas) {
            for (const s of schema.schemas) {
                if (s.definition && s.definition[tableName]) {
                    return s.definition[tableName];
                }
            }
        }
        return null;
    }
    
    /**
     * 打印 Schema 信息（用于调试）
     */
    printSchemaInfo(): void {
        console.group('📋 Database Schema Information');
        
        const info = this.getSchemaInfo();
        console.log(`Total Schema Files: ${info.totalFiles}`);
        
        info.schemas.forEach(module => {
            console.group(`📁 Module: ${module.module}`);
            module.schemas.forEach(schema => {
                console.log(`  📄 Schema: ${schema}`);
            });
            console.groupEnd();
        });
        
        const validation = this.validateSchemas();
        if (validation.valid) {
            console.log('✅ Schema validation passed');
        } else {
            console.error('❌ Schema validation failed:');
            validation.errors.forEach(error => console.error(`  - ${error}`));
        }
        
        console.groupEnd();
    }
}

// 导出单例实例
export const schemaManager = SchemaManager.getInstance();
