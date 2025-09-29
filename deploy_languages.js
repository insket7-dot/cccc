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
const maxVersionCode = match ? match[1] : null;
match = envContent.match(/bucketBaseUrl: '([^']+)'/);
const bucketBaseUrl = match ? match[1] : null;
match = envContent.match(/i18nPathKey: '([^']+)'/);
let i18nPathKey = match ? match[1] : null;
i18nPathKey = i18nPathKey ? i18nPathKey.endsWith('/') ? i18nPathKey : i18nPathKey + '/' : '/';


const i18nDirectory = path.join(__dirname, 'src/assets/i18n/');

// 创建OBS客户端实例
// const obsClient = new ObsClient({
//   access_key_id: '35AP9KVKRXBGDGJDHBWX',
//   secret_access_key: 'ttq7Ohsb7n5zGS5Yn3fZ2V9eT4wUZYBqbJPNy4J4',
//   server: 'https://obs.cn-north-4.myhuaweicloud.com',
//   max_retry_count: 3,
//   timeout: 20
// });
// console.log('【PATCH_PACK】', `OBS客户端已初始化。`);

fs.readdir(i18nDirectory, (err, files) => {
  if (err) {
    console.error('Error reading the directory', err);
    return;
  }

  // Filter JSON files
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  jsonFiles.forEach(file => {
    const filePath = path.join(i18nDirectory, file);
    const key = `${i18nPathKey}${file}`; // Customize your key/path in the bucket as needed

    // 初始化sdk
    // obsClient.putObject({
    //   'Bucket': 'rydeen-sxx-bucket',
    //   'Key': key,
    //   'SourceFile': filePath,
    //   'ContentType': 'application/zip'
    // }).then(result => {
    //   console.log('【I18N_DEPLOY】', `国际化文本发布成功，发布结果：${JSON.stringify(result)}`);
    // }).catch(err => {
    //   console.error('【I18N_DEPLOY】', 'error:', err);
    // });

  })
})
