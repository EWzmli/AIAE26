const express = require('express');
const router = express.Router();
const { users, posts, events, matches } = require('../models/db');

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
  
  const { wechatId, ...userInfo } = user;
  res.json({
    ...userInfo,
    wechatMasked: user.wechatMasked || '***'
  });
});

// 获取用户名片（公开信息）
router.get('/card/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 只返回公开信息
  res.json({
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    avatar: user.avatar,
    grade: user.grade,
    major: user.major,
    bio: user.bio,
    projectName: user.projectName,
    statusTag: user.statusTag,
    techTags: user.techTags || [],
    designTags: user.designTags || [],
    interestTags: user.interestTags || [],
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
    avatar, name, nickname, grade, major, wechatId, bio, 
    projectName, statusTag, techTags, designTags, interestTags
  } = req.body;
  
  Object.assign(user, {
    avatar: avatar || user.avatar,
    name: name || user.name,
    nickname: nickname || user.nickname,
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
  const userId = req.userId;
  
  // 统计帖子数
  const postCount = Array.from(posts.values()).filter(p => p.userId === userId).length;
  
  // 统计匹配数
  const matchCount = Array.from(matches.values()).filter(
    m => m.userA === userId || m.userB === userId
  ).length;
  
  // 统计活动参与数
  const eventCount = 0; // TODO: 实现活动报名统计
  
  res.json({
    links: matchCount,
    posts: postCount,
    events: eventCount
  });
});

// 获取我的帖子列表
router.get('/my-posts', authMiddleware, (req, res) => {
  const userId = req.userId;
  const myPosts = Array.from(posts.values())
    .filter(p => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(myPosts);
});

// 搜索用户
router.get('/search', (req, res) => {
  const { keyword, tag, grade } = req.query;
  
  let results = Array.from(users.values()).filter(u => u.isProfileComplete);
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    results = results.filter(u => 
      (u.name && u.name.toLowerCase().includes(lowerKeyword)) ||
      (u.major && u.major.toLowerCase().includes(lowerKeyword)) ||
      (u.bio && u.bio.toLowerCase().includes(lowerKeyword))
    );
  }
  
  if (tag) {
    results = results.filter(u => {
      const allTags = [...(u.techTags || []), ...(u.designTags || []), ...(u.interestTags || [])];
      return allTags.includes(tag);
    });
  }
  
  if (grade) {
    results = results.filter(u => u.grade === grade);
  }
  
  res.json(results.map(u => ({
    id: u.id,
    name: u.name,
    nickname: u.nickname,
    avatar: u.avatar,
    grade: u.grade,
    major: u.major,
    statusTag: u.statusTag,
    bio: u.bio?.substring(0, 50)
  })));
});

module.exports = router;
