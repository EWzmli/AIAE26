// weapp/config.js
// 小程序功能开关配置
// 提交审核时，将 AUDIT_MODE 设为 true

const CONFIG = {
  // ==================== 审核模式开关 ====================
  // 设置为 true 时，隐藏敏感功能（提交审核时用）
  // 设置为 false 时，显示全部功能（审核通过后用）
  AUDIT_MODE: false,
  
  // ==================== 功能开关配置 ====================
  features: {
    // 社区发帖功能
    POST_CREATE: true,      // 创建帖子
    POST_COMMENT: true,     // 评论功能
    
    // 社交匹配功能  
    SOCIAL_SWIPE: true,     // 滑动匹配
    SOCIAL_MATCH: true,     // Link匹配系统
    
    // 私信功能
    CHAT_MESSAGE: true,     // 私信聊天
    
    // 活动功能
    EVENT_CREATE: true,     // 创建活动
    EVENT_JOIN: true,       // 报名活动
    
    // 名片功能
    CARD_PRINT: true,       // 名片打印
    
    // 其他
    USER_FOLLOW: true,      // 关注用户
  },
  
  // ==================== 审核模式下的提示文案 ====================
  auditMessages: {
    POST_CREATE: '发帖功能即将开放，敬请期待',
    SOCIAL_MATCH: '社交匹配功能即将开放',
    CHAT_MESSAGE: '私信功能即将开放',
    EVENT_CREATE: '活动发布功能即将开放',
  }
};

// 根据审核模式自动调整功能开关
function getFeatures() {
  if (CONFIG.AUDIT_MODE) {
    return {
      POST_CREATE: false,
      POST_COMMENT: false,
      SOCIAL_SWIPE: false,
      SOCIAL_MATCH: false,
      CHAT_MESSAGE: false,
      EVENT_CREATE: false,
      EVENT_JOIN: true,      // 可以查看和报名
      CARD_PRINT: true,      // 名片可以展示
      USER_FOLLOW: false,
    };
  }
  return CONFIG.features;
}

// 检查功能是否可用
function isFeatureEnabled(featureName) {
  const features = getFeatures();
  return features[featureName] !== false;
}

// 获取审核模式下的提示文案
function getAuditMessage(featureName) {
  return CONFIG.auditMessages[featureName] || '该功能即将开放，敬请期待';
}

// 显示功能未开放提示
function showAuditTip(featureName) {
  const message = getAuditMessage(featureName);
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

module.exports = {
  CONFIG,
  getFeatures,
  isFeatureEnabled,
  getAuditMessage,
  showAuditTip
};