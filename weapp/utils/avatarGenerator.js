/**
 * AI头像生成工具
 * 使用Coze Image Gen或内置头像库生成头像
 */

const AVATAR_PRESETS = [
  // 商务风格
  { id: 'biz_1', style: 'business', color: '#4A90E2', icon: '💼' },
  { id: 'biz_2', style: 'business', color: '#7B68EE', icon: '📊' },
  { id: 'biz_3', style: 'business', color: '#50C878', icon: '💡' },
  { id: 'biz_4', style: 'business', color: '#E74C3C', icon: '🚀' },
  // 科技风格
  { id: 'tech_1', style: 'tech', color: '#00D4FF', icon: '⚡' },
  { id: 'tech_2', style: 'tech', color: '#FF6B6B', icon: '💻' },
  { id: 'tech_3', style: 'tech', color: '#4ECDC4', icon: '🔬' },
  { id: 'tech_4', style: 'tech', color: '#95E1D3', icon: '🤖' },
  // 创意风格
  { id: 'creative_1', style: 'creative', color: '#F38181', icon: '🎨' },
  { id: 'creative_2', style: 'creative', color: '#AA96DA', icon: '✨' },
  { id: 'creative_3', style: 'creative', color: '#FCBAD3', icon: '🎭' },
  { id: 'creative_4', style: 'creative', color: '#FFFFD2', icon: '🌟' },
  // 自然风格
  { id: 'nature_1', style: 'nature', color: '#96CEB4', icon: '🌿' },
  { id: 'nature_2', style: 'nature', color: '#FFEAA7', icon: '☀️' },
  { id: 'nature_3', style: 'nature', color: '#DDA0DD', icon: '🌸' },
  { id: 'nature_4', style: 'nature', color: '#87CEEB', icon: '☁️' }
];

/**
 * 获取预设头像列表
 */
function getAvatarPresets() {
  return AVATAR_PRESETS;
}

/**
 * 生成头像URL（使用AI生成）
 * @param {String} prompt 生成提示词
 * @returns {Promise<String>} 生成的头像URL
 */
async function generateAIAvatar(prompt) {
  // 这里应该调用后端API来生成图片
  // 暂时返回预设头像
  const presets = AVATAR_PRESETS;
  const random = presets[Math.floor(Math.random() * presets.length)];
  
  // 创建渐变头像
  return createGradientAvatar(random.color, random.icon);
}

/**
 * 创建渐变头像（Canvas生成）
 * @param {String} color 主色调
 * @param {String} icon 图标
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
      
      // 添加装饰圆
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 20, 0, 2 * Math.PI);
      ctx.stroke();
      
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

/**
 * 创建文字头像（使用姓名首字母）
 * @param {String} name 姓名
 * @param {Object} options 选项
 */
function createTextAvatar(name, options = {}) {
  const initial = name ? name.charAt(0).toUpperCase() : 'A';
  const color = options.color || getRandomColor(name);
  
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
      ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制文字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 200px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, size/2, size/2);
      
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
 * 根据名称获取随机颜色
 */
function getRandomColor(name) {
  const colors = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
    '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6',
    '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
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
  const API_BASE = getApp().globalData.API_BASE;
  const token = wx.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}/api/upload/avatar`,
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

module.exports = {
  getAvatarPresets,
  generateAIAvatar,
  createGradientAvatar,
  createTextAvatar,
  chooseAvatarFromAlbum,
  uploadAvatar
};