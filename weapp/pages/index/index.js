const app = getApp();

Page({
  data: {
    isLogin: false
  },

  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (token) {
      app.globalData.token = token;
      this.setData({ isLogin: true });
      // 获取用户信息
      this.getUserInfo();
    }
  },

  onShow() {
    if (this.data.isLogin) {
      // 已登录，跳转到社区页
      wx.switchTab({
        url: '/pages/community/community'
      });
    }
  },

  getUserInfo() {
    app.request({
      url: '/user/me',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          app.globalData.userInfo = res.data;
          // 检查是否完成资料
          if (!res.data.isProfileComplete) {
            wx.redirectTo({
              url: '/pages/register/register'
            });
          } else {
            wx.switchTab({
              url: '/pages/community/community'
            });
          }
        } else {
          // Token失效
          wx.removeStorageSync('token');
          this.setData({ isLogin: false });
        }
      }
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});
