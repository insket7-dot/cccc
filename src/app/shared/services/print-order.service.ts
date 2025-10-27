import { Injectable } from '@angular/core';
import { MqttService } from '@app/core/services/mqtt.service';
import { AppMqttEnums } from '@app/shared/constants/app.enums';
import { UsbPrinter } from '@capacitor-rydeen/usb-printer';
import { v4 } from 'uuid';

@Injectable({
    providedIn: 'root',
})
export class PrintOrderService {
    constructor(private mqttService: MqttService) {
        this.mqttService.getMessageObservable().subscribe((message) => {
            console.log('PrintOrderService MQTT 收到消息:', JSON.stringify(message));
            switch (message['type']) {
                case AppMqttEnums.ESC_PRINT_ORDER:
                    if (message.data) {
                        // 获取指令集，执行打印机操作
                        this.printOrder(v4(), message.data as any[]).catch((err) =>
                            console.error('打印失败:', err),
                        );
                    }
                    break;
            }
        });
    }

    /**
     * @desc 初始化
     */
    async initialize() {
        try {
            const flag = await UsbPrinter.loadPlug();
            console.log('初始化USB打印机成功:', JSON.stringify(flag));
        } catch (e) {
            console.log('初始化USB打印机失败:', JSON.stringify(e));
        }
    }

    /**
     * @desc 打印订单
     */
    async printOrder(orderId: string, items: any[]) {
        console.log('打印订单号:', orderId);
        console.log('打印订单内容:', JSON.stringify(items));
        const text = this.buildReceiptText(orderId, items);

        try {
            const payload = { orderId, items, text, preferredVendorId: 1208 };
            const res = await UsbPrinter.printText(payload);
            console.log('打印结果:', JSON.stringify(res));
        } catch (e) {
            console.log('打印错误:', JSON.stringify(e));
        }
    }

    buildReceiptText(orderId: string, items: any[]) {
        const lines: string[] = [];
        lines.push('*** EPSON TM-T88 小票 ***');
        lines.push(`订单号: ${orderId}`);
        lines.push('--------------------------');
        items.forEach((it) => {
            lines.push(`${it.name}  x${it.qty}    ¥${this.fmtPrice(it.price * it.qty)}`);
        });
        lines.push('--------------------------');
        lines.push(`合计: ¥${this.fmtPrice(items.reduce((s, x) => s + x.price * x.qty, 0))}`);
        lines.push('谢谢惠顾，欢迎下次光临！');
        return lines.join('\n');
    }

    fmtPrice(n: number) {
        const s = Number(n).toFixed(2);
        return s.endsWith('.00') ? s.slice(0, -3) : s;
    }
}
