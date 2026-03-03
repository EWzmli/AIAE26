const app = getApp();
const { isSchoolEmail } = require('../../utils/util');

Page({
  data: {
    emailPrefix: '',
    email: '',
    verifyCode: '',
    showCodeInput: false,
    countdown: 0,
    canSubmit: false
  },

  onEmailInput(e) {
    const emailPrefix = e.detail.value;
    const email = emailPrefix + '@sjtu.edu.cn';
    this.setData({
      emailPrefix,
      email,
      canSubmit: emailPrefix.length > 0
    });
  },

  onCodeInput(e) {
    const verifyCode = e.detail.value;
    this.setData({
      verifyCode,
      canSubmit: verifyCode.length === 6
    });
  },

  sendCode() {
    const { email } = this.data;
    
    if (!email.includes('@sjtu.edu.cn')) {
      wx.showToast({
        title: '请使用校内邮箱',
        icon: 'none'
      });
      return;
    }

    // 调用发送验证码API
    app.request({
      url: '/auth/send-code',
      method: 'POST',
      data: { email },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          this.setData({ showCodeInput: true });
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.message || '发送失败',
            icon: 'none'
          });
        }
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
      }
      this.setData({ countdown });
    }, 1000);
  },

  submit() {
    const { showCodeInput, email, verifyCode } = this.data;
    
    if (!showCodeInput) {
      this.sendCode();
      return;
    }

    // 登录
    app.request({
      url: '/auth/login',
      method: 'POST',
      data: { email, code: verifyCode },
      success: (res) => {
        if (res.statusCode === 200 && res.data.token) {
          // 保存token
          wx.setStorageSync('token', res.data.token);
          app.globalData.token = res.data.token;
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 检查是否完善资料
          if (!res.data.user.isProfileComplete) {
            wx.redirectTo({
              url: '/pages/register/register'
            });
          } else {
            wx.switchTab({
              url: '/pages/community/community'
            });
          }
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          });
        }
      }
    });
  },

  jAccountLogin() {
    // TODO: jAccount OAuth2 对接（待授权）
    wx.showToast({
      title: 'jAccount登录开发中',
      icon: 'none'
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
