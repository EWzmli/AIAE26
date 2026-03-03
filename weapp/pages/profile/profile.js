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
    this.loadUserInfo();
    this.loadStats();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      app.request({
        url: '/user/me',
        success: (res) => {
          if (res.statusCode === 200) {
            this.setData({ userInfo: res.data });
            app.globalData.userInfo = res.data;
          }
        }
      });
    }
  },

  loadStats() {
    app.request({
      url: '/user/stats',
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
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goToMyEvents() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goToMyLinks() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goToBusinessCard() {
    wx.showToast({
      title: '名片功能开发中',
      icon: 'none'
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
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
