// pages/profile/avatar-select.js
const { 
  createDefaultAvatar, 
  chooseAvatarFromAlbum,
  uploadAvatar 
} = require('../../utils/avatarGenerator');

Page({
  data: {
    userInfo: {},
    customAvatar: null,
    generatedAvatar: null
  },

  onLoad(options) {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    this.setData({ userInfo });
    
    // 自动生成默认头像
    this.generateDefaultAvatar();
  },

  // 生成默认头像（姓名首字母）
  async generateDefaultAvatar() {
    const { userInfo } = this.data;
    const name = userInfo.nickname || userInfo.name || '用户';
    
    wx.showLoading({ title: '生成中...' });
    
    try {
      const path = await createDefaultAvatar(name);
      this.setData({ 
        generatedAvatar: path,
        customAvatar: path
      });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('Generate avatar failed:', error);
    }
  },

  // 从相册选择
  async chooseFromAlbum() {
    try {
      const path = await chooseAvatarFromAlbum();
      this.setData({ customAvatar: path });
    } catch (error) {
      wx.showToast({ title: '选择失败', icon: 'none' });
    }
  },

  // 预览头像
  previewAvatar() {
    const { customAvatar } = this.data;
    if (customAvatar) {
      wx.previewImage({
        urls: [customAvatar],
        current: customAvatar
      });
    }
  },

  // 保存头像
  async saveAvatar() {
    const { customAvatar, generatedAvatar } = this.data;
    
    if (!customAvatar) {
      wx.showToast({ title: '请先生成头像', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    try {
      // 如果是生成的默认头像，直接保存到本地
      // 如果是相册选择的，上传到服务器
      let avatarUrl = customAvatar;
      
      if (customAvatar !== generatedAvatar) {
        // 从相册选择的，需要上传
        try {
          avatarUrl = await uploadAvatar(customAvatar);
        } catch (e) {
          console.error('Upload failed, using local path:', e);
        }
      }
      
      // 保存到本地存储
      wx.setStorageSync('tempAvatar', avatarUrl);
      
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});