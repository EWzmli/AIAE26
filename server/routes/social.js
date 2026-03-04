const express = require('express');
const router = express.Router();
const { users, interactions, matches, generateMatchId } = require('../models/db');

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

// 智能匹配算法
function calculateMatchScore(userA, userB) {
  let score = 0;
  
  // 标签匹配（权重最高）
  const tagsA = [...(userA.techTags || []), ...(userA.interestTags || [])];
  const tagsB = [...(userB.techTags || []), ...(userB.interestTags || [])];
  const commonTags = tagsA.filter(tag => tagsB.includes(tag));
  score += commonTags.length * 15;
  
  // 状态互补
  const statusA = userA.statusTag || '';
  const statusB = userB.statusTag || '';
  
  const complementaryPairs = [
    ['有项目找技术', '技术找项目'],
    ['有项目找设计', '设计找项目'],
    ['找合伙人', '招团队']
  ];
  
  for (const [s1, s2] of complementaryPairs) {
    if ((statusA.includes(s1) && statusB.includes(s2)) ||
        (statusA.includes(s2) && statusB.includes(s1))) {
      score += 30;
      break;
    }
  }
  
  // 年级相近
  if (userA.grade === userB.grade) {
    score += 10;
  }
  
  // 项目经验
  if (userA.projectName && userB.projectName) {
    score += 5;
  }
  
  return Math.min(score, 100);
}

// 获取每日推荐
router.get('/recommendations', authMiddleware, (req, res) => {
  const currentUser = users.get(req.userId);
  if (!currentUser) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 获取已交互过的用户
  const interactedUsers = Array.from(interactions.values())
    .filter(i => i.fromUserId === req.userId)
    .map(i => i.toUserId);
  
  // 获取已匹配的用户
  const matchedUsers = Array.from(matches.values())
    .filter(m => m.userA === req.userId || m.userB === req.userId)
    .map(m => m.userA === req.userId ? m.userB : m.userA);
  
  const excludeIds = new Set([req.userId, ...interactedUsers, ...matchedUsers]);
  
  // 获取候选用户（资料完整的）
  let candidates = Array.from(users.values())
    .filter(u => !excludeIds.has(u.id) && u.isProfileComplete);
  
  // 计算匹配度并排序
  candidates = candidates.map(u => ({
    ...u,
    matchScore: calculateMatchScore(currentUser, u),
    matchReason: generateMatchReason(currentUser, u)
  })).sort((a, b) => b.matchScore - a.matchScore);
  
  // 取前10个
  const recommendations = candidates.slice(0, 10).map(u => ({
    id: u.id,
    name: u.name,
    nickname: u.nickname,
    avatar: u.avatar,
    grade: u.grade,
    major: u.major,
    statusTag: u.statusTag,
    projectName: u.projectName,
    techTags: u.techTags || [],
    designTags: u.designTags || [],
    interestTags: u.interestTags || [],
    bio: u.bio,
    wechatMasked: u.wechatMasked || '***',
    matchScore: u.matchScore,
    matchReason: u.matchReason
  }));
  
  res.json({
    list: recommendations,
    remaining: candidates.length - recommendations.length
  });
});

// 处理交互（喜欢/跳过）
router.post('/interaction', authMiddleware, (req, res) => {
  const { targetUserId, action, message } = req.body;
  
  if (!targetUserId || !['like', 'skip'].includes(action)) {
    return res.status(400).json({ message: '参数错误' });
  }
  
  if (targetUserId === req.userId) {
    return res.status(400).json({ message: '不能对自己操作' });
  }
  
  // 记录交互
  const interactionId = `${req.userId}_${targetUserId}`;
  interactions.set(interactionId, {
    id: interactionId,
    fromUserId: req.userId,
    toUserId: targetUserId,
    action,
    message: message || '',
    createdAt: new Date()
  });
  
  // 检查双向匹配
  if (action === 'like') {
    const reverseInteractionId = `${targetUserId}_${req.userId}`;
    const reverseInteraction = interactions.get(reverseInteractionId);
    
    if (reverseInteraction && reverseInteraction.action === 'like') {
      // 创建匹配
      const matchId = generateMatchId();
      const match = {
        id: matchId,
        userA: req.userId,
        userB: targetUserId,
        userAStatus: 'pending',
        userBStatus: 'pending',
        createdAt: new Date()
      };
      matches.set(matchId, match);
      
      const targetUser = users.get(targetUserId);
      
      return res.json({
        message: '匹配成功！',
        matched: true,
        match: {
          id: matchId,
          user: targetUser ? {
            id: targetUser.id,
            name: targetUser.name,
            avatar: targetUser.avatar,
            wechatId: targetUser.wechatId
          } : null
        }
      });
    }
  }
  
  res.json({ message: action === 'like' ? '已发送喜欢' : '已跳过' });
});

// 获取我的匹配列表
router.get('/matches', authMiddleware, (req, res) => {
  const myMatches = Array.from(matches.values())
    .filter(m => m.userA === req.userId || m.userB === req.userId)
    .map(m => {
      const otherUserId = m.userA === req.userId ? m.userB : m.userA;
      const otherUser = users.get(otherUserId);
      return {
        id: m.id,
        user: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          grade: otherUser.grade,
          major: otherUser.major,
          wechatId: otherUser.wechatId, // 匹配后可见完整微信号
          bio: otherUser.bio
        } : null,
        matchedAt: m.createdAt
      };
    });
  
  res.json(myMatches);
});

// 获取我的Link申请（收到的喜欢）
router.get('/received-likes', authMiddleware, (req, res) => {
  const receivedLikes = Array.from(interactions.values())
    .filter(i => i.toUserId === req.userId && i.action === 'like')
    .map(i => {
      const fromUser = users.get(i.fromUserId);
      return {
        ...i,
        user: fromUser ? {
          id: fromUser.id,
          name: fromUser.name,
          avatar: fromUser.avatar,
          grade: fromUser.grade,
          major: fromUser.major,
          statusTag: fromUser.statusTag
        } : null
      };
    });
  
  res.json(receivedLikes);
});

// 获取我发送的Link申请
router.get('/sent-likes', authMiddleware, (req, res) => {
  const sentLikes = Array.from(interactions.values())
    .filter(i => i.fromUserId === req.userId && i.action === 'like')
    .map(i => {
      const toUser = users.get(i.toUserId);
      return {
        ...i,
        user: toUser ? {
          id: toUser.id,
          name: toUser.name,
          avatar: toUser.avatar,
          statusTag: toUser.statusTag
        } : null,
        isMatched: Array.from(matches.values()).some(
          m => (m.userA === req.userId && m.userB === i.toUserId) ||
               (m.userB === req.userId && m.userA === i.toUserId)
        )
      };
    });
  
  res.json(sentLikes);
});

// 生成推荐理由
function generateMatchReason(userA, userB) {
  const reasons = [];
  
  // 标签匹配
  const tagsA = [...(userA.techTags || []), ...(userA.interestTags || [])];
  const tagsB = [...(userB.techTags || []), ...(userB.interestTags || [])];
  const commonTags = tagsA.filter(tag => tagsB.includes(tag));
  
  if (commonTags.length > 0) {
    reasons.push(`共同标签：${commonTags[0]}`);
  }
  
  // 状态互补
  const statusA = userA.statusTag || '';
  const statusB = userB.statusTag || '';
  
  if ((statusA.includes('有项目') && statusB.includes('找项目')) ||
      (statusA.includes('找项目') && statusB.includes('有项目'))) {
    reasons.push('需求互补');
  }
  
  // 年级
  if (userA.grade === userB.grade) {
    reasons.push(`同为${userA.grade}`);
  }
  
  return reasons[0] || '推荐匹配';
}

module.exports = router;
