const app = getApp();
const { ROLE_OPTIONS, COMMITMENT_OPTIONS } = require('../../utils/tags');
const { showAuditTip } = require('../../config');

Page({
  data: {
    currentTab: 'hiring',
    posts: [],
    events: [],
    roleOptions: ['全部', ...ROLE_OPTIONS],
    commitmentOptions: ['全部', ...COMMITMENT_OPTIONS.map(c => c.label)],
    roleFilter: '',
    commitmentFilter: '',
    canCreatePost: true  // 控制发帖按钮显示
  },

  onLoad() {
    this.checkFeatures();
    this.loadPosts();
    this.loadEvents();
  },

  onShow() {
    this.loadPosts();
    this.loadEvents();
  },
  
  // 检查功能开关
  checkFeatures() {
    const canCreatePost = app.checkFeature('POST_CREATE');
    this.setData({ canCreatePost });
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // 加载招聘帖
  loadPosts() {
    const { roleFilter, commitmentFilter } = this.data;
    
    wx.request({
      url: `${app.globalData.API_BASE}/posts`,
      data: {
        roleType: roleFilter === '全部' ? '' : roleFilter,
        commitment: commitmentFilter === '全部' ? '' : commitmentFilter
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ posts: res.data.list || [] });
        }
      },
      fail: () => {
        this.setData({ posts: [] });
      }
    });
  },

  // 加载活动
  loadEvents() {
    wx.request({
      url: `${app.globalData.API_BASE}/events`,
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ events: res.data || [] });
        }
      },
      fail: () => {
        this.setData({ events: [] });
      }
    });
  },

  // 筛选
  onRoleFilter(e) {
    const index = e.detail.value;
    this.setData({ 
      roleFilter: this.data.roleOptions[index] 
    });
    this.loadPosts();
  },

  onCommitmentFilter(e) {
    const index = e.detail.value;
    this.setData({ 
      commitmentFilter: this.data.commitmentOptions[index] 
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
    const token = wx.getStorageSync('token');
    if (!token) {
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