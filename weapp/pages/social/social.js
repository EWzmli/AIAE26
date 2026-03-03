const app = getApp();

Page({
  data: {
    recommendations: [],
    remaining: 0,
    showModal: false,
    requestMessage: '',
    selectedUserId: null
  },

  onLoad() {
    this.loadRecommendations();
  },

  onShow() {
    this.loadRecommendations();
  },

  // 加载每日推荐
  loadRecommendations() {
    app.request({
      url: '/social/recommendations',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            recommendations: res.data.list,
            remaining: res.data.remaining
          });
        }
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
    
    app.request({
      url: '/social/interaction',
      method: 'POST',
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
    
    app.request({
      url: '/social/interaction',
      method: 'POST',
      data: {
        targetUserId: selectedUserId,
        action: 'like',
        message: requestMessage
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '已发送申请',
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
