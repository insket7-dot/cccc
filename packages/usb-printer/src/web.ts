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
} from './definitions';

export class UsbPrinterPluginWeb extends WebPlugin implements UsbPrinterPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
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
