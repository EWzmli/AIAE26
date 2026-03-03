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
    
    canSubmit: false
  },

  // 头像选择
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // TODO: 上传到云存储（待配置）
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
    const tags = this.data.selectedTechTags;
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
    const tags = this.data.selectedDesignTags;
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
    const tags = this.data.selectedInterests;
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
    const {
      avatar, name, grade, major, wechatId, bio, projectName,
      selectedStatus, selectedTechTags, selectedDesignTags, selectedInterests
    } = this.data;

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

    app.request({
      url: '/user/profile',
      method: 'POST',
      data,
      success: (res) => {
        if (res.statusCode === 200) {
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
            title: res.data.message || '保存失败',
            icon: 'none'
          });
        }
      }
    });
  }
});
