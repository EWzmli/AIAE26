// 小程序入口
const API_BASE = 'http://localhost:3000/api';

App({
  globalData: {
    userInfo: null,
    token: null,
    API_BASE: API_BASE
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${API_BASE}/user/me`,
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
      url: `${API_BASE}${url}`,
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
