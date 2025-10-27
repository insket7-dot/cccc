export interface UsbPrinterPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  listDevices(): Promise<ListDevicesResult>;
  requestPermission(options?: RequestPermissionOptions): Promise<RequestPermissionResult>;
  connect(options?: ConnectOptions): Promise<ConnectResult>;
  printText(options: PrintTextOptions): Promise<PrintResult>;
  printRaw(options: PrintRawOptions): Promise<PrintResult>;
  disconnect(): Promise<void>;

  // 订单打印
  printOrder(options: PrintOrderOptions): Promise<{ success: boolean }>;
  isAvailable(): Promise<PrinterAvailableResult>;
  loadPlug(): Promise<void>;
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

export interface ListDevicesResult {
  devices: UsbDevice[];
}

export interface RequestPermissionOptions {
  vendorId?: number;
  productId?: number;
}

export interface RequestPermissionResult {
  granted: boolean;
}

export interface ConnectOptions {
  vendorId?: number;
  productId?: number;
}

export interface ConnectResult {
  connected: boolean;
}

export interface PrintTextOptions {
  text: string;
  encoding?: 'GBK' | 'GB2312' | 'UTF-8';
  feed?: number; // 行数，默认 3
  cut?: boolean; // 是否切纸，默认 true
}

export interface PrintRawOptions {
  dataBase64: string; // Base64 编码的原始 ESC/POS 指令
}

export interface PrintResult {
  ok: boolean;
}
