import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { LocalStorage } from '@rydeen/angular-framework';
import { MqttClient } from '@app/shared/services/mqtt.client';
import { takeUntil, Subject } from 'rxjs';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatChipsModule],
    templateUrl: './menu.html',
    styleUrl: './menu.scss',
})
export class Menu implements OnInit {
    protected readonly items = signal<
        Array<{ id: string; name: string; category: string; price: number; tags?: string[] }>
    >([]);
    private destroy$ = new Subject<void>();

    constructor(private mqttClient: MqttClient) {}

    async ngOnInit(): Promise<void> {
        const byId = await LocalStorage.getItem<Record<string, any>>('menu.byId', 'menu');
        if (byId) {
            const all = Object.entries(byId).map(([id, v]: [string, any]) => ({
                id,
                ...(v || {}),
            }));
            // 简单排序：按品类分组后按名称
            all.sort(
                (a, b) =>
                    (a.category || '').localeCompare(b.category || '') ||
                    (a.name || '').localeCompare(b.name || ''),
            );
            this.items.set(all);
        } else {
            this.items.set([]);
        }

        void this.mqttInit();
    }

    /**
     * @desc mqtt初始化
     */
    async mqttInit() {
        console.log(environment, '2222');
        // MQTT 配置
        const config = {
            server: {
                host: 'broker.example.com',
                port: 1883,
                username: 'your-user',
                password: 'your-pass',
                clientId: 'angular-client-123',
            },
            autoReconnect: true,
            keepAliveInterval: 60,
        };
        this.mqttClient.connect(config).then(() => {
            void this.mqttClient.subscribe({ topic: 'my/topic' });
        });

        // 监听消息
        this.mqttClient
            .getMessageObservable()
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                console.log('Received message:', message);
            });

        // 监听连接状态
        this.mqttClient
            .getConnectionStateObservable()
            .pipe(takeUntil(this.destroy$))
            .subscribe((state) => {
                console.log('Connection state:', state);
            });
    }
}
