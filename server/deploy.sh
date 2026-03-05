#!/bin/bash

# AIAE 云托管快速部署脚本
# 使用方法: ./deploy.sh

echo "🚀 AIAE 云托管部署脚本"
echo "======================"

# 检查是否在server目录
if [ ! -f "app.js" ]; then
    echo "❌ 错误：请在 server 目录下运行此脚本"
    echo "正确用法：cd server && ./deploy.sh"
    exit 1
fi

# 检查是否安装了云开发CLI
if ! command -v tcb &> /dev/null; then
    echo "📦 正在安装云开发CLI..."
    npm install -g @cloudbase/cli
fi

# 登录检查
echo "🔑 检查登录状态..."
tcb login

echo ""
echo "📤 开始部署..."
echo "环境ID: cloudbase-6g3e4gx180dae419"
echo "服务名: aiae-server"
echo ""

# 部署到云托管
tcb cloudrun deploy \
  --serviceName aiae-server \
  --envId cloudbase-6g3e4gx180dae419 \
  --containerPort 3000 \
  --maxNum 5 \
  --minNum 0 \
  --cpu 0.25 \
  --mem 0.5

echo ""
echo "✅ 部署完成！"
echo ""
echo "请登录云开发控制台查看服务状态："
echo "https://console.cloud.tencent.com/tcb/env/overview?envId=cloudbase-6g3e4gx180dae419"
echo ""
echo "部署成功后，记得："
echo "1. 复制云托管的HTTPS域名"
echo "2. 更新 weapp/api.config.js 中的 CLOUD_CONFIG.API_BASE"
echo "3. 切换 CURRENT_CONFIG 为 CLOUD_CONFIG"
echo "4. 重新编译小程序"