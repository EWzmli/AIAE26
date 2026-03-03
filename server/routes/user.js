const express = require('express');
const router = express.Router();
const { users } = require('../models/db');

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

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const user = users.get(req.userId);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 隐藏敏感信息
  const { wechatId, ...userInfo } = user;
  res.json({
    ...userInfo,
    wechatMasked: user.wechatMasked || '***'
  });
});

// 更新用户资料
router.post('/profile', authMiddleware, (req, res) => {
  const user = users.get(req.userId);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  const {
    avatar, name, grade, major, wechatId, bio, projectName,
    statusTag, techTags, designTags, interestTags
  } = req.body;
  
  // 更新字段
  Object.assign(user, {
    avatar: avatar || user.avatar,
    name: name || user.name,
    grade: grade || user.grade,
    major: major || user.major,
    wechatId: wechatId || user.wechatId,
    wechatMasked: wechatId ? wechatId.slice(0, 3) + '****' : user.wechatMasked,
    bio: bio || user.bio,
    projectName: projectName || user.projectName,
    statusTag: statusTag || user.statusTag,
    techTags: techTags || user.techTags,
    designTags: designTags || user.designTags,
    interestTags: interestTags || user.interestTags,
    isProfileComplete: !!(name && grade && major && wechatId && statusTag),
    updatedAt: new Date()
  });
  
  res.json({ message: '保存成功', user });
});

// 获取用户统计
router.get('/stats', authMiddleware, (req, res) => {
  // TODO: 统计用户数据
  res.json({
    links: 0,
    posts: 0,
    events: 0
  });
});

module.exports = router;
