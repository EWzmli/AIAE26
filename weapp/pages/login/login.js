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
    // 页面显示时重新检查
    if (app.globalData.isLogin) {
      wx.switchTab({ url: '/pages/community/community' });
    }
  },
  
  // 检查登录状态
  async checkLoginStatus() {
    try {
      wx.showLoading({ title: '检查登录中...' });
      
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: { action: 'checkLogin' }
      });
      
      wx.hideLoading();
      
      if (res.result.code === 0) {
        // 已登录且资料完善，直接进入首页
        app.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
        app.globalData.isLogin = true;
        
        wx.switchTab({ url: '/pages/community/community' });
      } else if (res.result.code === 2) {
        // 需要完善资料
        wx.redirectTo({ url: '/pages/register/register' });
      } else {
        // 未注册，留在登录页
        console.log('未登录，显示登录按钮');
      }
    } catch (err) {
      wx.hideLoading();
      console.error('登录检查失败:', err);
      // 云函数未部署时会报错，提示用户
      if (err.errMsg && err.errMsg.includes('not found')) {
        wx.showToast({
          title: '云函数未部署',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  // 微信一键登录
  async wxLogin() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    try {
      // 方案1：尝试获取用户信息
      let avatarUrl = '';
      let nickName = '';
      
      try {
        const profileRes = await wx.getUserProfile({
          desc: '用于完善用户资料',
          lang: 'zh_CN'
        });
        avatarUrl = profileRes.userInfo.avatarUrl;
        nickName = profileRes.userInfo.nickName;
      } catch (profileErr) {
        // 用户拒绝授权，使用默认信息
        console.log('用户拒绝授权头像昵称，使用默认值');
        avatarUrl = '';
        nickName = '微信用户';
      }
      
      // 调用云函数登录
      wx.showLoading({ title: '登录中...' });
      
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
      
      wx.hideLoading();
      
      if (res.result.code === 0) {
        // 已完善资料，直接进入
        app.globalData.userInfo = res.result.data;
        wx.setStorageSync('userInfo', res.result.data);
        app.globalData.isLogin = true;
        
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
      } else {
        wx.showToast({
          title: res.result.msg || '登录失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('登录失败:', err);
      
      let errorMsg = '登录失败，请重试';
      if (err.errMsg && err.errMsg.includes('cloud')) {
        errorMsg = '云函数未部署，请先部署云函数';
      }
      
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
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
      avatar: '',
      grade: '研二',
      major: '计算机科学',
      wechatId: 'test123',
      wechatMasked: 'te****23',
      projectName: 'AIAE平台',
      statusTag: '技术找项目',
      techTags: ['前端', '创业', 'AI'],
      designTags: [],
      interestTags: ['创业'],
      bio: '这是开发测试模式',
      isProfileComplete: true
    };

    wx.setStorageSync('userInfo', mockUser);
    app.globalData.userInfo = mockUser;
    app.globalData.isLogin = true;

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
