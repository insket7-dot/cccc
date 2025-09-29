const fs = require('fs');
const ObsClient = require('esdk-obs-nodejs');
const axios = require('axios');
const path = require('path');

let env = process.argv[2];
if (!env) {
  env = `.prod`;
} else {
  env = `.${env}`;
}

const envFile = path.join(__dirname, `./src/environments/environment${env}.ts`);
let envContent = fs.readFileSync(envFile, 'utf8');
console.log('【PATCH_PACK】', `读取到environment文件：${envFile}`);

// 读取环境变量
let match = envContent.match(/appVersion: '([^']+)'/);
const appVersion = match ? match[1] : null;
match = envContent.match(/assetsVersion: '([^']+)'/);
const assetsVersion = match ? match[1] : null;
match = envContent.match(/minVersionCode: '([^']+)'/);
const minVersionCode = match ? match[1] : null;
match = envContent.match(/minVersionName: '([^']+)'/);
const minVersionName = match ? match[1] : null;
match = envContent.match(/maxVersionCode: '([^']+)'/);
const maxVersionCode = match ? match[1] : null;
match = envContent.match(/bucketBaseUrl: '([^']+)'/);
const bucketBaseUrl = match ? match[1] : null;
match = envContent.match(/patchServerUrl: '([^']+)'/);
const patchServerUrl = match ? match[1] : null;
match = envContent.match(/patchPathKey: '([^']+)'/);
let bucketPathKey = match ? match[1] : null;
bucketPathKey = bucketPathKey ? bucketPathKey.endsWith('/') ? bucketPathKey : bucketPathKey + '/' : '/';
console.log('【PATCH_PACK】', `读取到环境变量：\n${JSON.stringify({
  appVersion,
  assetsVersion,
  minVersionCode,
  minVersionName,
  maxVersionCode,
  bucketBaseUrl,
  patchServerUrl,
  bucketPathKey
}, null, 2)}
})}`);

// 读取包名
const capacitorConfigFile = path.join(__dirname, './capacitor.config.json');
const capacitorConfig = fs.readFileSync(capacitorConfigFile, 'utf8');
match = capacitorConfig.match(/"appId": "([^"]+)"/);
let packageName = match ? match[1] : null;
console.log('【PATCH_PACK】', `读取到App包名信息：${packageName}`);

// 创建patch目录
const patchDir = path.join(__dirname, 'patch');
if (!fs.existsSync(patchDir)) {
  fs.mkdirSync(patchDir);
}

// 创建patch-${appVersion}-${assetsVersion}.zip文件的输出流
const fileName = `patch-${appVersion}-${assetsVersion}.zip`;
const output = fs.createWriteStream(path.join(__dirname, `patch/${fileName}`));
const archive = archiver('zip', {
  zlib: { level: 9 }
});


output.on('close', () => {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', (err) => {
  throw err;
});

// 建立输出流管道
archive.pipe(output);

// 将dist目录下的文件添加到zip包
archive.directory(path.join(__dirname, 'dist/'), false);
console.log('【PATCH_PACK】', `将资源打包到：${output.path}`);

// 完成归档
archive.finalize().then(() => {
  // 递归删除源文件目录
  fs.rmSync(path.join(__dirname, 'dist/'), { recursive: true });
  console.log('【PATCH_PACK】', `dist目录已清空`);


// 创建OBS客户端实例
//   const obsClient = new ObsClient({
//     access_key_id: '35AP9KVKRXBGDGJDHBWX',
//     secret_access_key: 'ttq7Ohsb7n5zGS5Yn3fZ2V9eT4wUZYBqbJPNy4J4',
//     server: 'https://obs.cn-north-4.myhuaweicloud.com',
//     max_retry_count: 3,
//     timeout: 20
//   });
//   console.log('【PATCH_PACK】', `OBS客户端已初始化。`);
// 初始化sdk
//   obsClient.putObject({
//     'Bucket': 'rydeen-sxx-bucket',
//     'Key': bucketPathKey + fileName,
//     'SourceFile': path.join(__dirname, `patch/${fileName}`),
//     'ContentType': 'application/zip'
//   }).then(result => {
//     console.log('【PATCH_PACK】', `补丁文件上传成功。`);
//     console.log('【PATCH_PACK】', `补丁信息即将发布到补丁服务器(${patchServerUrl})`);
//     // 上传成功后，调用接口通知服务器
//     axios.post(patchServerUrl, {
//       packageName,
//       assetsVersion,
//       downloadUrl: bucketBaseUrl + bucketPathKey + fileName,
//       minVersionCode,
//       minVersionName,
//       maxVersionCode,
//       maxVersionName: appVersion
//     }).then(response => {
//       if (response.data.success) {
//         console.log('【PATCH_PACK】', `补丁发布成功，发布结果：${response.data.msg}`);
//       } else {
//         console.error(response.data.msg);
//       }
//     }).catch(error => {
//       console.error('【PATCH_PACK】', '补丁发布失败', error);
//     });
//   }).catch(err => {
//     console.error('【PATCH_PACK】', 'error:', err);
//   });

});

