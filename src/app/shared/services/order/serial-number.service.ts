import { computed, Injectable, signal } from '@angular/core';
import { LocalStorage } from '@rydeen/angular-framework';
import { DateUtils } from '@app/shared/services/util/date-utils.service';

interface SerialNumberData {
    value: number;
    timestamp: string | number;
}

@Injectable({ providedIn: 'root' })
export class SerialNumberService {
    private readonly DEFAULT_SERIAL_NUMBER = 1;
    private currentSerialNumber = signal(this.DEFAULT_SERIAL_NUMBER);
    private readonly STORAGE_KEY = 'TEMP_SERIAL_NUMBER'; // 临时存储键名
    private readonly MAX_SERIAL_NUMBER = 9999; // 4位最大流水号
    private isInitialized = false;

    constructor(private dateUtils: DateUtils) {
        this.initialize().catch(console.error);
    }

    /**
     * @desc 获取当前流水号（非格式化）
     */
    getCurrentSerialNumber = computed(() => this.currentSerialNumber());

    /**
     * @desc 获取当前流水号（格式化）
     */
    currentSerialNumberValue = computed(() => this.formatSerialNumber(this.currentSerialNumber()));

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
                    const value = isNaN(Number(data.value))
                        ? this.DEFAULT_SERIAL_NUMBER
                        : Number(data.value);
                    this.currentSerialNumber.set(value);
                    this.isInitialized = true;
                    return;
                }
            }

            await LocalStorage.removeItem(this.STORAGE_KEY);
            this.currentSerialNumber.set(this.DEFAULT_SERIAL_NUMBER);

            this.isInitialized = true;
        } catch (error) {
            console.error('初始化流水号失败:', error);
            // 出错时默认初始化为0
            this.currentSerialNumber.set(this.DEFAULT_SERIAL_NUMBER);
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
        this.currentSerialNumber.update((prev) => prev + 1);
        if (this.currentSerialNumber() > this.MAX_SERIAL_NUMBER) {
            this.currentSerialNumber.set(this.DEFAULT_SERIAL_NUMBER); // 溢出后从1重新开始
        }

        // 保存当前流水号到临时存储
        try {
            const data: SerialNumberData = {
                value: this.currentSerialNumber(),
                timestamp: this.dateUtils.formatDateTime(Date.now()),
            };
            LocalStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)).catch(console.error);
        } catch (error) {
            console.warn('保存流水号失败（不影响功能）:', error);
        }

        // 格式化为4位字符串，前面补零
        return this.formatSerialNumber(this.currentSerialNumber());
    }

    /**
     * 格式化流水号为4位字符串
     * @param value 原始数字
     * @returns 4位格式化字符串
     */
    private formatSerialNumber(value: number): string {
        return value.toString().padStart(4, '0');
    }

    /**
     * 手动重置流水号
     */
    async resetSerialNumber(): Promise<void> {
        this.currentSerialNumber.set(this.DEFAULT_SERIAL_NUMBER);
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
