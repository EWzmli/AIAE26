const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: '未登录' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aiae_dev_secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token无效' });
  }
};

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 上传头像
router.post('/avatar', authMiddleware, (req, res) => {
  // 处理base64图片数据
  let base64Data = '';
  
  req.on('data', chunk => {
    base64Data += chunk;
  });
  
  req.on('end', () => {
    try {
      // 解析multipart/form-data或base64
      let imageBuffer;
      let mimeType = 'image/png';
      
      if (base64Data.includes('base64,')) {
        // 处理base64格式
        const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
          imageBuffer = Buffer.from(base64Data, 'base64');
        }
      } else {
        // 处理原始图片数据
        imageBuffer = Buffer.from(base64Data, 'binary');
      }
      
      // 验证图片大小（最大5MB）
      if (imageBuffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ message: '图片大小超过5MB限制' });
      }
      
      // 生成文件名
      const ext = mimeType.split('/')[1] || 'png';
      const filename = `avatar_${req.userId}_${Date.now()}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      // 保存文件
      fs.writeFileSync(filepath, imageBuffer);
      
      // 更新用户头像（这里使用内存数据库，实际应该更新数据库）
      const { users } = require('../models/db');
      const user = users.get(req.userId);
      if (user) {
        // 删除旧头像
        if (user.avatar && user.avatar.includes('/uploads/')) {
          const oldFilename = path.basename(user.avatar);
          const oldPath = path.join(uploadDir, oldFilename);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        
        // 更新头像URL
        const avatarUrl = `/uploads/avatars/${filename}`;
        user.avatar = avatarUrl;
        user.updatedAt = new Date();
      }
      
      res.json({
        message: '上传成功',
        url: `/uploads/avatars/${filename}`
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: '上传失败', error: error.message });
    }
  });
});

// 获取头像
router.get('/avatar/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: '头像不存在' });
  }
  
  res.sendFile(filepath);
});

// 删除头像
router.delete('/avatar', authMiddleware, (req, res) => {
  const { users } = require('../models/db');
  const user = users.get(req.userId);
  
  if (user && user.avatar) {
    // 删除文件
    if (user.avatar.includes('/uploads/')) {
      const filename = path.basename(user.avatar);
      const filepath = path.join(uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    // 清空头像
    user.avatar = null;
    user.updatedAt = new Date();
  }
  
  res.json({ message: '删除成功' });
});

module.exports = router;