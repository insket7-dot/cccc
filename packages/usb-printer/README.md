# @capacitor/app

The App API handles high level App state and events. For example, this API emits events when the app enters and leaves the foreground, handles deeplinks, opens other apps, and manages persisted plugin state.

## Install

```bash
npm install @capacitor/app
npx cap sync
```

## iOS

For being able to open the app from a custom scheme you need to register the scheme first. You can do it by editing the [`Info.plist`](https://capacitorjs.com/docs/ios/configuration#configuring-infoplist) file and adding this lines.


```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.getcapacitor.capacitor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>mycustomscheme</string>
    </array>
  </dict>
</array>
```

## Android

For being able to open the app from a custom scheme you need to register the scheme first. You can do it by adding this lines inside the `activity` section of the `AndroidManifest.xml`.

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="@string/custom_url_scheme" />
</intent-filter>
```

`custom_url_scheme` value is stored in `strings.xml`. When the Android platform is added, `@capacitor/cli` adds the app's package name as default value, but can be replaced by editing the `strings.xml` file.

## Example

```typescript
import { App } from '@capacitor/app';

App.addListener('appStateChange', ({ isActive }) => {
  console.log('App state changed. Is active?', isActive);
});

App.addListener('appUrlOpen', data => {
  console.log('App opened with URL:', data);
});

App.addListener('appRestoredResult', data => {
  console.log('Restored state:', data);
});

const checkAppLaunchUrl = async () => {
  const { url } = await App.getLaunchUrl();

  console.log('App opened with URL: ' + url);
};
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`listDevices()`](#listdevices)
* [`requestPermission(...)`](#requestpermission)
* [`connect(...)`](#connect)
* [`printText(...)`](#printtext)
* [`printRaw(...)`](#printraw)
* [`disconnect()`](#disconnect)
* [`printOrder(...)`](#printorder)
* [`isAvailable()`](#isavailable)
* [`loadPlug()`](#loadplug)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### listDevices()

```typescript
listDevices() => Promise<ListDevicesResult>
```

**Returns:** <code>Promise&lt;<a href="#listdevicesresult">ListDevicesResult</a>&gt;</code>

--------------------


### requestPermission(...)

```typescript
requestPermission(options?: RequestPermissionOptions | undefined) => Promise<RequestPermissionResult>
```

| Param         | Type                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code><a href="#requestpermissionoptions">RequestPermissionOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#requestpermissionresult">RequestPermissionResult</a>&gt;</code>

--------------------


### connect(...)

```typescript
connect(options?: ConnectOptions | undefined) => Promise<ConnectResult>
```

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#connectoptions">ConnectOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#connectresult">ConnectResult</a>&gt;</code>

--------------------


### printText(...)

```typescript
printText(options: PrintTextOptions) => Promise<PrintResult>
```

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#printtextoptions">PrintTextOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#printresult">PrintResult</a>&gt;</code>

--------------------


### printRaw(...)

```typescript
printRaw(options: PrintRawOptions) => Promise<PrintResult>
```

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code><a href="#printrawoptions">PrintRawOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#printresult">PrintResult</a>&gt;</code>

--------------------


### disconnect()

```typescript
disconnect() => Promise<void>
```

--------------------


### printOrder(...)

```typescript
printOrder(options: PrintOrderOptions) => Promise<{ success: boolean; }>
```

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#printorderoptions">PrintOrderOptions</a></code> |

**Returns:** <code>Promise&lt;{ success: boolean; }&gt;</code>

--------------------


### isAvailable()

```typescript
isAvailable() => Promise<PrinterAvailableResult>
```

**Returns:** <code>Promise&lt;<a href="#printeravailableresult">PrinterAvailableResult</a>&gt;</code>

--------------------


### loadPlug()

```typescript
loadPlug() => Promise<void>
```

--------------------


### Interfaces


#### ListDevicesResult

| Prop          | Type                     |
| ------------- | ------------------------ |
| **`devices`** | <code>UsbDevice[]</code> |


#### UsbDevice

| Prop             | Type                |
| ---------------- | ------------------- |
| **`vendorId`**   | <code>number</code> |
| **`productId`**  | <code>number</code> |
| **`deviceName`** | <code>string</code> |


#### RequestPermissionResult

| Prop          | Type                 |
| ------------- | -------------------- |
| **`granted`** | <code>boolean</code> |


#### RequestPermissionOptions

| Prop            | Type                |
| --------------- | ------------------- |
| **`vendorId`**  | <code>number</code> |
| **`productId`** | <code>number</code> |


#### ConnectResult

| Prop            | Type                 |
| --------------- | -------------------- |
| **`connected`** | <code>boolean</code> |


#### ConnectOptions

| Prop            | Type                |
| --------------- | ------------------- |
| **`vendorId`**  | <code>number</code> |
| **`productId`** | <code>number</code> |


#### PrintResult

| Prop     | Type                 |
| -------- | -------------------- |
| **`ok`** | <code>boolean</code> |


#### PrintTextOptions

| Prop           | Type                                      |
| -------------- | ----------------------------------------- |
| **`text`**     | <code>string</code>                       |
| **`encoding`** | <code>'GBK' \| 'GB2312' \| 'UTF-8'</code> |
| **`feed`**     | <code>number</code>                       |
| **`cut`**      | <code>boolean</code>                      |


#### PrintRawOptions

| Prop             | Type                |
| ---------------- | ------------------- |
| **`dataBase64`** | <code>string</code> |


#### PrintOrderOptions

| Prop          | Type                     |
| ------------- | ------------------------ |
| **`orderId`** | <code>string</code>      |
| **`items`**   | <code>PrintItem[]</code> |


#### PrintItem

| Prop        | Type                |
| ----------- | ------------------- |
| **`name`**  | <code>string</code> |
| **`qty`**   | <code>number</code> |
| **`price`** | <code>number</code> |


#### PrinterAvailableResult

| Prop            | Type                 |
| --------------- | -------------------- |
| **`available`** | <code>boolean</code> |
| **`device`**    | <code>string</code>  |

</docgen-api>
