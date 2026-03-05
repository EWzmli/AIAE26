/**
 * 名片图片生成工具
 * 使用Canvas生成可打印的名片图片
 */

const CARD_WIDTH = 1050;  // 名片宽度 (3.5英寸 * 300dpi)
const CARD_HEIGHT = 600;  // 名片高度 (2英寸 * 300dpi)

/**
 * 创建名片Canvas
 * @param {Object} userData 用户数据
 * @returns {Promise<String>} Base64图片数据
 */
function createBusinessCard(userData) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select('#cardCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) {
        reject(new Error('Canvas not found'));
        return;
      }
      
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      
      // 设置Canvas尺寸
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      
      // 绘制背景
      const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      
      // 绘制装饰线条
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, CARD_HEIGHT - 80);
      ctx.lineTo(CARD_WIDTH, CARD_HEIGHT - 80);
      ctx.stroke();
      
      // 绘制左侧头像区域背景
      ctx.fillStyle = 'rgba(233, 69, 96, 0.1)';
      ctx.fillRect(0, 0, 280, CARD_HEIGHT);
      
      // 绘制头像
      if (userData.avatar) {
        wx.getImageInfo({
          src: userData.avatar,
          success: (imgInfo) => {
            const img = canvas.createImage();
            img.src = userData.avatar;
            img.onload = () => {
              // 绘制圆形头像
              ctx.save();
              ctx.beginPath();
              ctx.arc(140, 200, 80, 0, 2 * Math.PI);
              ctx.clip();
              ctx.drawImage(img, 60, 120, 160, 160);
              ctx.restore();
              
              // 绘制头像边框
              ctx.strokeStyle = '#e94560';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(140, 200, 82, 0, 2 * Math.PI);
              ctx.stroke();
              
              // 绘制文字信息
              drawCardText(ctx, userData);
              
              // 导出图片
              wx.canvasToTempFilePath({
                canvas: canvas,
                success: (res) => resolve(res.tempFilePath),
                fail: reject
              });
            };
            img.onerror = () => {
              // 头像加载失败，绘制默认头像
              drawDefaultAvatar(ctx, userData.name);
              drawCardText(ctx, userData);
              wx.canvasToTempFilePath({
                canvas: canvas,
                success: (res) => resolve(res.tempFilePath),
                fail: reject
              });
            };
          },
          fail: () => {
            drawDefaultAvatar(ctx, userData.name);
            drawCardText(ctx, userData);
            wx.canvasToTempFilePath({
              canvas: canvas,
              success: (res) => resolve(res.tempFilePath),
              fail: reject
            });
          }
        });
      } else {
        drawDefaultAvatar(ctx, userData.name);
        drawCardText(ctx, userData);
        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        });
      }
    });
  });
}

/**
 * 绘制默认头像
 */
function drawDefaultAvatar(ctx, name) {
  const initial = name ? name.charAt(0).toUpperCase() : 'A';
  
  // 绘制圆形背景
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(140, 200, 80, 0, 2 * Math.PI);
  ctx.fill();
  
  // 绘制文字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, 140, 200);
}

/**
 * 绘制名片文字
 */
function drawCardText(ctx, userData) {
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
  
  // 个人简介（最多两行）
  if (bio) {
    ctx.fillStyle = '#c0c0c0';
    ctx.font = '22px sans-serif';
    const maxWidth = 640;
    const lineHeight = 36;
    let y = 315;
    
    // 简单文本换行
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
  
  // 联系方式区域
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('CONTACT', 320, 460);
  
  // 微信号
  if (wechat) {
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '22px sans-serif';
    ctx.fillText(`微信: ${wechat}`, 320, 500);
  }
  
  // AIAE Logo/品牌
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('AIAE', 1000, 520);
  
  ctx.fillStyle = '#a0a0a0';
  ctx.font = '18px sans-serif';
  ctx.fillText('上海交通大学创业者社区', 1000, 555);
}

/**
 * 打印名片
 * @param {String} imagePath 名片图片路径
 */
function printBusinessCard(imagePath) {
  return new Promise((resolve, reject) => {
    // 保存图片到相册
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        wx.showModal({
          title: '保存成功',
          content: '名片已保存到相册，请使用打印机或到打印店打印\\n建议打印尺寸：90mm × 54mm',
          showCancel: false,
          success: () => resolve(true)
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
        reject(err);
      }
    });
  });
}

/**
 * 预览并打印名片
 * @param {Object} userData 用户数据
 */
async function previewAndPrintCard(userData) {
  try {
    wx.showLoading({ title: '生成名片中...' });
    
    const cardPath = await createBusinessCard(userData);
    
    wx.hideLoading();
    
    // 预览图片
    wx.previewImage({
      urls: [cardPath],
      current: cardPath,
      success: () => {
        // 预览后询问是否保存/打印
        wx.showActionSheet({
          itemList: ['保存到相册', '分享给好友', '取消'],
          success: (res) => {
            if (res.tapIndex === 0) {
              printBusinessCard(cardPath);
            } else if (res.tapIndex === 1) {
              // 分享功能
              wx.showShareImageMenu({
                path: cardPath
              });
            }
          }
        });
      }
    });
    
    return cardPath;
  } catch (error) {
    wx.hideLoading();
    wx.showToast({ title: '生成失败', icon: 'none' });
    console.error('Card generation failed:', error);
    throw error;
  }
}

module.exports = {
  createBusinessCard,
  printBusinessCard,
  previewAndPrintCard
};