// 社区页面 - 云开发版本
const app = getApp();
const { ROLE_OPTIONS, COMMITMENT_OPTIONS } = require('../../utils/tags');
const { showAuditTip } = require('../../config');

Page({
  data: {
    currentTab: 'hiring',
    posts: [],
    events: [],
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    roleOptions: ['全部', ...ROLE_OPTIONS],
    commitmentOptions: ['全部', ...COMMITMENT_OPTIONS.map(c => c.label)],
    roleFilter: '',
    commitmentFilter: '',
    canCreatePost: true
  },

  onLoad() {
    this.checkFeatures();
    this.loadPosts();
    // 活动暂时用静态数据或延后实现
    this.loadEventsStatic();
  },

  onShow() {
    // 刷新帖子列表
    this.setData({ page: 1, posts: [] });
    this.loadPosts();
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, posts: [], hasMore: true });
    this.loadPosts().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadPosts();
    }
  },
  
  // 检查功能开关
  checkFeatures() {
    const canCreatePost = app.checkFeature('POST_CREATE');
    this.setData({ canCreatePost });
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // 加载帖子列表 - 云开发版本
  async loadPosts() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'posts',
        data: {
          action: 'getList',
          data: {
            page: this.data.page,
            pageSize: this.data.pageSize,
            category: this.data.currentTab
          }
        }
      });
      
      if (res.result.code === 0) {
        const newPosts = res.result.data || [];
        this.setData({
          posts: this.data.page === 1 
            ? newPosts 
            : [...this.data.posts, ...newPosts],
          hasMore: newPosts.length >= this.data.pageSize
        });
      }
    } catch (err) {
      console.error('加载帖子失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
    
    this.setData({ loading: false });
  },

  // 静态活动数据（周六应急版）
  loadEventsStatic() {
    // 临时使用静态数据，后续可接入云函数
    const staticEvents = [
      {
        _id: 'event1',
        title: '创业者沙龙：AI时代的机遇',
        location: '闵行校区机动学院报告厅',
        startTime: '2026-03-15T14:00:00',
        participantCount: 45,
        maxParticipants: 100
      },
      {
        _id: 'event2',
        title: '路演训练营：如何打动投资人',
        location: '徐汇校区安泰经管学院',
        startTime: '2026-03-20T19:00:00',
        participantCount: 28,
        maxParticipants: 50
      }
    ];
    this.setData({ events: staticEvents });
  },

  // 筛选
  onRoleFilter(e) {
    const index = e.detail.value;
    this.setData({ 
      roleFilter: this.data.roleOptions[index],
      page: 1,
      posts: []
    });
    this.loadPosts();
  },

  onCommitmentFilter(e) {
    const index = e.detail.value;
    this.setData({ 
      commitmentFilter: this.data.commitmentOptions[index],
      page: 1,
      posts: []
    });
    this.loadPosts();
  },

  // 跳转
  goToPostDetail(e) {
    wx.navigateTo({
      url: `/pages/community/post-detail?id=${e.currentTarget.dataset.id}`
    });
  },

  goToEventDetail(e) {
    wx.navigateTo({
      url: `/pages/events/event-detail?id=${e.currentTarget.dataset.id}`
    });
  },

  goToCreatePost() {
    // 检查功能开关
    if (!app.checkFeature('POST_CREATE')) {
      showAuditTip('POST_CREATE');
      return;
    }
    
    // 检查登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.isProfileComplete) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/community/create-post'
    });
  }
});
