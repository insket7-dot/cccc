import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.example.crossplatformapp',
    appName: 'cross-platform-app',
    webDir: 'dist/cross-platform-app/browser',
    server: {
        androidScheme: 'https'
    },
    android: {
        minWebViewVersion: 77,
        minHuaweiWebViewVersion: 10,
    },
    plugins: {
        CapacitorHttp: {
            enabled: true
        }
    }
};

export default config;
