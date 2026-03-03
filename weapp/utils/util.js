// 工具函数库

/**
 * 格式化日期
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 格式化时间
 */
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${formatDate(date)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 掩码处理微信号
 */
function maskWechat(wechatId) {
  if (!wechatId || wechatId.length < 4) return '***';
  const first = wechatId.slice(0, 3);
  return `${first}****`;
}

/**
 * 防抖函数
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 检查邮箱是否为校内邮箱
 */
function isSchoolEmail(email) {
  return email.endsWith('@sjtu.edu.cn');
}

/**
 * 验证表单
 */
function validateForm(rules, data) {
  for (let rule of rules) {
    const { field, required, message, validator } = rule;
    const value = data[field];
    
    if (required && !value) {
      return { valid: false, message };
    }
    
    if (validator && value && !validator(value)) {
      return { valid: false, message };
    }
  }
  return { valid: true };
}

/**
 * 存储封装
 */
const storage = {
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      return false;
    }
  },
  get(key) {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      return null;
    }
  },
  remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      return false;
    }
  }
};

module.exports = {
  formatDate,
  formatTime,
  maskWechat,
  debounce,
  isSchoolEmail,
  validateForm,
  storage
};
