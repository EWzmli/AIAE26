# 使用Node.js 18官方镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口（云托管会使用这个端口）
EXPOSE 3000

# 启动应用
CMD ["node", "app.js"]