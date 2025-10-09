/// <reference types="vite/client" />
// Schema 自动加载器
// 使用 Vite 的 import.meta.glob 来实现自动扫描

/**
 * Schema 自动加载器
 * 自动扫描和加载所有模块的 Schema 定义
 */
export class SchemaLoader {
    private static instance: SchemaLoader;
    private schemas: Map<string, any> = new Map();
    
    private constructor() {
        this.loadSchemas();
    }
    
    static getInstance(): SchemaLoader {
        if (!SchemaLoader.instance) {
            SchemaLoader.instance = new SchemaLoader();
        }
        return SchemaLoader.instance;
    }
    
    /**
     * 自动加载所有 Schema 文件
     */
    private loadSchemas(): void {
        // 使用 Vite 的 import.meta.glob 在构建期收集匹配的模块
        const modules = import.meta.glob('../../features/**/schemas/*.schema.ts', { eager: true });

        Object.entries(modules).forEach(([path, mod]) => {
            const moduleExports = mod as Record<string, unknown>;
            const schemaKeys = Object.keys(moduleExports).filter((key) => key.endsWith('DB'));
            schemaKeys.forEach((key) => {
                this.schemas.set(key, moduleExports[key]);
            });

            const moduleName = this.extractModuleName(path);
            if (schemaKeys.length > 0) {
                console.log(`Loaded schema: ${moduleName} -> ${schemaKeys.join(', ')}`);
            }
        });
    }
    
    /**
     * 从文件路径提取模块名
     */
    private extractModuleName(filePath: string): string {
        // 兼容形如 ../../features/<module>/schemas/<name>.schema.ts 的路径
        const match = filePath.match(/features\/([^\/]+)\/schemas\/([^\/]+)\.schema\.ts$/);
        return match ? `${match[1]}/${match[2]}` : filePath;
    }
    
    /**
     * 获取所有已加载的 Schema
     */
    getLoadedSchemas(): Map<string, any> {
        return new Map(this.schemas);
    }
    
    /**
     * 获取指定名称的 Schema
     */
    getSchema(schemaName: string): any {
        return this.schemas.get(schemaName);
    }
    
    /**
     * 检查 Schema 是否已加载
     */
    hasSchema(schemaName: string): boolean {
        return this.schemas.has(schemaName);
    }
    
    /**
     * 重新加载所有 Schema
     */
    reload(): void {
        this.schemas.clear();
        this.loadSchemas();
    }
}

// 导出单例实例
export const schemaLoader = SchemaLoader.getInstance();
