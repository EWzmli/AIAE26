# AIAE - 上海交通大学创业者社交平台

## 项目结构

```
AIAE26/
├── weapp/                 # 微信小程序前端
│   ├── pages/            # 页面
│   ├── components/       # 组件
│   ├── utils/            # 工具函数
│   └── app.js            # 小程序入口
├── server/               # 后端API
│   ├── models/           # 数据模型
│   ├── routes/           # API路由
│   ├── middleware/       # 中间件
│   └── app.js            # 服务入口
└── admin/                # 审核后台H5
    └── index.html        # 管理后台页面
```

## 快速开始

### 1. 后端启动
```bash
cd server
npm install
npm run dev
```

### 2. 小程序运行
- 打开微信开发者工具
- 导入 `weapp` 目录
- 修改 `app.js` 中的 `API_BASE` 为你的服务器地址

### 3. 审核后台
- 访问 `http://your-server/admin`
- 默认密码：admin/admin123

## 待授权事项
- [ ] jAccount OAuth2 对接
- [ ] 腾讯云COS存储配置
- [ ] 小程序正式账号

## MVP功能清单
- [x] 用户注册/登录（邮箱验证）
- [x] 个人资料完善
- [x] 标签系统
- [x] 招聘广场（发帖/列表）
- [x] 活动行
- [x] 每日推荐（随机10人）
- [x] Link机制（双向确认）
- [x] 审核后台
