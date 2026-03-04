// 名片页面
const app = getApp();

Page({
  data: {
    userInfo: {},
    qrCodeUrl: ''
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      // 从后端获取
      const token = wx.getStorageSync('token');
      wx.request({
        url: `${app.globalData.API_BASE}/user/me`,
        header: { 'Authorization': `Bearer ${token}` },
        success: (res) => {
          if (res.statusCode === 200) {
            this.setData({ userInfo: res.data });
            wx.setStorageSync('userInfo', res.data);
          }
        }
      });
    }
  },

  // 保存名片到相册
  saveCard() {
    // 创建画布生成名片图片
    const ctx = wx.createCanvasContext('cardCanvas');
    
    // 绘制背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 375, 600);
    
    // 绘制标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('AIAE 创业者名片', 20, 50);
    
    // 绘制姓名
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(this.data.userInfo.name || '未命名', 20, 120);
    
    // 绘制年级专业
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`${this.data.userInfo.grade || ''} · ${this.data.userInfo.major || ''}`, 20, 160);
    
    // 绘制状态
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(20, 180, 120, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(this.data.userInfo.statusTag || '', 30, 200);
    
    // 绘制简介
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px sans-serif';
    const bio = this.data.userInfo.bio || '暂无简介';
    ctx.fillText(bio.substring(0, 30), 20, 250);
    
    // 绘制底部提示
    ctx.fillStyle = '#666666';
    ctx.font = '12px sans-serif';
    ctx.fillText('扫码加入AIAE，发现更多创业伙伴', 20, 550);
    
    ctx.draw(false, () => {
      // 保存到相册
      wx.canvasToTempFilePath({
        canvasId: 'cardCanvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '名片已保存', icon: 'success' });
            },
            fail: () => {
              // 用户拒绝授权，改为预览
              wx.previewImage({
                urls: [res.tempFilePath]
              });
            }
          });
        }
      });
    });
  },

  // 分享名片
  shareCard() {
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.userInfo.name}的名片 - AIAE创业者社区`,
      path: `/pages/social/user-detail?id=${this.data.userInfo.id}`,
      imageUrl: '/images/share-card.png'
    };
  }
});
