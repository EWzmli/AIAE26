// 小程序入口 - 云开发版本
const { CONFIG, getFeatures } = require('./config');

App({
  globalData: {
    userInfo: null,
    token: null,
    config: CONFIG,
    features: getFeatures(),
    cloudReady: false
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用云开发功能',
        showCancel: false
      });
      return;
    }
    
    wx.cloud.init({
      env: '你的环境ID', // TODO: 替换为你的云开发环境ID
      traceUser: true
    });
    
    this.globalData.cloudReady = true;
    console.log('云开发初始化成功');
    
    // 检查登录状态
    this.checkLogin();
    
    // 根据审核模式调整tabBar
    this.adjustTabBar();
  },
  
  // 检查登录状态
  async checkLogin() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: { action: 'checkLogin' }
      });
      
      if (res.result.code === 0) {
        // 已登录且资料完善
        this.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
      } else if (res.result.code === 2) {
        // 需要完善资料
        wx.navigateTo({ url: '/pages/register/register' });
      } else {
        // 未注册，需要登录
        console.log('未登录，等待用户操作');
      }
    } catch (err) {
      console.error('登录检查失败:', err);
    }
  },
  
  // 根据审核模式调整tabBar
  adjustTabBar() {
    const features = this.globalData.features;
    
    if (CONFIG.AUDIT_MODE) {
      console.log('审核模式：隐藏社交功能');
    }
  },
  
  // 检查功能是否可用
  checkFeature(featureName) {
    return this.globalData.features[featureName] !== false;
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },

  // 全局请求封装 - 适配云开发
  request(options) {
    const { url, method = 'GET', data, success, fail, needAuth = true } = options;
    
    // API 到云函数的映射
    const apiMap = {
      '/user/me': { name: 'auth', action: 'getProfile' },
      '/posts': { name: 'posts', action: 'getList' },
      '/posts/create': { name: 'posts', action: 'create' },
      '/events': { name: 'events', action: 'getList' },
      '/social/match': { name: 'social', action: 'getMatches' }
    };
    
    // 查找对应的云函数
    let mapping = null;
    for (const [api, config] of Object.entries(apiMap)) {
      if (url.startsWith(api)) {
        mapping = config;
        break;
      }
    }
    
    if (!mapping) {
      console.warn('未找到对应的云函数:', url);
      fail && fail({ errMsg: 'API未映射' });
      return;
    }
    
    // 调用云函数
    wx.cloud.callFunction({
      name: mapping.name,
      data: {
        action: mapping.action,
        data: data
      }
    }).then(res => {
      if (res.result.code === 0) {
        success && success({ 
          statusCode: 200, 
          data: res.result 
        });
      } else {
        success && success({
          statusCode: 400,
          data: res.result
        });
      }
    }).catch(err => {
      console.error('云函数调用失败:', err);
      fail && fail(err);
    });
  }
});
