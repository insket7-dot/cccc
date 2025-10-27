import { WebPlugin } from '@capacitor/core';
import { UsbPrinterPlugin, PrintTextOptions, PrintOrderOptions, PrinterAvailableResult } from './definitions';

export class UsbPrinterWeb extends WebPlugin implements UsbPrinterPlugin {
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

  async printText(_options: PrintTextOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
