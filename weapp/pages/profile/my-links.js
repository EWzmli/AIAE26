const app = getApp();

Page({
  data: {
    matches: [],
    receivedLikes: [],
    activeTab: 'matches',
    isLoading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    this.loadMatches();
    this.loadReceivedLikes();
  },

  loadMatches() {
    const token = wx.getStorageSync('token');
    if (!token) return;

    this.setData({ isLoading: true });

    wx.request({
      url: `${app.globalData.API_BASE}/social/matches`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ 
            matches: res.data || [],
            isLoading: false 
          });
        } else {
          this.setData({ isLoading: false });
        }
      },
      fail: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  loadReceivedLikes() {
    const token = wx.getStorageSync('token');
    if (!token) return;

    wx.request({
      url: `${app.globalData.API_BASE}/social/received-likes`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ receivedLikes: res.data || [] });
        }
      }
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  goToUserDetail(e) {
    wx.navigateTo({
      url: `/pages/social/user-detail?id=${e.currentTarget.dataset.id}`
    });
  },

  copyWechat(e) {
    const wechatId = e.currentTarget.dataset.wechat;
    wx.setClipboardData({
      data: wechatId,
      success: () => {
        wx.showToast({ title: '微信号已复制' });
      }
    });
  },

  acceptLike(e) {
    const userId = e.currentTarget.dataset.id;
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${app.globalData.API_BASE}/social/interaction`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${token}` },
      data: {
        targetUserId: userId,
        action: 'like'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ 
            title: res.data.matched ? '匹配成功！' : '已接受',
            icon: 'success'
          });
          this.loadData();
        }
      }
    });
  }
});
