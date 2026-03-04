const app = getApp();
const { STATUS_TAGS, TECH_TAGS, DESIGN_TAGS, INTEREST_TAGS, GRADE_OPTIONS } = require('../../utils/tags');

Page({
  data: {
    // 表单数据
    avatar: '',
    name: '',
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
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    // 加载已有资料
    this.loadUserProfile();
  },

  // 加载用户已有资料
  loadUserProfile() {
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${app.globalData.API_BASE}/user/me`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const user = res.data;
          this.setData({
            avatar: user.avatar || '',
            name: user.name || '',
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
      }
    });
  },

  // 头像选择
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 开发阶段直接使用本地路径
        this.setData({ avatar: tempFilePath });
      }
    });
  },

  // 基础信息输入
  onNameInput(e) {
    this.setData({ name: e.detail.value });
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
    const { name, grade, major, wechatId, selectedStatus } = this.data;
    const canSubmit = name && grade && major && wechatId && selectedStatus;
    this.setData({ canSubmit });
  },

  // 提交
  submit() {
    if (!this.data.canSubmit || this.data.isSubmitting) return;

    const {
      avatar, name, grade, major, wechatId, bio, projectName,
      selectedStatus, selectedTechTags, selectedDesignTags, selectedInterests
    } = this.data;

    this.setData({ isSubmitting: true });

    const data = {
      avatar,
      name,
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

    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.API_BASE}/user/profile`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data,
      success: (res) => {
        this.setData({ isSubmitting: false });
        
        if (res.statusCode === 200) {
          // 保存用户信息
          wx.setStorageSync('userInfo', { ...data, isProfileComplete: true });
          
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
            title: res.data?.message || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        this.setData({ isSubmitting: false });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});
