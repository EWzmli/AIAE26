# AIAE 后端部署指南

## 方案选择

### 1. 开发测试阶段（推荐）
- **平台**：腾讯云轻量应用服务器
- **配置**：2核4G，60GB SSD，5Mbps带宽
- **价格**：约60元/月（学生认证更便宜）
- **适合**：10-100人同时在线

### 2. MVP验证阶段
- **平台**：Render / Railway / Vercel
- **价格**：免费额度足够
- **缺点**：服务器在海外，访问速度较慢

### 3. 正式运营阶段
- **平台**：阿里云ECS / 腾讯云CVM
- **配置**：4核8G起步
- **数据库**：RDS MySQL（云数据库）

---

## 快速部署（腾讯云轻量服务器）

### 第一步：购买服务器

1. 访问 [腾讯云轻量应用服务器](https://console.cloud.tencent.com/lighthouse)
2. 选择 **Ubuntu 22.04 LTS** 镜像
3. 选择地域（建议靠近用户，如上海/北京）
4. 配置选择：2核4G起步
5. 购买后重置密码，获取公网IP

### 第二步：连接服务器

```bash
# Mac/Linux 终端
ssh ubuntu@你的服务器IP

# Windows 使用 PuTTY 或 PowerShell
ssh ubuntu@你的服务器IP
```

### 第三步：一键安装环境

```bash
# 下载部署脚本
curl -O https://raw.githubusercontent.com/EWzmli/AIAE26/main/server/deploy/setup.sh
chmod +x setup.sh
./setup.sh
```

### 第四步：上传代码

**方式1：Git克隆**
```bash
cd /var/www/aiae
git clone https://github.com/EWzmli/AIAE26.git .
cd server
npm install
```

**方式2：本地SCP上传**
```bash
# 本地执行
scp -r ./server ubuntu@服务器IP:/var/www/aiae/
```

### 第五步：配置环境变量

```bash
cd /var/www/aiae/server
cp .env.example .env
nano .env  # 编辑配置
```

`.env` 文件内容：
```env
# 数据库配置
DB_HOST=localhost
DB_USER=aiae_user
DB_PASSWORD=YourStrongPassword123!
DB_NAME=aiae_db

# JWT密钥（生产环境必须修改！）
JWT_SECRET=your-super-secret-jwt-key-here

# 服务器端口
PORT=3000

# 微信小程序配置
WECHAT_APPID=your_appid_here
WECHAT_SECRET=your_secret_here
```

### 第六步：初始化数据库

```bash
cd /var/www/aiae/server
mysql -u aiae_user -p aiae_db < database/init.sql
```

### 第七步：启动服务

```bash
cd /var/www/aiae/server

# 开发模式
npm run dev

# 生产模式（PM2守护进程）
pm2 start app.js --name aiae-api
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs aiae-api
```

### 第八步：配置Nginx

```bash
# 复制配置文件
sudo cp deploy/nginx.conf /etc/nginx/sites-available/aiae
sudo ln -s /etc/nginx/sites-available/aiae /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 修改域名
sudo nano /etc/nginx/sites-available/aiae
# 将 your-domain.com 改为你的域名或服务器IP

# 测试并重载
sudo nginx -t
sudo systemctl reload nginx
```

---

## 域名和HTTPS

### 申请域名
- 阿里云/腾讯云/GoDaddy 购买域名
- 解析A记录到你的服务器IP

### 申请免费SSL证书（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 小程序配置

### 服务器域名配置

登录[微信小程序后台](https://mp.weixin.qq.com) → 开发 → 开发设置 → 服务器域名：

| 类型 | 域名 |
|------|------|
| request合法域名 | `https://your-domain.com` |
| uploadFile合法域名 | `https://your-domain.com` |
| downloadFile合法域名 | `https://your-domain.com` |

### 修改小程序API地址

```javascript
// weapp/app.js
const API_BASE = 'https://your-domain.com/api';  // 改为你的域名
```

---

## 常用命令

```bash
# 查看服务状态
pm2 status
pm2 logs aiae-api

# 重启服务
pm2 restart aiae-api

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 数据库操作
mysql -u aiae_user -p aiae_db

# 备份数据库
mysqldump -u aiae_user -p aiae_db > backup.sql
```

---

## 故障排查

### 1. 端口被占用
```bash
# 查看3000端口占用
sudo lsof -i :3000
# 杀掉进程
sudo kill -9 PID
```

### 2. 数据库连接失败
```bash
# 检查MySQL状态
sudo systemctl status mysql
# 重启MySQL
sudo systemctl restart mysql
```

### 3. Nginx 502错误
```bash
# 检查后端服务是否运行
pm2 status
# 检查端口监听
netstat -tlnp | grep 3000
```

---

## 性能优化建议

1. **数据库优化**
   - 添加索引（已完成）
   - 定期清理旧数据
   - 使用连接池

2. **API优化**
   - 添加Redis缓存热点数据
   - 分页查询限制（每页最多50条）
   - 接口响应压缩

3. **服务器优化**
   - 开启Gzip压缩
   - 使用CDN加速静态资源
   - 配置自动备份

---

## 费用预估（月度）

| 项目 | 费用 |
|------|------|
| 腾讯云轻量服务器（2核4G） | ~60元 |
| 域名（.com） | ~60元/年 |
| SSL证书 | 免费 |
| **合计** | **~65元/月** |

学生认证可享受：
- 腾讯云学生套餐：10元/月（1核2G）
- 阿里云学生套餐：9.5元/月
