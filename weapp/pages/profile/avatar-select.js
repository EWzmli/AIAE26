// pages/profile/avatar-select.js
const { 
  getAvatarPresets, 
  createGradientAvatar, 
  createTextAvatar, 
  chooseAvatarFromAlbum,
  uploadAvatar 
} = require('../../utils/avatarGenerator');

Page({
  data: {
    userInfo: {},
    presets: [],
    selectedStyle: 'all',
    customAvatar: null,
    generatedAvatars: [],
    currentTab: 'preset', // preset, ai, album
    isGenerating: false,
    aiPrompt: ''
  },

  onLoad(options) {
    this.loadUserInfo();
    this.loadPresets();
  },

  onReady() {
    // 预生成一些头像
    this.generatePreviewAvatars();
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    this.setData({
      userInfo: app.globalData.userInfo || {}
    });
  },

  // 加载预设头像
  loadPresets() {
    const presets = getAvatarPresets();
    this.setData({ 
      presets,
      filteredPresets: presets
    });
  },

  // 生成预览头像
  async generatePreviewAvatars() {
    const presets = getAvatarPresets();
    const generated = [];
    
    // 选择前6个生成预览
    for (let i = 0; i < Math.min(6, presets.length); i++) {
      try {
        const path = await createGradientAvatar(presets[i].color, presets[i].icon);
        generated.push({
          ...presets[i],
          path
        });
      } catch (e) {
        console.error('Generate preview failed:', e);
      }
    }
    
    this.setData({ generatedAvatars: generated });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    
    if (tab === 'ai' && this.data.generatedAvatars.length === 0) {
      this.generatePreviewAvatars();
    }
  },

  // 筛选风格
  filterStyle(e) {
    const style = e.currentTarget.dataset.style;
    const presets = getAvatarPresets();
    const filtered = style === 'all' ? presets : presets.filter(p => p.style === style);
    
    this.setData({
      selectedStyle: style,
      filteredPresets: filtered
    });
  },

  // 选择预设头像
  async selectPreset(e) {
    const preset = e.currentTarget.dataset.preset;
    
    wx.showLoading({ title: '生成中...' });
    
    try {
      const path = await createGradientAvatar(preset.color, preset.icon);
      this.setData({ customAvatar: path });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
  },

  // 选择生成的AI头像
  selectGenerated(e) {
    const path = e.currentTarget.dataset.path;
    this.setData({ customAvatar: path });
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

  // 生成文字头像
  async generateTextAvatar() {
    const { userInfo } = this.data;
    const name = userInfo.nickname || userInfo.name || 'A';
    
    wx.showLoading({ title: '生成中...' });
    
    try {
      const path = await createTextAvatar(name);
      this.setData({ customAvatar: path });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
  },

  // AI提示词输入
  onPromptInput(e) {
    this.setData({ aiPrompt: e.detail.value });
  },

  // 生成AI头像
  async generateAI() {
    const { aiPrompt } = this.data;
    
    if (!aiPrompt.trim()) {
      wx.showToast({ title: '请输入描述', icon: 'none' });
      return;
    }
    
    this.setData({ isGenerating: true });
    
    try {
      // 这里应该调用AI生成API
      // 现在使用随机预设
      const presets = getAvatarPresets();
      const random = presets[Math.floor(Math.random() * presets.length)];
      const path = await createGradientAvatar(random.color, random.icon);
      
      this.setData({
        customAvatar: path,
        isGenerating: false
      });
    } catch (error) {
      this.setData({ isGenerating: false });
      wx.showToast({ title: '生成失败', icon: 'none' });
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
    const { customAvatar } = this.data;
    
    if (!customAvatar) {
      wx.showToast({ title: '请先生成头像', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    try {
      // 上传到服务器
      // const avatarUrl = await uploadAvatar(customAvatar);
      
      // 保存到本地并更新用户信息
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      if (prevPage && prevPage.setAvatar) {
        prevPage.setAvatar(customAvatar);
      }
      
      // 保存到本地存储
      wx.setStorageSync('tempAvatar', customAvatar);
      
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