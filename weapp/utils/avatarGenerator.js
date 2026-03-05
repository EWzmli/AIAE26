/**
 * AI头像生成工具
 * 默认头像：姓名首字母（中文取后两位，英文取首字母）
 * 如：David Jack → DJ，张三丰 → 三丰
 */

// 预设头像库（保留用于特定场景）
const AVATAR_PRESETS = [
  { id: 'biz_1', style: 'business', color: '#4A90E2', icon: '💼' },
  { id: 'biz_2', style: 'business', color: '#7B68EE', icon: '📊' },
  { id: 'biz_3', style: 'business', color: '#50C878', icon: '💡' },
  { id: 'biz_4', style: 'business', color: '#E74C3C', icon: '🚀' },
  { id: 'tech_1', style: 'tech', color: '#00D4FF', icon: '⚡' },
  { id: 'tech_2', style: 'tech', color: '#FF6B6B', icon: '💻' },
  { id: 'tech_3', style: 'tech', color: '#4ECDC4', icon: '🔬' },
  { id: 'tech_4', style: 'tech', color: '#95E1D3', icon: '🤖' },
  { id: 'creative_1', style: 'creative', color: '#F38181', icon: '🎨' },
  { id: 'creative_2', style: 'creative', color: '#AA96DA', icon: '✨' },
  { id: 'creative_3', style: 'creative', color: '#FCBAD3', icon: '🎭' },
  { id: 'creative_4', style: 'creative', color: '#FFFFD2', icon: '🌟' },
  { id: 'nature_1', style: 'nature', color: '#96CEB4', icon: '🌿' },
  { id: 'nature_2', style: 'nature', color: '#FFEAA7', icon: '☀️' },
  { id: 'nature_3', style: 'nature', color: '#DDA0DD', icon: '🌸' },
  { id: 'nature_4', style: 'nature', color: '#87CEEB', icon: '☁️' }
];

/**
 * 获取姓名首字母缩写
 * 中文：取后两个字符（如"张三丰"→"三丰"）
 * 英文：取每个单词首字母（如"David Jack"→"DJ"）
 * @param {String} name 姓名
 * @returns {String} 首字母缩写，最多2个字符
 */
function getNameInitials(name) {
  if (!name || typeof name !== 'string') {
    return 'A';
  }
  
  name = name.trim();
  if (!name) return 'A';
  
  // 判断是否为中文（包含中文汉字）
  const hasChinese = /[\u4e00-\u9fa5]/.test(name);
  
  if (hasChinese) {
    // 中文：取最后两个字符
    const chars = name.split('');
    if (chars.length >= 2) {
      return chars.slice(-2).join('');
    }
    return name;
  } else {
    // 英文：取每个单词的首字母
    const words = name.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 1) {
      // 只有一个单词，取前1-2个字母
      return words[0].substring(0, Math.min(2, words[0].length)).toUpperCase();
    }
    // 多个单词，取每个单词首字母
    return words.slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  }
}

/**
 * 根据姓名获取背景色（保持一致性）
 */
function getNameColor(name) {
  const colors = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
    '#f1c40f', '#e67e22', '#e74c3c', '#e94560', '#95a5a6',
    '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];
  
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * 创建默认头像（姓名首字母）
 * @param {String} name 姓名
 * @param {Object} options 选项
 */
function createDefaultAvatar(name, options = {}) {
  const initials = getNameInitials(name);
  const color = options.color || getNameColor(name);
  
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select('#avatarCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) {
        reject(new Error('Canvas not found'));
        return;
      }
      
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const size = 400;
      
      canvas.width = size;
      canvas.height = size;
      
      // 绘制圆形背景
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制文字
      ctx.fillStyle = '#fff';
      
      // 根据字符长度调整字体大小
      let fontSize;
      if (initials.length === 1) {
        fontSize = 200;
      } else if (initials.length === 2) {
        // 判断是否为两个汉字
        if (/^[\u4e00-\u9fa5]{2}$/.test(initials)) {
          fontSize = 160;
        } else {
          fontSize = 180;
        }
      } else {
        fontSize = 140;
      }
      
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, size/2, size/2);
      
      wx.canvasToTempFilePath({
        canvas: canvas,
        width: size,
        height: size,
        destWidth: size,
        destHeight: size,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      });
    });
  });
}

/**
 * 从相册选择头像
 */
function chooseAvatarFromAlbum() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 压缩图片
        wx.compressImage({
          src: tempFilePath,
          quality: 80,
          success: (compressRes) => {
            resolve(compressRes.tempFilePath);
          },
          fail: () => {
            resolve(tempFilePath);
          }
        });
      },
      fail: reject
    });
  });
}

/**
 * 上传头像到服务器
 * @param {String} filePath 本地文件路径
 */
async function uploadAvatar(filePath) {
  const app = getApp();
  const token = wx.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${app.globalData.API_BASE}/api/upload/avatar`,
      filePath: filePath,
      name: 'avatar',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.url) {
            resolve(data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        } catch (e) {
          reject(e);
        }
      },
      fail: reject
    });
  });
}

/**
 * 获取预设头像列表（用于特定场景）
 */
function getAvatarPresets() {
  return AVATAR_PRESETS;
}

/**
 * 生成渐变头像（保留作为备选）
 */
function createGradientAvatar(color, icon) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select('#avatarCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) {
        reject(new Error('Canvas not found'));
        return;
      }
      
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const size = 400;
      
      canvas.width = size;
      canvas.height = size;
      
      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustColor(color, -30));
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // 绘制图标
      ctx.font = '150px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, size/2, size/2);
      
      wx.canvasToTempFilePath({
        canvas: canvas,
        width: size,
        height: size,
        destWidth: size,
        destHeight: size,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      });
    });
  });
}

/**
 * 调整颜色亮度
 */
function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

module.exports = {
  getNameInitials,
  getNameColor,
  createDefaultAvatar,
  chooseAvatarFromAlbum,
  uploadAvatar,
  getAvatarPresets,
  createGradientAvatar
};