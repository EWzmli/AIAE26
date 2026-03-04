const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users, verificationCodes, generateUserId } = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aiae_dev_secret';

// 发送验证码
router.post('/send-code', (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('@sjtu.edu.cn')) {
    return res.status(400).json({ message: '请使用校内邮箱' });
  }
  
  // 生成6位验证码
  const code = Math.random().toString().slice(2, 8);
  verificationCodes.set(email, {
    code,
    expiredAt: Date.now() + 10 * 60 * 1000
  });
  
  console.log(`验证码 for ${email}: ${code}`);
  
  res.json({ message: '验证码已发送', code });
});

// 登录/注册
router.post('/login', (req, res) => {
  const { email, code } = req.body;
  
  const record = verificationCodes.get(email);
  if (!record || record.code !== code || record.expiredAt < Date.now()) {
    return res.status(400).json({ message: '验证码错误或已过期' });
  }
  
  let user = Array.from(users.values()).find(u => u.email === email);
  let isNewUser = false;
  
  if (!user) {
    isNewUser = true;
    user = {
      id: generateUserId(),
      email,
      name: '',
      nickname: '',
      avatar: '',
      grade: '',
      major: '',
      wechatId: '',
      wechatMasked: '',
      bio: '',
      projectName: '',
      statusTag: '',
      techTags: [],
      designTags: [],
      interestTags: [],
      isProfileComplete: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.set(user.id, user);
  }
  
  verificationCodes.delete(email);
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      isProfileComplete: user.isProfileComplete
    },
    isNewUser
  });
});

// jAccount登录（待授权实现）
router.post('/jaccount', (req, res) => {
  res.status(501).json({ message: 'jAccount登录开发中' });
});

// 开发测试登录（快速模拟）
router.post('/dev-login', (req, res) => {
  const mockUserId = generateUserId();
  const mockUser = {
    id: mockUserId,
    email: 'dev@sjtu.edu.cn',
    name: '开发用户',
    nickname: 'DevUser',
    avatar: '',
    grade: '研二',
    major: '计算机科学',
    wechatId: 'dev_wechat',
    wechatMasked: 'dev****',
    bio: '开发测试账号',
    projectName: 'AIAE平台',
    statusTag: '技术找项目',
    techTags: ['前端', 'Node.js', '小程序'],
    designTags: [],
    interestTags: ['创业', 'AI'],
    isProfileComplete: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  users.set(mockUserId, mockUser);
  
  const token = jwt.sign({ userId: mockUserId }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    token,
    user: {
      id: mockUser.id,
      email: mockUser.email,
      isProfileComplete: mockUser.isProfileComplete
    },
    isNewUser: false
  });
});

module.exports = router;
