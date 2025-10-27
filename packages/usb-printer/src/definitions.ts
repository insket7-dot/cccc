export interface UsbPrinterPlugin {
  loadPlug(): Promise<void>;
  printOrder(options: PrintOrderOptions): Promise<{ success: boolean }>;
  isAvailable(): Promise<PrinterAvailableResult>;
  printText(options: PrintTextOptions): Promise<void>;
}

export interface PrintItem {
  name: string;
  qty: number;
  price: number;
}

export interface PrintOrderOptions {
  orderId: string;
  items: PrintItem[];
}

export interface PrinterAvailableResult {
  available: boolean;
  device?: string;
}

export interface UsbDevice {
  vendorId: number;
  productId: number;
  deviceName: string;
}
export interface PrintTextOptions {
  text: string;
  encoding?: 'GBK' | 'GB2312' | 'UTF-8';
  feed?: number; // 行数，默认 3
  cut?: boolean; // 是否切纸，默认 true
}
