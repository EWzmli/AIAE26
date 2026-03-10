// 登录页 - 云开发版本（微信一键登录）
const app = getApp();

Page({
  data: {
    isLoading: false,
    isDevMode: false
  },

  onLoad() {
    // 检查是否是开发环境
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      isDevMode: sysInfo.platform === 'devtools'
    });
    
    // 页面加载时检查登录状态
    this.checkLoginStatus();
  },
  
  onShow() {
    this.checkLoginStatus();
  },
  
  // 检查登录状态
  async checkLoginStatus() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: { action: 'checkLogin' }
      });
      
      if (res.result.code === 0) {
        // 已登录且资料完善，直接进入首页
        app.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
        wx.switchTab({ url: '/pages/community/community' });
      } else if (res.result.code === 2) {
        // 需要完善资料
        wx.redirectTo({ url: '/pages/register/register' });
      }
    } catch (err) {
      console.log('登录检查:', err);
    }
  },

  // 微信一键登录
  async wxLogin() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    try {
      // 获取微信用户信息
      const profileRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      
      const { avatarUrl, nickName } = profileRes.userInfo;
      
      // 调用云函数登录
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'wxLogin',
          data: {
            avatar: avatarUrl,
            nickname: nickName
          }
        }
      });
      
      if (res.result.code === 0) {
        // 已完善资料，直接进入
        app.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.switchTab({ url: '/pages/community/community' });
        }, 800);
        
      } else if (res.result.code === 2) {
        // 需要完善资料
        wx.showToast({
          title: '请完善资料',
          icon: 'none'
        });
        
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/register/register'
          });
        }, 500);
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
    
    this.setData({ isLoading: false });
  },

  // 微信静默登录（不需要用户信息授权）
  async wxSilentLogin() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'wxLogin',
          data: {}
        }
      });
      
      if (res.result.code === 0) {
        app.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
        wx.switchTab({ url: '/pages/community/community' });
      } else if (res.result.code === 2) {
        wx.navigateTo({
          url: '/pages/register/register'
        });
      }
    } catch (err) {
      console.error('静默登录失败:', err);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    }
    
    this.setData({ isLoading: false });
  },

  // jAccount登录（暂不支持）
  jAccountLogin() {
    wx.showToast({
      title: 'jAccount登录即将上线',
      icon: 'none'
    });
  },

  // 开发测试入口 - 跳过登录
  devLogin() {
    const mockUser = {
      _id: 'dev001',
      nickname: '测试用户',
      grade: '研二',
      major: '计算机科学',
      bio: '这是开发测试模式',
      techTags: ['前端', '创业', 'AI'],
      interestTags: [],
      isProfileComplete: true
    };

    wx.setStorageSync('userInfo', mockUser);
    app.globalData.userInfo = mockUser;

    wx.showToast({
      title: '开发模式登录',
      icon: 'success'
    });

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/community/community'
      });
    }, 1000);
  },

  goBack() {
    wx.navigateBack();
  }
});
