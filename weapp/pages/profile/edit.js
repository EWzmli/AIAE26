// pages/profile/edit.js
const app = getApp();

Page({
  data: {
    userInfo: {
      techTags: [],
      interestTags: []
    },
    grades: ['本科大一', '本科大二', '本科大三', '本科大四', '硕士', '博士'],
    gradeIndex: 0,
    statusTags: ['寻找合伙人', '有项目找技术', '有技术找项目', '寻找投资', '资源共享'],
    tempAvatar: null,
    bioLength: 0
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    // 检查是否有临时头像
    const tempAvatar = wx.getStorageSync('tempAvatar');
    if (tempAvatar) {
      this.setData({
        tempAvatar,
        'userInfo.avatar': tempAvatar
      });
      wx.removeStorageSync('tempAvatar');
    }
  },

  loadUserInfo() {
    let userInfo = wx.getStorageSync('userInfo') || {};
    
    // 确保数组存在
    if (!userInfo.techTags) userInfo.techTags = [];
    if (!userInfo.interestTags) userInfo.interestTags = [];
    
    const gradeIndex = this.data.grades.indexOf(userInfo.grade);
    const bioLength = userInfo.bio ? userInfo.bio.length : 0;
    
    this.setData({
      userInfo,
      gradeIndex: gradeIndex >= 0 ? gradeIndex : 0,
      bioLength
    });
  },

  // 选择头像
  selectAvatar() {
    wx.navigateTo({
      url: '/pages/profile/avatar-select'
    });
  },

  // 表单输入处理
  onNicknameInput(e) {
    this.setData({ 'userInfo.nickname': e.detail.value });
  },

  onNameInput(e) {
    this.setData({ 'userInfo.name': e.detail.value });
  },

  onGradeChange(e) {
    this.setData({
      gradeIndex: e.detail.value,
      'userInfo.grade': this.data.grades[e.detail.value]
    });
  },

  onMajorInput(e) {
    this.setData({ 'userInfo.major': e.detail.value });
  },

  onBioInput(e) {
    const bio = e.detail.value;
    this.setData({
      'userInfo.bio': bio,
      bioLength: bio ? bio.length : 0
    });
  },

  onWechatInput(e) {
    this.setData({ 'userInfo.wechatId': e.detail.value });
  },

  onProjectInput(e) {
    this.setData({ 'userInfo.projectName': e.detail.value });
  },

  // 选择状态标签
  selectStatusTag(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({ 'userInfo.statusTag': tag });
  },

  // 添加技能标签
  addTechTag() {
    wx.showModal({
      title: '添加技能标签',
      placeholderText: '例如：JavaScript、产品设计...',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = this.data.userInfo;
          const tags = userInfo.techTags || [];
          if (!tags.includes(res.content)) {
            tags.push(res.content);
            this.setData({
              'userInfo.techTags': tags
            });
          }
        }
      }
    });
  },

  // 删除技能标签
  removeTechTag(e) {
    const index = e.currentTarget.dataset.index;
    const userInfo = this.data.userInfo;
    const tags = userInfo.techTags || [];
    tags.splice(index, 1);
    this.setData({
      'userInfo.techTags': tags
    });
  },

  // 添加兴趣标签
  addInterestTag() {
    wx.showModal({
      title: '添加兴趣标签',
      placeholderText: '例如：摄影、咖啡、徒步...',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = this.data.userInfo;
          const tags = userInfo.interestTags || [];
          if (!tags.includes(res.content)) {
            tags.push(res.content);
            this.setData({
              'userInfo.interestTags': tags
            });
          }
        }
      }
    });
  },

  // 删除兴趣标签
  removeInterestTag(e) {
    const index = e.currentTarget.dataset.index;
    const userInfo = this.data.userInfo;
    const tags = userInfo.interestTags || [];
    tags.splice(index, 1);
    this.setData({
      'userInfo.interestTags': tags
    });
  },

  // 保存资料
  saveProfile() {
    const { userInfo } = this.data;
    
    // 验证必填项
    if (!userInfo.name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!userInfo.grade) {
      wx.showToast({ title: '请选择年级', icon: 'none' });
      return;
    }
    if (!userInfo.major) {
      wx.showToast({ title: '请输入专业', icon: 'none' });
      return;
    }
    if (!userInfo.wechatId) {
      wx.showToast({ title: '请输入微信号', icon: 'none' });
      return;
    }
    if (!userInfo.statusTag) {
      wx.showToast({ title: '请选择状态标签', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${app.globalData.API_BASE}/api/user/profile`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: userInfo,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          wx.setStorageSync('userInfo', userInfo);
          
          // 更新全局数据
          app.globalData.userInfo = userInfo;
          
          wx.showToast({ title: '保存成功', icon: 'success' });
          
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        } else {
          wx.showToast({ title: res.data.message || '保存失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});