const express = require('express');
const router = express.Router();
const { users, interactions, matches } = require('../models/db');

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

// 获取每日推荐
router.get('/recommendations', authMiddleware, (req, res) => {
  const currentUser = users.get(req.userId);
  if (!currentUser) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 获取已交互过的用户ID
  const interactedUsers = Array.from(interactions.values())
    .filter(i => i.fromUserId === req.userId)
    .map(i => i.toUserId);
  
  // 随机选择10个未交互的用户（简化版算法）
  const allUsers = Array.from(users.values())
    .filter(u => u.id !== req.userId && !interactedUsers.includes(u.id))
    .filter(u => u.isProfileComplete);
  
  // 随机打乱并取10个
  const shuffled = allUsers.sort(() => 0.5 - Math.random());
  const recommendations = shuffled.slice(0, 10).map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar || '/images/default-avatar.png',
    grade: u.grade,
    major: u.major,
    statusTag: u.statusTag,
    projectName: u.projectName,
    techTags: u.techTags || [],
    designTags: u.designTags || [],
    interestTags: u.interestTags || [],
    bio: u.bio,
    wechatMasked: u.wechatMasked || '***'
  }));
  
  res.json({
    list: recommendations,
    remaining: recommendations.length
  });
});

// 处理交互（喜欢/跳过）
router.post('/interaction', authMiddleware, (req, res) => {
  const { targetUserId, action, message } = req.body;
  
  if (!targetUserId || !['like', 'skip'].includes(action)) {
    return res.status(400).json({ message: '参数错误' });
  }
  
  // 记录交互
  const interactionId = `${req.userId}_${targetUserId}`;
  interactions.set(interactionId, {
    fromUserId: req.userId,
    toUserId: targetUserId,
    action,
    message: message || '',
    createdAt: new Date()
  });
  
  // 如果是like，检查是否双向匹配
  if (action === 'like') {
    const reverseInteractionId = `${targetUserId}_${req.userId}`;
    const reverseInteraction = interactions.get(reverseInteractionId);
    
    if (reverseInteraction && reverseInteraction.action === 'like') {
      // 建立Link
      const matchId = [req.userId, targetUserId].sort().join('_');
      matches.set(matchId, {
        userA: req.userId,
        userB: targetUserId,
        createdAt: new Date()
      });
      
      return res.json({
        message: '匹配成功！',
        matched: true
      });
    }
  }
  
  res.json({ message: '操作成功' });
});

// 获取我的匹配列表
router.get('/matches', authMiddleware, (req, res) => {
  const myMatches = Array.from(matches.values())
    .filter(m => m.userA === req.userId || m.userB === req.userId)
    .map(m => {
      const otherUserId = m.userA === req.userId ? m.userB : m.userA;
      const otherUser = users.get(otherUserId);
      return {
        matchId: `${m.userA}_${m.userB}`,
        user: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          wechatId: otherUser.wechatId // 匹配后可见完整微信号
        } : null,
        matchedAt: m.createdAt
      };
    });
  
  res.json(myMatches);
});

module.exports = router;
