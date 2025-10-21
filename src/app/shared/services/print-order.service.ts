import { Injectable } from '@angular/core';
import { MqttService } from '@app/core/services/mqtt.service';
import { AppMqttEnums } from '@app/shared/constants/app.enums';

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
                        this.printOrder(message.data);
                    }
                    break;
            }
        });
    }

    /**
     * @desc 打印订单
     */
    printOrder(data: any) {
        console.log('打印订单:', data);
    }
}
