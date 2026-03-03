const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users, verificationCodes, generateUserId } = require('../models/db');

// JWT密钥
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
    expiredAt: Date.now() + 10 * 60 * 1000 // 10分钟过期
  });
  
  // TODO: 实际发送邮件（待配置SMTP）
  console.log(`验证码 for ${email}: ${code}`);
  
  res.json({ message: '验证码已发送', code }); // MVP阶段返回code便于测试
});

// 登录/注册
router.post('/login', (req, res) => {
  const { email, code } = req.body;
  
  // 验证验证码
  const record = verificationCodes.get(email);
  if (!record || record.code !== code || record.expiredAt < Date.now()) {
    return res.status(400).json({ message: '验证码错误或已过期' });
  }
  
  // 查找或创建用户
  let user = Array.from(users.values()).find(u => u.email === email);
  let isNewUser = false;
  
  if (!user) {
    isNewUser = true;
    user = {
      id: generateUserId(),
      email,
      name: '',
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
      createdAt: new Date()
    };
    users.set(user.id, user);
  }
  
  // 清除验证码
  verificationCodes.delete(email);
  
  // 生成JWT
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

module.exports = router;
