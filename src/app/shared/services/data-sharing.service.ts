import { Injectable } from '@angular/core';

// 可选：定义数据元数据接口，增强类型安全（比如记录数据大小、过期时间）
interface DataMeta {
    value: any;
    size?: number; // 数据大小（字节），用于限制规模
    expireTime?: number; // 过期时间（时间戳），用于自动清理
    createTime: number; // 创建时间
}

@Injectable({ providedIn: 'root' })
export class DataSharingService {
    // 用 Map 存储，Key 是字符串，Value 是「数据+元数据」
    private dataStore = new Map<string, DataMeta>();

    // 可选：设置全局数据大小限制（比如最大 10MB）
    private MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
    private currentTotalSize = 0; // 当前总数据大小

    /**
     * 存储数据
     * @param key 唯一键
     * @param value 数据（任意类型）
     * @param options 可选配置（过期时间、大小限制等）
     */
    setData(key: string, value: any, options?: { expireTime?: number; maxSize?: number }): void {
        // 1. 校验 Key 是否已存在（避免覆盖，可选）
        if (this.dataStore.has(key)) {
            console.warn(`Key "${key}" 已存在，将覆盖旧数据`);
            // 先减去旧数据的大小（如果记录了大小）
            const oldMeta = this.dataStore.get(key)!;
            this.currentTotalSize -= oldMeta.size || 0;
        }

        // 2. 计算数据大小（可选，用于规模控制）
        const dataSize = this.calculateDataSize(value);
        const maxSize = options?.maxSize || 1024 * 1024; // 单个数据默认最大 1MB

        // 3. 校验数据大小（避免超大数据）
        if (dataSize > maxSize) {
            throw new Error(`Key "${key}" 的数据大小（${dataSize}B）超过限制（${maxSize}B）`);
        }

        // 4. 校验总数据大小（避免内存溢出）
        if (this.currentTotalSize + dataSize > this.MAX_TOTAL_SIZE) {
            throw new Error(`总数据大小超过限制（${this.MAX_TOTAL_SIZE}B），请清理旧数据`);
        }

        // 5. 存储数据（带元数据）
        this.dataStore.set(key, {
            value,
            size: dataSize,
            expireTime: options?.expireTime,
            createTime: Date.now(),
        });

        // 6. 更新总数据大小
        this.currentTotalSize += dataSize;

        // 7. 自动清理过期数据（可选）
        this.clearExpiredData();
    }

    /**
     * 获取数据（自动过滤过期数据）
     */
    getData<T = any>(key: string): T | null {
        if (!this.dataStore.has(key)) {
            console.warn(`Key "${key}" 不存在`);
            return null;
        }

        const meta = this.dataStore.get(key)!;

        // 1. 检查数据是否过期
        if (meta.expireTime && Date.now() > meta.expireTime) {
            this.clearData(key); // 自动删除过期数据
            console.warn(`Key "${key}" 的数据已过期，已自动清理`);
            return null;
        }

        // 2. 返回数据（支持泛型，增强类型安全）
        return meta.value as T;
    }

    /**
     * 清理指定 Key 的数据
     */
    clearData(key: string): void {
        if (this.dataStore.has(key)) {
            const meta = this.dataStore.get(key)!;
            this.currentTotalSize -= meta.size || 0; // 减去数据大小
            this.dataStore.delete(key);
        }
    }

    /**
     * 批量清理数据（支持按前缀、过期时间等）
     */
    clearBatch(condition?: (key: string, meta: DataMeta) => boolean): void {
        for (const [key, meta] of this.dataStore.entries()) {
            if (!condition || condition(key, meta)) {
                this.currentTotalSize -= meta.size || 0;
                this.dataStore.delete(key);
            }
        }
    }

    /**
     * 获取数据统计信息（增强管理能力）
     */
    getStats(): {
        keyCount: number;
        totalSize: number;
        maxSize: number;
        expiredCount: number;
    } {
        let expiredCount = 0;
        for (const meta of this.dataStore.values()) {
            if (meta.expireTime && Date.now() > meta.expireTime) {
                expiredCount++;
            }
        }

        return {
            keyCount: this.dataStore.size, // 直接获取 Key 数量（Map 自带 size 属性，比 Object.keys() 快）
            totalSize: this.currentTotalSize,
            maxSize: this.MAX_TOTAL_SIZE,
            expiredCount,
        };
    }

    // ------------------------------ 私有工具方法 ------------------------------
    /**
     * 计算数据大小（近似值，用于规模控制）
     * 原理：将数据序列化为 JSON 字符串，再计算字节数
     */
    private calculateDataSize(value: any): number {
        try {
            // 注意：Function、Symbol 等类型无法序列化，需根据实际场景过滤
            const jsonStr = JSON.stringify(value);
            // 每个 UTF-8 字符约 1-4 字节，这里简化按 2 字节计算（近似值）
            return jsonStr.length * 2;
        } catch (error: any) {
            console.error(`计算数据大小失败：${error.message}`);
            return 0;
        }
    }

    /**
     * 清理所有过期数据
     */
    private clearExpiredData(): void {
        const now = Date.now();
        for (const [key, meta] of this.dataStore.entries()) {
            if (meta.expireTime && now > meta.expireTime) {
                this.currentTotalSize -= meta.size || 0;
                this.dataStore.delete(key);
            }
        }
    }
}
