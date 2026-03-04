const app = getApp();

Page({
  data: {
    posts: [],
    isLoading: true
  },

  onLoad() {
    this.loadMyPosts();
  },

  onShow() {
    this.loadMyPosts();
  },

  loadMyPosts() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }

    this.setData({ isLoading: true });

    wx.request({
      url: `${app.globalData.API_BASE}/user/my-posts`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ 
            posts: res.data || [],
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
      url: `/pages/community/post-detail?id=${e.currentTarget.dataset.id}`
    });
  },

  deletePost(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');
          wx.request({
            url: `${app.globalData.API_BASE}/posts/${id}`,
            method: 'DELETE',
            header: { 'Authorization': `Bearer ${token}` },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ title: '删除成功' });
                this.loadMyPosts();
              }
            }
          });
        }
      }
    });
  }
});
