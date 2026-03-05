// weapp/utils/featureCheck.js
/**
 * 功能开关检查工具
 * 用于在页面中快速检查功能是否可用
 */

const { isFeatureEnabled, showAuditTip } = require('../config');

/**
 * 检查功能并执行相应操作
 * @param {String} featureName 功能名称
 * @param {Function} callback 功能可用时执行的回调
 * @param {Boolean} showTip 功能不可用时是否显示提示
 * @returns {Boolean} 功能是否可用
 */
function checkAndRun(featureName, callback, showTip = true) {
  const app = getApp();
  const isEnabled = app.checkFeature(featureName);
  
  if (isEnabled) {
    callback && callback();
    return true;
  } else {
    if (showTip) {
      showAuditTip(featureName);
    }
    return false;
  }
}

/**
 * 包装点击事件，自动检查功能开关
 * 用法：bindtap="{{ wrappedCreatePost }}"
 */
function wrapTap(featureName, handler) {
  return function(e) {
    const app = getApp();
    if (app.checkFeature(featureName)) {
      handler.call(this, e);
    } else {
      showAuditTip(featureName);
    }
  };
}

module.exports = {
  checkAndRun,
  wrapTap
};