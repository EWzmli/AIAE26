require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initTestData } = require('./models/db');

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 上传的文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 初始化测试数据
initTestData();

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));
app.use('/api/social', require('./routes/social'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/upload', require('./routes/upload'));

// 管理后台
app.use('/admin', express.static('admin'));

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'AIAE API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      posts: '/api/posts',
      events: '/api/events',
      social: '/api/social',
      recommend: '/api/recommend',
      upload: '/api/upload'
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║         🚀 AIAE Server Started         ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  📡 Port:     ${PORT}`);
  console.log(`║  🌐 API:      http://localhost:${PORT}/api`);
  console.log(`║  ⚙️  Admin:    http://localhost:${PORT}/admin`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;