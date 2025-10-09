// 核心基础 Schema - 只包含系统级表结构
export interface BaseDB {
    // 系统表
    schema_migrations: {
        version: number;
        name: string;
        applied_at: string;
        checksum: string | null;
    };

    // 其他系统级表可以在这里定义
    // 例如：系统配置、日志表等
}
