import { registerPlugin } from '@capacitor/core';

import type { UsbPrinterPlugin } from './definitions';

const UsbPrinterPlugin = registerPlugin<UsbPrinterPlugin>('UsbPrinterPlugin', {
  web: () => import('./web').then(m => new m.UsbPrinterPluginWeb())
});

export * from './definitions';
export { UsbPrinterPlugin };
