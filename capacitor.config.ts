import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.example.crossplatformapp',
    appName: 'cross-platform-app',
    webDir: 'dist/cross-platform-app/browser',
    server: {
        // allowNavigation: ['https://staging.yakiapp.io/'],
        androidScheme: 'https',
    },
    android: {
        minWebViewVersion: 77,
        minHuaweiWebViewVersion: 10,
    },
    plugins: {
        CapacitorHttp: {
            enabled: false,
        },
        CapacitorSQLite: {
            iosDatabaseLocation: 'Library/CapacitorDatabase',
            iosIsEncryption: true,
            iosKeychainPrefix: 'angular-sqlite-app-starter',
            iosBiometric: {
                biometricAuth: false,
                biometricTitle: 'Biometric login for capacitor sqlite',
            },
            androidIsEncryption: true,
            androidBiometric: {
                biometricAuth: false,
                biometricTitle: 'Biometric login for capacitor sqlite',
                biometricSubTitle: 'Log in using your biometric',
            },
        },
    },
};

export default config;
