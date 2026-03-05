// pages/profile/card.js
const app = getApp();
const { previewAndPrintCard } = require('../../utils/cardGenerator');

Page({
  data: {
    userInfo: {},
    cardImage: null,
    isGenerating: false,
    showActions: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    // 每次显示页面时重新生成名片（用户信息可能已更新）
    if (this.data.userInfo.id) {
      this.generateCard();
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
      this.generateCard();
    } else {
      this.fetchUserInfo();
    }
  },

  // 从服务器获取用户信息
  fetchUserInfo() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.API_BASE}/api/user/me`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ userInfo: res.data });
          wx.setStorageSync('userInfo', res.data);
          this.generateCard();
        }
      }
    });
  },

  // 生成名片图片
  async generateCard() {
    this.setData({ isGenerating: true });
    
    try {
      // 使用新的名片生成器
      const query = wx.createSelectorQuery();
      query.select('#cardCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) {
          this.setData({ isGenerating: false });
          return;
        }
        
        const canvas = res[0].node;
        this.drawBusinessCard(canvas, this.data.userInfo);
      });
    } catch (error) {
      console.error('Generate card failed:', error);
      this.setData({ isGenerating: false });
    }
  },

  // 绘制名片
  drawBusinessCard(canvas, userData) {
    const ctx = canvas.getContext('2d');
    const width = 1050;
    const height = 600;
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制装饰线条
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height - 80);
    ctx.lineTo(width, height - 80);
    ctx.stroke();
    
    // 绘制左侧头像区域背景
    ctx.fillStyle = 'rgba(233, 69, 96, 0.1)';
    ctx.fillRect(0, 0, 280, height);
    
    // 绘制头像或首字母
    const name = userData.nickname || userData.name || 'A';
    const initial = name.charAt(0).toUpperCase();
    
    if (userData.avatar) {
      wx.getImageInfo({
        src: userData.avatar,
        success: (imgInfo) => {
          const img = canvas.createImage();
          img.src = userData.avatar;
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(140, 200, 80, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 60, 120, 160, 160);
            ctx.restore();
            
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(140, 200, 82, 0, 2 * Math.PI);
            ctx.stroke();
            
            this.drawCardText(ctx, userData, width, height);
            this.exportCard(canvas);
          };
          img.onerror = () => {
            this.drawDefaultAvatar(ctx, initial, 140, 200);
            this.drawCardText(ctx, userData, width, height);
            this.exportCard(canvas);
          };
        },
        fail: () => {
          this.drawDefaultAvatar(ctx, initial, 140, 200);
          this.drawCardText(ctx, userData, width, height);
          this.exportCard(canvas);
        }
      });
    } else {
      this.drawDefaultAvatar(ctx, initial, 140, 200);
      this.drawCardText(ctx, userData, width, height);
      this.exportCard(canvas);
    }
  },

  // 绘制默认头像
  drawDefaultAvatar(ctx, initial, x, y) {
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, x, y);
    
    // 边框
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 82, 0, 2 * Math.PI);
    ctx.stroke();
  },

  // 绘制名片文字
  drawCardText(ctx, userData, width, height) {
    const name = userData.nickname || userData.name || '未设置';
    const title = userData.statusTag || '上海交通大学创业者';
    const major = userData.major || '';
    const grade = userData.grade || '';
    const bio = userData.bio || '';
    const wechat = userData.wechatMasked || '';
    
    // 姓名
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 320, 120);
    
    // 身份标签
    ctx.fillStyle = '#e94560';
    ctx.font = '28px sans-serif';
    ctx.fillText(title, 320, 175);
    
    // 专业年级
    if (major || grade) {
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '24px sans-serif';
      const info = [grade, major].filter(Boolean).join(' · ');
      ctx.fillText(info, 320, 225);
    }
    
    // 分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(320, 270);
    ctx.lineTo(980, 270);
    ctx.stroke();
    
    // 个人简介
    if (bio) {
      ctx.fillStyle = '#c0c0c0';
      ctx.font = '22px sans-serif';
      const maxWidth = 640;
      const lineHeight = 36;
      let y = 315;
      
      const words = bio.split('');
      let line = '';
      let lineCount = 0;
      
      for (let i = 0; i < words.length && lineCount < 2; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 320, y);
          line = words[i];
          y += lineHeight;
          lineCount++;
        } else {
          line = testLine;
        }
      }
      if (lineCount < 2) {
        ctx.fillText(line, 320, y);
      }
    }
    
    // 联系方式
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('CONTACT', 320, 460);
    
    if (wechat) {
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '22px sans-serif';
      ctx.fillText(`微信: ${wechat}`, 320, 500);
    }
    
    // AIAE品牌
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('AIAE', 1000, 520);
    
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '18px sans-serif';
    ctx.fillText('上海交通大学创业者社区', 1000, 555);
  },

  // 导出名片
  exportCard(canvas) {
    wx.canvasToTempFilePath({
      canvas: canvas,
      success: (res) => {
        this.setData({
          cardImage: res.tempFilePath,
          isGenerating: false,
          showActions: true
        });
      },
      fail: () => {
        this.setData({ isGenerating: false });
      }
    });
  },

  // 预览名片
  previewCard() {
    const { cardImage } = this.data;
    if (cardImage) {
      wx.previewImage({
        urls: [cardImage],
        current: cardImage
      });
    }
  },

  // 保存到相册
  saveCard() {
    const { cardImage } = this.data;
    if (!cardImage) {
      wx.showToast({ title: '请等待生成完成', icon: 'none' });
      return;
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: cardImage,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        if (err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要授权',
            content: '请允许保存图片到相册',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          this.previewCard();
        }
      }
    });
  },

  // 打印名片
  printCard() {
    const { cardImage } = this.data;
    if (!cardImage) {
      wx.showToast({ title: '请等待生成完成', icon: 'none' });
      return;
    }
    
    wx.showActionSheet({
      itemList: ['保存并打印', '分享给打印店', '取消'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.saveAndPrint();
        } else if (res.tapIndex === 1) {
          this.shareToPrintShop();
        }
      }
    });
  },

  // 保存并打印
  saveAndPrint() {
    const { cardImage } = this.data;
    
    wx.saveImageToPhotosAlbum({
      filePath: cardImage,
      success: () => {
        wx.showModal({
          title: '保存成功',
          content: '名片已保存到相册\\n\\n打印建议：\\n• 尺寸：90mm × 54mm（标准名片）\\n• 纸张：300g铜版纸或特种纸\\n• 工艺：覆哑膜或UV\\n\\n您可以直接到打印店出示此图片进行打印',
          showCancel: false,
          confirmText: '我知道了'
        });
      },
      fail: (err) => {
        if (err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要授权',
            content: '请允许保存图片到相册',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },

  // 分享给打印店
  shareToPrintShop() {
    const { cardImage } = this.data;
    
    wx.showShareImageMenu({
      path: cardImage,
      success: () => {
        wx.showToast({ title: '分享成功', icon: 'success' });
      }
    });
  },

  // 分享名片
  onShareAppMessage() {
    const { userInfo } = this.data;
    return {
      title: `${userInfo.name}的名片 - AIAE创业者社区`,
      path: `/pages/social/user-detail?id=${userInfo.id}`,
      imageUrl: this.data.cardImage || '/images/share-card.png'
    };
  },

  onShareTimeline() {
    const { userInfo } = this.data;
    return {
      title: `${userInfo.name}的名片 - AIAE创业者社区`,
      query: `id=${userInfo.id}`,
      imageUrl: this.data.cardImage
    };
  }
});