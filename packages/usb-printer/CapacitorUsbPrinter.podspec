require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'CapacitorRydeenUsbPrinter'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = 'https://www.rydeen.com.cn'
  s.author = package['author']
  s.source = { :git => 'git@codeup.aliyun.com:rydeen/o2o/middle-platform/tw/front/cross-platform-app.git', :tag => package['name'] + '@' + package['version'] }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}', 'app/ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '13.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
