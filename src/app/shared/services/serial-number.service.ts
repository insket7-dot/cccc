import { Injectable } from '@angular/core';
import { LocalStorage } from '@rydeen/angular-framework';
import { DateUtils } from '@app/shared/services/date-utils.service';

interface SerialNumberData {
    value: number;
    timestamp: string | number;
}

@Injectable({ providedIn: 'root' })
export class SerialNumberService {
    private currentSerialNumber: number = 0;
    private readonly STORAGE_KEY = 'TEMP_SERIAL_NUMBER'; // 临时存储键名
    private readonly MAX_SERIAL_NUMBER = 9999; // 4位最大流水号
    private isInitialized = false;

    constructor(private dateUtils: DateUtils) {
        this.initialize().catch(console.error);
    }

    /**
     * 初始化流水号服务
     * 开机时检查并重置流水号
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            const isExist = await LocalStorage.isExist(this.STORAGE_KEY);

            if (isExist) {
                const data: SerialNumberData = JSON.parse(
                    (await LocalStorage.getItem(this.STORAGE_KEY)) || '{}',
                );
                if (data.timestamp && this.dateUtils.isSameDay(data.timestamp, Date.now())) {
                    this.currentSerialNumber = isNaN(Number(data.value)) ? 0 : Number(data.value);
                    this.isInitialized = true;
                    return;
                }
            }

            await LocalStorage.removeItem(this.STORAGE_KEY);
            this.currentSerialNumber = 0;

            this.isInitialized = true;
        } catch (error) {
            console.error('初始化流水号失败:', error);
            // 出错时默认初始化为0
            this.currentSerialNumber = 0;
            this.isInitialized = true;
        }
    }

    /**
     * 生成下一个4位流水号
     * @returns 格式化的4位流水号字符串，如0001, 0002...
     */
    async generateNextSerialNumber(): Promise<string> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // 增加流水号并检查是否溢出
        this.currentSerialNumber++;
        if (this.currentSerialNumber > this.MAX_SERIAL_NUMBER) {
            this.currentSerialNumber = 1; // 溢出后从1重新开始
        }

        // 保存当前流水号到临时存储
        try {
            const data: SerialNumberData = {
                value: this.currentSerialNumber,
                timestamp: this.dateUtils.formatDateTime(Date.now()),
            };
            await LocalStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('保存流水号失败（不影响功能）:', error);
            // 即使保存失败也继续，因为内存中仍有当前值
        }

        // 格式化为4位字符串，前面补零
        return this.formatSerialNumber(this.currentSerialNumber);
    }

    /**
     * 格式化流水号为4位字符串
     * @param number 原始数字
     * @returns 4位格式化字符串
     */
    private formatSerialNumber(number: number): string {
        return number.toString().padStart(4, '0');
    }

    /**
     * 获取当前流水号（非格式化）
     * @returns 当前流水号数字
     */
    getCurrentSerialNumber(): number {
        return this.currentSerialNumber;
    }

    /**
     * 手动重置流水号
     */
    async resetSerialNumber(): Promise<void> {
        this.currentSerialNumber = 0;
        try {
            await LocalStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('重置流水号存储失败:', error);
        }
    }

    /**
     * 应用退出前清理（可选）
     * 虽然关机后存储会自动失效，但主动清理更保险
     */
    async cleanupOnExit(): Promise<void> {
        try {
            await LocalStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('退出清理失败:', error);
        }
    }
}
