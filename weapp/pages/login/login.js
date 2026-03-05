const app = getApp();

Page({
  data: {
    email: '',
    verifyCode: '',
    showCodeInput: false,
    countdown: 0,
    canSubmit: false,
    isValidEmail: false,
    isDevMode: false  // 开发模式，生产环境设为false
  },

  onLoad() {
    // 检查是否是开发环境
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      isDevMode: sysInfo.platform === 'devtools'
    });
  },

  onEmailInput(e) {
    const email = e.detail.value.trim();
    const isValidEmail = this.validateEmail(email);
    this.setData({
      email,
      isValidEmail,
      canSubmit: isValidEmail && !this.data.showCodeInput
    });
  },

  onCodeInput(e) {
    const verifyCode = e.detail.value;
    this.setData({
      verifyCode,
      canSubmit: verifyCode.length === 6
    });
  },

  // 验证邮箱格式
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@sjtu\.edu\.cn$/;
    return emailRegex.test(email);
  },

  sendCode() {
    const { email, isValidEmail } = this.data;
    
    if (!isValidEmail) {
      wx.showToast({
        title: '请输入正确的交大邮箱',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '发送中...' });

    // 调用发送验证码API
    wx.request({
      url: `${app.globalData.API_BASE}/api/auth/send-code`,
      method: 'POST',
      data: { email },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          this.setData({ 
            showCodeInput: true,
            canSubmit: false
          });
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.message || '发送失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  startCountdown() {
    let countdown = 60;
    this.setData({ countdown });
    
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({ 
          countdown: 0,
          canSubmit: this.data.isValidEmail
        });
      } else {
        this.setData({ countdown });
      }
    }, 1000);
  },

  submit() {
    const { showCodeInput, email, verifyCode, isValidEmail } = this.data;
    
    if (!showCodeInput) {
      this.sendCode();
      return;
    }

    if (!isValidEmail) {
      wx.showToast({
        title: '邮箱格式错误',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    // 登录
    wx.request({
      url: `${app.globalData.API_BASE}/api/auth/login`,
      method: 'POST',
      data: { email, code: verifyCode },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.token) {
          // 保存token
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('userEmail', email);
          app.globalData.token = res.data.token;
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 检查是否完善资料
          if (res.data.isNewUser || !res.data.user.isProfileComplete) {
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/register/register'
              });
            }, 1000);
          } else {
            // 获取完整用户信息
            this.fetchUserInfo(res.data.token);
          }
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 获取用户信息
  fetchUserInfo(token) {
    wx.request({
      url: `${app.globalData.API_BASE}/api/user/me`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.setStorageSync('userInfo', res.data);
          app.globalData.userInfo = res.data;
          
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/community/community'
            });
          }, 1000);
        }
      }
    });
  },

  jAccountLogin() {
    wx.showToast({
      title: 'jAccount登录开发中',
      icon: 'none'
    });
  },

  // 开发测试入口 - 跳过登录
  devLogin() {
    const mockUser = {
      id: 'dev001',
      nickname: '测试用户',
      name: '开发者',
      grade: '研二',
      major: '计算机科学',
      bio: '这是开发测试模式',
      techTags: ['前端', '创业', 'AI'],
      interestTags: [],
      isProfileComplete: true
    };
    const mockToken = 'dev_token_' + Date.now();

    wx.setStorageSync('token', mockToken);
    wx.setStorageSync('userInfo', mockUser);
    
    app.globalData.token = mockToken;
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