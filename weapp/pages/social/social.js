const app = getApp();

Page({
  data: {
    recommendations: [],
    remaining: 0,
    showModal: false,
    requestMessage: '',
    selectedUserId: null,
    isLoggedIn: false,
    isLoading: true
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.setData({ isLoggedIn: true, isLoading: true });
      this.loadRecommendations();
    } else {
      this.setData({ 
        isLoggedIn: false, 
        isLoading: false,
        recommendations: []
      });
    }
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 加载每日推荐
  loadRecommendations() {
    this.setData({ isLoading: true });
    
    wx.request({
      url: `${app.globalData.API_BASE}/social/recommendations`,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            recommendations: res.data.list || [],
            remaining: res.data.remaining || 0,
            isLoading: false
          });
        } else if (res.statusCode === 401) {
          // Token失效
          wx.removeStorageSync('token');
          this.setData({
            isLoggedIn: false,
            isLoading: false
          });
        } else {
          this.setData({ isLoading: false });
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        this.setData({ isLoading: false });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 卡片切换
  onCardChange(e) {
    // 可以在这里预加载数据
  },

  // 忽略
  onSkip(e) {
    const userId = e.currentTarget.dataset.id;
    
    wx.request({
      url: `${app.globalData.API_BASE}/social/interaction`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: {
        targetUserId: userId,
        action: 'skip'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.removeUser(userId);
        }
      }
    });
  },

  // 想认识
  onLike(e) {
    this.setData({
      showModal: true,
      selectedUserId: e.currentTarget.dataset.id,
      requestMessage: ''
    });
  },

  onMessageInput(e) {
    this.setData({ requestMessage: e.detail.value });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  // 发送申请
  sendRequest() {
    const { selectedUserId, requestMessage } = this.data;
    
    wx.request({
      url: `${app.globalData.API_BASE}/social/interaction`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: {
        targetUserId: selectedUserId,
        action: 'like',
        message: requestMessage
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: res.data.matched ? '匹配成功！' : '已发送申请',
            icon: 'success'
          });
          this.closeModal();
          this.removeUser(selectedUserId);
        }
      }
    });
  },

  // 从列表移除
  removeUser(userId) {
    const recommendations = this.data.recommendations.filter(
      item => item.id !== userId
    );
    this.setData({
      recommendations,
      remaining: recommendations.length
    });
  }
});
