# AIAE 小程序审核模式指南

## 快速切换（只需改1个文件）

### 提交审核前（隐藏敏感功能）

1. 打开 `weapp/config.js`
2. 修改第6行：

```javascript
// 设置为 true 时，隐藏敏感功能（提交审核时用）
AUDIT_MODE: true,  // ← 改成 true
```

3. 将 `app.audit.json` 复制为 `app.json`：

```bash
cd weapp
cp app.json app.full.json      # 备份完整版
cp app.audit.json app.json     # 使用审核版
```

4. 在微信开发者工具中重新编译

### 审核通过后（恢复完整功能）

1. 打开 `weapp/config.js`
2. 修改第6行：

```javascript
AUDIT_MODE: false,  // ← 改成 false
```

3. 恢复完整版 `app.json`：

```bash
cd weapp
cp app.full.json app.json
```

4. 在微信开发者工具中重新编译

---

## 审核模式 vs 完整模式

| 功能 | 审核模式 | 完整模式 |
|------|----------|----------|
| **TabBar** | 只显示"社区"+"我的" | 显示"社区"+"社交"+"我的" |
| **社区发帖** | ❌ 隐藏发布按钮 | ✅ 正常发帖 |
| **社交匹配** | ❌ 隐藏整个页面 | ✅ 滑动匹配 |
| **私信聊天** | ❌ 无法使用 | ✅ 正常使用 |
| **查看帖子** | ✅ 可以浏览 | ✅ 可以浏览 |
| **名片功能** | ✅ 可以使用 | ✅ 可以使用 |
| **个人资料** | ✅ 可以编辑 | ✅ 可以编辑 |

---

## 被隐藏的功能说明

审核模式下，以下功能会被隐藏或禁用：

1. **社交Tab** - 整个"社交"标签页被移除
2. **发帖按钮** - 社区页面右下角"+发布"按钮隐藏
3. **创建帖子** - 无法进入发帖页面
4. **私信功能** - 无法发送消息
5. **匹配系统** - 无法使用Link匹配

这些功能在审核通过后可以一键恢复。

---

## 首次提交审核建议

### 第一轮（极简版）
✅ 保留：
- 邮箱登录
- 个人资料填写
- 社区浏览（只读）
- 名片生成
- 活动浏览

❌ 隐藏：
- 发帖功能
- 社交匹配
- 私信聊天
- 关注用户

### 第二轮（审核通过后）
恢复全部功能，提交更新版本

---

## 常见问题

**Q: 审核模式会影响已注册用户的数据吗？**
A: 不会，只是隐藏前端入口，后端数据不受影响。

**Q: 审核期间能给同学试用吗？**
A: 可以！用微信开发者工具生成"体验版"二维码，200个体验名额。

**Q: 审核被拒怎么办？**
A: 根据拒绝原因调整，常见原因：
- 缺少用户协议/隐私政策 → 补充页面
- 涉及社交撮合 → 继续隐藏匹配功能
- UGC内容无审核 → 先关闭发帖功能

**Q: 切换模式后需要重新提交审核吗？**
A: 从审核模式切到完整模式需要重新提交审核（作为版本更新）。

---

## 技术实现细节

### 配置结构
```javascript
// config.js
CONFIG.AUDIT_MODE: false  // 总开关

CONFIG.features: {
  POST_CREATE: true,      // 发帖
  POST_COMMENT: true,     // 评论
  SOCIAL_SWIPE: true,     // 滑动匹配
  SOCIAL_MATCH: true,     // Link匹配
  CHAT_MESSAGE: true,     // 私信
  EVENT_CREATE: true,     // 创建活动
  EVENT_JOIN: true,       // 报名活动
  CARD_PRINT: true,       // 名片打印
  USER_FOLLOW: true,      // 关注
}
```

### 在页面中使用
```javascript
// 检查功能开关
const app = getApp();
if (!app.checkFeature('POST_CREATE')) {
  wx.showToast({ title: '功能即将开放', icon: 'none' });
  return;
}

// 条件渲染（WXML）
<view wx:if="{{canCreatePost}}">...</view>
```

### TabBar切换
- `app.json` - 完整版（3个Tab）
- `app.audit.json` - 审核版（2个Tab）

---

## 文件清单

| 文件 | 作用 |
|------|------|
| `config.js` | 功能开关配置 |
| `app.json` | 完整版页面配置 |
| `app.audit.json` | 审核版页面配置 |
| `utils/featureCheck.js` | 功能检查工具 |

---

**最后更新：2026-03-05**
**作者：OpenClaw AI Assistant**