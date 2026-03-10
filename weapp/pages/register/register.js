// 注册页 - 云开发版本
const app = getApp();
const { STATUS_TAGS, TECH_TAGS, DESIGN_TAGS, INTEREST_TAGS, GRADE_OPTIONS } = require('../../utils/tags');

Page({
  data: {
    // 表单数据
    avatar: '',
    nickname: '',
    grade: '',
    gradeIndex: -1,
    grades: GRADE_OPTIONS,
    major: '',
    wechatId: '',
    bio: '',
    projectName: '',
    
    // 标签数据
    statusTags: STATUS_TAGS,
    techTags: TECH_TAGS,
    designTags: DESIGN_TAGS,
    interestTags: INTEREST_TAGS,
    
    // 选中状态
    selectedStatus: '',
    selectedTechTags: [],
    selectedDesignTags: [],
    selectedInterests: [],
    
    canSubmit: false,
    isSubmitting: false
  },

  onLoad() {
    // 云开发版本：不需要检查token，通过微信openid识别
    // 加载已有资料（如果有）
    this.loadUserProfile();
  },

  // 加载用户已有资料
  async loadUserProfile() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: { action: 'getProfile' }
      });
      
      if (res.result.code === 0 && res.result.data) {
        const user = res.result.data;
        this.setData({
          avatar: user.avatar || '',
          nickname: user.nickname || '',
          grade: user.grade || '',
          gradeIndex: GRADE_OPTIONS.indexOf(user.grade),
          major: user.major || '',
          wechatId: user.wechatId || '',
          bio: user.bio || '',
          projectName: user.projectName || '',
          selectedStatus: user.statusTag || '',
          selectedTechTags: user.techTags || [],
          selectedDesignTags: user.designTags || [],
          selectedInterests: user.interestTags || []
        });
        this.checkCanSubmit();
      }
    } catch (err) {
      console.error('加载用户资料失败:', err);
    }
  },

  // 头像选择
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // TODO: 上传到云存储
        this.setData({ avatar: tempFilePath });
      }
    });
  },

  // 基础信息输入
  onNameInput(e) {
    this.setData({ nickname: e.detail.value });
    this.checkCanSubmit();
  },

  onGradeChange(e) {
    const index = e.detail.value;
    this.setData({
      gradeIndex: index,
      grade: this.data.grades[index]
    });
    this.checkCanSubmit();
  },

  onMajorInput(e) {
    this.setData({ major: e.detail.value });
    this.checkCanSubmit();
  },

  onWechatInput(e) {
    this.setData({ wechatId: e.detail.value });
    this.checkCanSubmit();
  },

  onBioInput(e) {
    this.setData({ bio: e.detail.value });
  },

  onProjectNameInput(e) {
    this.setData({ projectName: e.detail.value });
  },

  // 标签选择
  selectStatus(e) {
    this.setData({ selectedStatus: e.currentTarget.dataset.id });
    this.checkCanSubmit();
  },

  toggleTechTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const tags = [...this.data.selectedTechTags];
    const index = tags.indexOf(tag);
    
    if (index > -1) {
      tags.splice(index, 1);
    } else if (tags.length < 5) {
      tags.push(tag);
    } else {
      wx.showToast({ title: '最多选择5个', icon: 'none' });
      return;
    }
    
    this.setData({ selectedTechTags: tags });
  },

  toggleDesignTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const tags = [...this.data.selectedDesignTags];
    const index = tags.indexOf(tag);
    
    if (index > -1) {
      tags.splice(index, 1);
    } else if (tags.length < 3) {
      tags.push(tag);
    } else {
      wx.showToast({ title: '最多选择3个', icon: 'none' });
      return;
    }
    
    this.setData({ selectedDesignTags: tags });
  },

  toggleInterest(e) {
    const tag = e.currentTarget.dataset.tag;
    const tags = [...this.data.selectedInterests];
    const index = tags.indexOf(tag);
    
    if (index > -1) {
      tags.splice(index, 1);
    } else if (tags.length < 3) {
      tags.push(tag);
    } else {
      wx.showToast({ title: '最多选择3个', icon: 'none' });
      return;
    }
    
    this.setData({ selectedInterests: tags });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { nickname, grade, major, wechatId, selectedStatus } = this.data;
    const canSubmit = nickname && grade && major && wechatId && selectedStatus;
    this.setData({ canSubmit });
  },

  // 提交 - 云开发版本
  async submit() {
    if (!this.data.canSubmit || this.data.isSubmitting) return;

    const {
      avatar, nickname, grade, major, wechatId, bio, projectName,
      selectedStatus, selectedTechTags, selectedDesignTags, selectedInterests
    } = this.data;

    this.setData({ isSubmitting: true });

    const data = {
      avatar,
      nickname,
      grade,
      major,
      wechatId,
      bio,
      projectName,
      statusTag: selectedStatus,
      techTags: selectedTechTags,
      designTags: selectedDesignTags,
      interestTags: selectedInterests
    };

    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'completeProfile',
          data: data
        }
      });

      this.setData({ isSubmitting: false });
      
      if (res.result.code === 0) {
        // 保存用户信息
        app.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/community/community'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: res.result.msg || '保存失败',
          icon: 'none'
        });
      }
    } catch (err) {
      this.setData({ isSubmitting: false });
      console.error('提交失败:', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  }
});
