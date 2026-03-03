const app = getApp();
const { ROLE_OPTIONS, COMMITMENT_OPTIONS } = require('../../utils/tags');

Page({
  data: {
    currentTab: 'hiring',
    posts: [],
    events: [],
    roleOptions: ['全部', ...ROLE_OPTIONS],
    commitmentOptions: ['全部', ...COMMITMENT_OPTIONS.map(c => c.label)],
    roleFilter: '',
    commitmentFilter: ''
  },

  onLoad() {
    this.loadPosts();
    this.loadEvents();
  },

  onShow() {
    this.loadPosts();
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // 加载招聘帖
  loadPosts() {
    const { roleFilter, commitmentFilter } = this.data;
    
    app.request({
      url: '/posts',
      data: {
        roleType: roleFilter === '全部' ? '' : roleFilter,
        commitment: commitmentFilter === '全部' ? '' : commitmentFilter
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ posts: res.data });
        }
      }
    });
  },

  // 加载活动
  loadEvents() {
    app.request({
      url: '/events',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ events: res.data });
        }
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
    wx.navigateTo({
      url: '/pages/community/create-post'
    });
  }
});
