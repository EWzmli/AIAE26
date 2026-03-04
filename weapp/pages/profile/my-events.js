const app = getApp();

Page({
  data: {
    registrations: [],
    isLoading: true
  },

  onLoad() {
    this.loadMyEvents();
  },

  onShow() {
    this.loadMyEvents();
  },

  loadMyEvents() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }

    this.setData({ isLoading: true });

    wx.request({
      url: `${app.globalData.API_BASE}/events/my/registrations`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            registrations: res.data || [],
            isLoading: false
          });
        } else {
          this.setData({ isLoading: false });
        }
      },
      fail: () => {
        this.setData({ isLoading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  goToDetail(e) {
    wx.navigateTo({
      url: `/pages/events/event-detail?id=${e.currentTarget.dataset.id}`
    });
  },

  cancelRegistration(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');
          wx.request({
            url: `${app.globalData.API_BASE}/events/${id}/register`,
            method: 'DELETE',
            header: { 'Authorization': `Bearer ${token}` },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ title: '取消成功' });
                this.loadMyEvents();
              }
            }
          });
        }
      }
    });
  }
});
