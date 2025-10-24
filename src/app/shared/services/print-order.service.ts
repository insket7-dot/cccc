import { Injectable } from '@angular/core';
import { MqttService } from '@app/core/services/mqtt.service';
import { AppMqttEnums } from '@app/shared/constants/app.enums';
import { RequestPermissionOptions, UsbPrinterPlugin } from '@capacitor-rydeen/usb-printer';

@Injectable({
    providedIn: 'root',
})
export class PrintOrderService {
    constructor(
        private mqttService: MqttService,
        private usbPrinterPlugin: UsbPrinterPlugin,
    ) {
        this.mqttService.getMessageObservable().subscribe((message) => {
            console.log('PrintOrderService MQTT 收到消息:', JSON.stringify(message));
            switch (message['type']) {
                case AppMqttEnums.ESC_PRINT_ORDER:
                    if (message.data) {
                        // 获取指令集，执行打印机操作
                        this.printOrder(message.data);
                    }
                    break;
            }
        });
    }

    async initialize() {
        try {
            const flag = await this.usbPrinterPlugin.requestPermission();
            console.log('打印权限:', JSON.stringify(flag));
            // const res = await this.usbPrinterPlugin.listDevices()
            // console.log('打印设备列表:', JSON.stringify(res));
        } catch (e) {
            console.log('打印设备列表错误:', JSON.stringify(e));
        }
    }

    /**
     * @desc 打印订单
     */
    printOrder(data: any) {
        console.log('打印订单:', data);
    }
}
