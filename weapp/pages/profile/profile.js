const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: {
      links: 0,
      posts: 0,
      events: 0
    }
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.loadUserInfo();
    this.loadStats();
  },

  checkLogin() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
    
    // 同时从后端获取最新数据
    const token = wx.getStorageSync('token');
    if (token) {
      wx.request({
        url: `${app.globalData.API_BASE}/user/me`,
        header: { 'Authorization': `Bearer ${token}` },
        success: (res) => {
          if (res.statusCode === 200) {
            this.setData({ userInfo: res.data });
            wx.setStorageSync('userInfo', res.data);
          }
        }
      });
    }
  },

  loadStats() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${app.globalData.API_BASE}/user/stats`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ stats: res.data });
        }
      }
    });
  },

  goToEdit() {
    wx.navigateTo({
      url: '/pages/profile/edit'
    });
  },

  goToMyPosts() {
    wx.navigateTo({
      url: '/pages/profile/my-posts'
    });
  },

  goToMyEvents() {
    wx.navigateTo({
      url: '/pages/profile/my-events'
    });
  },

  goToMyLinks() {
    wx.navigateTo({
      url: '/pages/profile/my-links'
    });
  },

  goToBusinessCard() {
    wx.navigateTo({
      url: '/pages/profile/card'
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          app.globalData.token = null;
          app.globalData.userInfo = null;
          
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
});
