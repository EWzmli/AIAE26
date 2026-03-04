#!/bin/bash
# AIAE 后端服务器部署脚本
# 适用于：Ubuntu 20.04/22.04 LTS

set -e

echo "🚀 开始部署 AIAE 后端服务..."

# 1. 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 18.x
echo "📦 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# 3. 安装 MySQL
echo "📦 安装 MySQL..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. 配置 MySQL
echo "⚙️ 配置 MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS aiae_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'aiae_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON aiae_db.* TO 'aiae_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 5. 安装 PM2（进程管理）
echo "📦 安装 PM2..."
sudo npm install -g pm2

# 6. 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p /var/www/aiae
sudo chown -R $USER:$USER /var/www/aiae

# 7. 安装 Nginx（反向代理）
echo "📦 安装 Nginx..."
sudo apt install -y nginx

# 8. 配置防火墙
echo "🔒 配置防火墙..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ 基础环境安装完成！"
echo ""
echo "下一步："
echo "1. 上传代码到 /var/www/aiae"
echo "2. 创建 .env 配置文件"
echo "3. 初始化数据库：mysql -u aiae_user -p aiae_db < database/init.sql"
echo "4. 启动服务：cd /var/www/aiae && pm2 start app.js --name aiae-api"
