// swift-UsbPrinter-version: 1.0
import PackageDescription

let package = Package(
    name: "CapacitorUsbPrinter",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapacitorUsbPrinter",
            targets: ["UsbPrinterPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "UsbPrinterPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/UsbPrinterPlugin"),
        .testTarget(
            name: "UsbPrinterPluginTests",
            dependencies: ["UsbPrinterPlugin"],
            path: "ios/Tests/UsbPrinterPluginTests")
    ]
)
