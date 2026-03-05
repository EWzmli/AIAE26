# AIAE 云托管部署指南

## 环境信息
- **云开发环境ID**: `cloudbase-6g3e4gx180dae419`
- **部署方式**: 云托管（CloudBase Run）
- **后端框架**: Node.js + Express

---

## 部署步骤

### 1. 安装云开发CLI工具

```bash
npm install -g @cloudbase/cli
```

### 2. 登录云开发

```bash
tcb login
```

会弹出二维码，用微信扫码登录。

### 3. 进入后端目录

```bash
cd AIAE26/server
```

### 4. 部署到云托管

**方式一：命令行部署**

```bash
# 部署到云托管
tcb cloudrun deploy --serviceName aiae-server --envId cloudbase-6g3e4gx180dae419 --containerPort 3000
```

**方式二：通过云开发控制台（推荐）**

1. 登录 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境 `cloudbase-6g3e4gx180dae419`
3. 进入"云托管" → "创建服务"
4. 上传代码或关联GitHub仓库
5. 配置端口：3000
6. 部署

---

## 重要配置

### 环境变量设置

在云托管控制台 → 服务配置 → 环境变量，添加：

```
JWT_SECRET=aiae_production_secret_key_2026
NODE_ENV=production
PORT=3000
```

### 访问地址

部署成功后，云托管会自动分配HTTPS域名：

```
https://aiae-server-xxx.gz.apigw.tencentcs.com
```

把这个地址更新到小程序的 `app.js` 中。

---

## 小程序前端配置修改

部署成功后，修改 `weapp/app.js`：

```javascript
// 原来的本地开发地址
// const API_BASE = 'http://localhost:3000/api';

// 云托管地址（部署后替换为实际的）
const API_BASE = 'https://aiae-server-xxx.gz.apigw.tencentcs.com/api';
```

---

## 数据库说明

云托管模式下，你有两个选择：

### 选项1：继续使用内存数据库（临时方案）
- 数据在容器重启后丢失
- 适合快速验证，不适合生产

### 选项2：使用云开发数据库（推荐）
需要把 `server/models/db.js` 改成云数据库版本。

需要我帮你改吗？

---

## 部署检查清单

- [ ] 云托管服务创建成功
- [ ] 环境变量配置完成
- [ ] HTTPS域名可以访问
- [ ] 小程序 `app.js` 已更新API地址
- [ ] 重新编译小程序，测试功能正常

---

## 常见问题

**Q: 部署失败怎么办？**
A: 检查Dockerfile是否正确，端口是否设置为3000

**Q: 怎么查看日志？**
A: 云开发控制台 → 云托管 → 服务日志

**Q: 如何更新代码？**
A: 重新执行 `tcb cloudrun deploy` 或上传新版本

---

**部署完成后告诉我HTTPS地址，我帮你更新小程序配置！**