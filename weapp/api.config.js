// 小程序配置文件
// 根据部署环境选择不同的API地址

// ==================== 部署环境配置 ====================

// 本地开发环境
const DEV_CONFIG = {
  API_BASE: 'http://localhost:3000/api',
  ENV: 'development'
};

// 云托管环境（部署后使用这个）
// TODO: 部署完成后，把下面的xxx替换成实际的云托管域名
const CLOUD_CONFIG = {
  API_BASE: 'https://aiae-server-xxx.gz.apigw.tencentcs.com/api',
  ENV: 'production'
};

// ==================== 当前激活的配置 ====================
// 切换部署环境时，修改这里：
// - 本地开发：使用 DEV_CONFIG
// - 云托管：使用 CLOUD_CONFIG
const CURRENT_CONFIG = DEV_CONFIG;  // ← 部署时改成 CLOUD_CONFIG

// ==================== 导出配置 ====================
module.exports = {
  API_BASE: CURRENT_CONFIG.API_BASE,
  ENV: CURRENT_CONFIG.ENV,
  
  // 方便切换的快捷方式
  DEV_CONFIG,
  CLOUD_CONFIG,
  
  // 切换配置的方法
  useDev() {
    return DEV_CONFIG;
  },
  useCloud() {
    return CLOUD_CONFIG;
  }
};