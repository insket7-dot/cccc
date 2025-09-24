import { Injectable } from '@angular/core';
import { BarcodeScanner, BarcodeFormat, ScanOptions } from '@capacitor-mlkit/barcode-scanning';

@Injectable({ providedIn: 'root' })
export class BarcodeService {
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') {
      return true;
    }
    const res = await BarcodeScanner.requestPermissions();
    return res.camera === 'granted';
  }

  async scanOnce(formats?: BarcodeFormat[]): Promise<string | null> {
    const hasPerm = await this.requestPermissions();
    if (!hasPerm) {
      return null;
    }
    const options: ScanOptions = {
      formats: formats ?? ['qrCode', 'code128', 'ean13']
    } as ScanOptions;
    const result = await BarcodeScanner.scan(options);
    const raw = result.barcodes?.[0]?.rawValue ?? null;
    return raw ?? null;
  }
}


