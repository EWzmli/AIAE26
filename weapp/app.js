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
    if (token) {
      this.globalData.token = token;
      this.getUserInfo();
    }
  },

  // 获取用户信息
  getUserInfo() {
    wx.request({
      url: `${API_BASE}/user/me`,
      header: {
        'Authorization': `Bearer ${this.globalData.token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data;
        } else {
          // Token失效，清除登录状态
          wx.removeStorageSync('token');
          this.globalData.token = null;
        }
      }
    });
  },

  // 全局请求封装
  request(options) {
    const { url, method = 'GET', data, success, fail } = options;
    
    wx.request({
      url: `${API_BASE}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 401) {
          // 未授权，跳转到登录页
          wx.navigateTo({ url: '/pages/login/login' });
          return;
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
