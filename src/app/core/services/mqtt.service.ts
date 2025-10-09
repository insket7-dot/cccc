// mqtt.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import {
    Mqtt,
    MqttConfig,
    MqttPublishConfig,
    MqttSubscribeConfig,
    MqttMessage,
    MqttConnection,
    MqttSignalStrength,
    MqttNetworkQuality,
    MqttHeartbeat,
    MqttSubscriptionResult,
} from '@capacitor-rydeen/mqtt';
import { PluginListenerHandle } from '@capacitor/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MqttService implements OnDestroy {
    // 连接状态
    private _isConnected = false;
    private config: MqttConfig | null = null;

    // 监听器句柄
    private listeners: PluginListenerHandle[] = [];

    // RxJS 事件流
    private messageSubject = new Subject<MqttMessage>();
    private connectionStateSubject = new Subject<MqttConnection>();
    private signalStrengthSubject = new Subject<MqttSignalStrength>();
    private networkQualitySubject = new Subject<MqttNetworkQuality>();
    private heartbeatSubject = new Subject<MqttHeartbeat>();
    private subscriptionResultSubject = new Subject<MqttSubscriptionResult>();

    constructor() {}

    /**
     * 连接 MQTT 服务器
     */
    async connect(config: MqttConfig): Promise<void> {
        if (this._isConnected) return;

        try {
            await Mqtt.connect(config);
            this._isConnected = true;
            this.config = config;
            void this.setupListeners();
            console.log('MQTT 连接成功');
        } catch (err) {
            console.error('MQTT 连接失败', err);
            throw err;
        }
    }

    /**
     * 重连
     */
    async reconnect(): Promise<void> {
        if (!this.config) {
            throw new Error('MQTT 未初始化配置');
        }
        await Mqtt.reconnect();
    }

    /**
     * 订阅主题
     */
    async subscribe(config: MqttSubscribeConfig): Promise<void> {
        if (!this._isConnected) {
            throw new Error('MQTT 未连接');
        }
        await Mqtt.subscribe(config);
    }

    /**
     * 取消订阅
     */
    async unsubscribe(config: MqttSubscribeConfig): Promise<void> {
        if (!this._isConnected) {
            throw new Error('MQTT 未连接');
        }
        await Mqtt.unsubscribe(config);
    }

    /**
     * 发布消息
     */
    async publish(config: MqttPublishConfig): Promise<void> {
        if (!this._isConnected) {
            throw new Error('MQTT 未连接');
        }
        await Mqtt.publish(config);
    }

    /**
     * 断开连接
     */
    async disconnect(): Promise<void> {
        if (!this._isConnected) return;

        await Mqtt.disconnect();
        this._isConnected = false;
        void this.removeListeners();
    }

    /**
     * 检查是否连接
     */
    async isConnected(): Promise<boolean> {
        try {
            const result = await Mqtt.isConnected();
            this._isConnected = result.isConnected;
            return this._isConnected;
        } catch (err) {
            console.error('检查连接状态失败', err);
            return false;
        }
    }

    /**
     * 设置所有监听器
     */
    private async setupListeners() {
        // 消息监听
        const msgListener = await Mqtt.addListener('mqttMessage', (msg) => {
            this.messageSubject.next(msg);
        });

        // 连接状态监听
        const stateListener = await Mqtt.addListener('mqttConnectionState', (state) => {
            this.connectionStateSubject.next(state);
            this._isConnected = state.state === 'CONNECTED';
        });

        // 信号强度监听
        const signalListener = await Mqtt.addListener('mqttSignalStrength', (signal) => {
            this.signalStrengthSubject.next(signal);
        });

        // 网络质量监听
        const qualityListener = await Mqtt.addListener('mqttNetworkQuality', (quality) => {
            this.networkQualitySubject.next(quality);
        });

        // 心跳监听
        const heartbeatListener = await Mqtt.addListener('mqttHeartbeat', (heartbeat) => {
            this.heartbeatSubject.next(heartbeat);
        });

        // 订阅结果监听
        const subResultListener = await Mqtt.addListener('mqttSubscriptionResult', (result) => {
            this.subscriptionResultSubject.next(result);
        });

        this.listeners.push(
            msgListener,
            stateListener,
            signalListener,
            qualityListener,
            heartbeatListener,
            subResultListener,
        );
    }

    /**
     * 移除所有监听器
     */
    private async removeListeners() {
        for (const listener of this.listeners) {
            await listener.remove();
        }
        this.listeners = [];
    }

    /**
     * 获取消息 Observable
     */
    getMessageObservable() {
        return this.messageSubject.asObservable();
    }

    /**
     * 获取连接状态 Observable
     */
    getConnectionStateObservable() {
        return this.connectionStateSubject.asObservable();
    }

    /**
     * 获取信号强度 Observable
     */
    getSignalStrengthObservable() {
        return this.signalStrengthSubject.asObservable();
    }

    /**
     * 获取网络质量 Observable
     */
    getNetworkQualityObservable() {
        return this.networkQualitySubject.asObservable();
    }

    /**
     * 获取心跳 Observable
     */
    getHeartbeatObservable() {
        return this.heartbeatSubject.asObservable();
    }

    /**
     * 获取订阅结果 Observable
     */
    getSubscriptionResultObservable() {
        return this.subscriptionResultSubject.asObservable();
    }

    /**
     * 服务销毁时清理
     */
    ngOnDestroy() {
        void this.disconnect();
        this.messageSubject.complete();
        this.connectionStateSubject.complete();
        this.signalStrengthSubject.complete();
        this.networkQualitySubject.complete();
        this.heartbeatSubject.complete();
        this.subscriptionResultSubject.complete();
    }
}
