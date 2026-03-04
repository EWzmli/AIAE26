require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 测试数据库连接
testConnection();

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));
app.use('/api/social', require('./routes/social'));
app.use('/api/recommend', require('./routes/recommend'));

// 管理后台
app.use('/admin', express.static('admin'));

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
    console.error(err.stack);
    res.status(500).json({ message: '服务器错误', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 AIAE Server running on port ${PORT}`);
    console.log(`📚 API文档: http://localhost:${PORT}/api`);
    console.log(`⚙️ 管理后台: http://localhost:${PORT}/admin`);
});

module.exports = app;
