import { WebPlugin } from '@capacitor/core';

import {
  UsbPrinterPlugin,
  RequestPermissionOptions,
  ConnectOptions,
  PrintTextOptions,
  PrintRawOptions,
  ListDevicesResult,
  RequestPermissionResult,
  ConnectResult,
  PrintResult,
  PrintOrderOptions,
  PrinterAvailableResult,
} from './definitions';

export class UsbPrinterWeb extends WebPlugin implements UsbPrinterPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async printOrder(options: PrintOrderOptions): Promise<{ success: boolean }> {
    const total = options.items.reduce((s, it) => s + it.qty * it.price, 0);
    const lines = [
      '--- MOCK PRINT (WEB) ---',
      `Order: ${options.orderId}`,
      ...options.items.map((i) => `${i.name} x${i.qty}  ¥${(i.qty * i.price).toFixed(2)}`),
      `TOTAL: ¥${total.toFixed(2)}`,
      '------------------------',
    ];
    console.log(lines.join('\n'));
    alert(lines.join('\n'));
    return { success: true };
  }

  async isAvailable(): Promise<PrinterAvailableResult> {
    return { available: false };
  }

  async loadPlug() {
    throw new Error('Method not implemented.');
  }

  async listDevices(): Promise<ListDevicesResult> {
    throw new Error('Method not implemented.');
  }

  requestPermission(_options?: RequestPermissionOptions): Promise<RequestPermissionResult> {
    throw new Error('Method not implemented.');
  }

  connect(_options?: ConnectOptions): Promise<ConnectResult> {
    throw new Error('Method not implemented.');
  }

  printText(_options?: PrintTextOptions): Promise<PrintResult> {
    throw new Error('Method not implemented.');
  }

  printRaw(_options?: PrintRawOptions): Promise<PrintResult> {
    throw new Error('Method not implemented.');
  }

  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
