const express = require('express');
const router = express.Router();
const { posts, users, comments, generatePostId, generateCommentId } = require('../models/db');

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
  const { type, status = 'approved', page = 1, limit = 20 } = req.query;
  
  let list = Array.from(posts.values())
    .filter(p => p.status === status)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (type) {
    list = list.filter(p => p.type === type);
  }
  
  const total = list.length;
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  list = list.slice(start, end);
  
  list = list.map(post => ({
    ...post,
    user: {
      id: post.userId,
      name: users.get(post.userId)?.name || '未知用户',
      avatar: users.get(post.userId)?.avatar || ''
    },
    timeAgo: getTimeAgo(post.createdAt)
  }));
  
  res.json({ list, total, page: parseInt(page), limit: parseInt(limit) });
});

// 获取单个帖子
router.get('/:id', (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ message: '帖子不存在' });
  }
  
  // 获取评论
  const postComments = Array.from(comments.values())
    .filter(c => c.postId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(c => ({
      ...c,
      user: {
        id: c.userId,
        name: users.get(c.userId)?.name || '未知用户',
        avatar: users.get(c.userId)?.avatar || ''
      },
      timeAgo: getTimeAgo(c.createdAt)
    }));
  
  const user = users.get(post.userId);
  res.json({
    ...post,
    comments: postComments,
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
    type, title, content, roleType, commitment, reward, projectName, tags
  } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: '标题和内容不能为空' });
  }
  
  const post = {
    id: generatePostId(),
    userId: req.userId,
    type: type || 'find_partner',
    title,
    content,
    roleType: roleType || '',
    commitment: commitment || '',
    reward: reward || '',
    projectName: projectName || '',
    tags: tags || [],
    status: 'approved',
    commentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  posts.set(post.id, post);
  
  res.status(201).json({
    message: '发布成功',
    postId: post.id,
    post
  });
});

// 添加评论
router.post('/:id/comments', authMiddleware, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ message: '帖子不存在' });
  }
  
  const { content, parentId } = req.body;
  if (!content) {
    return res.status(400).json({ message: '评论内容不能为空' });
  }
  
  const comment = {
    id: generateCommentId(),
    postId: req.params.id,
    userId: req.userId,
    content,
    parentId: parentId || null,
    createdAt: new Date()
  };
  
  comments.set(comment.id, comment);
  
  // 更新帖子评论数
  post.commentCount = (post.commentCount || 0) + 1;
  
  res.status(201).json({
    message: '评论成功',
    comment
  });
});

// 获取帖子的评论
router.get('/:id/comments', (req, res) => {
  const postComments = Array.from(comments.values())
    .filter(c => c.postId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(c => ({
      ...c,
      user: {
        id: c.userId,
        name: users.get(c.userId)?.name || '未知用户',
        avatar: users.get(c.userId)?.avatar || ''
      },
      timeAgo: getTimeAgo(c.createdAt)
    }));
  
  res.json(postComments);
});

// 删除自己的帖子
router.delete('/:id', authMiddleware, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    return res.status(404).json({ message: '帖子不存在' });
  }
  
  if (post.userId !== req.userId) {
    return res.status(403).json({ message: '无权删除' });
  }
  
  posts.delete(req.params.id);
  res.json({ message: '删除成功' });
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
  if (days < 30) return `${days}天前`;
  return new Date(date).toLocaleDateString();
}

module.exports = router;
