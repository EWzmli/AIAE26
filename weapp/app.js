// 小程序入口
const { API_BASE } = require('./api.config');
const { CONFIG, getFeatures } = require('./config');

App({
  globalData: {
    userInfo: null,
    token: null,
    API_BASE: API_BASE,  // 从配置文件读取
    config: CONFIG,
    features: getFeatures()
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
    
    // 根据审核模式调整tabBar
    this.adjustTabBar();
    
    // 打印当前环境（调试用）
    console.log('API_BASE:', API_BASE);
    console.log('AUDIT_MODE:', CONFIG.AUDIT_MODE);
  },
  
  // 根据审核模式调整tabBar
  adjustTabBar() {
    const features = this.globalData.features;
    
    if (CONFIG.AUDIT_MODE) {
      // 审核模式：只保留"社区"和"我的"，隐藏"社交"
      console.log('审核模式：隐藏社交功能');
    }
  },
  
  // 检查功能是否可用（用于页面内判断）
  checkFeature(featureName) {
    return this.globalData.features[featureName] !== false;
  },

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${this.globalData.API_BASE}/user/me`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data;
          wx.setStorageSync('userInfo', res.data);
        } else if (res.statusCode === 401) {
          // Token失效，清除登录状态
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          this.globalData.token = null;
          this.globalData.userInfo = null;
        }
      }
    });
  },

  // 全局请求封装
  request(options) {
    const { url, method = 'GET', data, success, fail, needAuth = true } = options;
    
    const token = wx.getStorageSync('token');
    
    // 需要登录但未登录
    if (needAuth && !token) {
      // 返回401让页面自己处理
      success && success({ statusCode: 401, data: { message: '未登录' } });
      return;
    }
    
    wx.request({
      url: `${this.globalData.API_BASE}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 401) {
          // Token失效，清除状态
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          this.globalData.token = null;
          this.globalData.userInfo = null;
        }
        success && success(res);
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        fail && fail(err);
      }
    });
  }
});