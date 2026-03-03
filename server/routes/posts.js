const express = require('express');
const router = express.Router();
const { posts, users, generatePostId } = require('../models/db');

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

// 获取招聘帖列表
router.get('/', (req, res) => {
  const { roleType, commitment, status = 'approved' } = req.query;
  
  let list = Array.from(posts.values())
    .filter(p => p.status === status)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (roleType) {
    list = list.filter(p => p.roleType === roleType);
  }
  if (commitment) {
    list = list.filter(p => p.commitment === commitment);
  }
  
  // 填充用户信息
  list = list.map(post => ({
    ...post,
    user: {
      id: post.userId,
      name: users.get(post.userId)?.name || '未知用户',
      avatar: users.get(post.userId)?.avatar || '/images/default-avatar.png'
    },
    timeAgo: getTimeAgo(post.createdAt)
  }));
  
  res.json(list);
});

// 获取单个帖子
router.get('/:id', (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ message: '帖子不存在' });
  }
  
  const user = users.get(post.userId);
  res.json({
    ...post,
    user: user ? {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      grade: user.grade,
      major: user.major,
      statusTag: user.statusTag
    } : null
  });
});

// 创建招聘帖
router.post('/', authMiddleware, (req, res) => {
  const {
    type, title, content, roleType, commitment, reward, projectName
  } = req.body;
  
  if (!title || !content || !roleType) {
    return res.status(400).json({ message: '缺少必要字段' });
  }
  
  const post = {
    id: generatePostId(),
    userId: req.userId,
    type: type || 'find_partner', // find_partner 或 job
    title,
    content,
    roleType,
    commitment: commitment || '',
    reward: reward || '',
    projectName: projectName || '',
    status: 'pending', // pending, approved, rejected
    createdAt: new Date()
  };
  
  posts.set(post.id, post);
  
  res.status(201).json({
    message: '帖子已提交，等待审核',
    postId: post.id
  });
});

// 时间格式化
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
}

module.exports = router;
