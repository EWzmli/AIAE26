// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event;
  
  switch(action) {
    case 'checkLogin':
      return await checkLogin();
    case 'wxLogin':
      return await wxLogin(data);
    case 'completeProfile':
      return await completeProfile(data);
    case 'getProfile':
      return await getProfile();
    default:
      return { code: -1, msg: '未知操作' };
  }
};

// 检查登录状态
async function checkLogin() {
  const { OPENID } = cloud.getWXContext();
  
  const res = await db.collection('users').where({ 
    _openid: OPENID 
  }).get();
  
  if (res.data.length > 0) {
    const user = res.data[0];
    if (user.isProfileComplete) {
      return { code: 0, data: user };
    } else {
      return { code: 2, msg: '需要完善资料', userId: user._id };
    }
  }
  
  return { code: 1, msg: '未注册' };
}

// 微信登录（自动注册空账号）
async function wxLogin(data) {
  const { OPENID } = cloud.getWXContext();
  const { avatar = '', nickname = '' } = data || {};
  
  // 检查是否已存在
  const exist = await db.collection('users').where({ 
    _openid: OPENID 
  }).get();
  
  if (exist.data.length > 0) {
    const user = exist.data[0];
    if (user.isProfileComplete) {
      return { code: 0, data: user };
    } else {
      return { code: 2, msg: '需要完善资料', userId: user._id };
    }
  }
  
  // 创建空账号
  const userData = {
    _openid: OPENID,
    nickname,
    avatar,
    grade: '',
    major: '',
    wechatId: '',
    wechatMasked: '',
    projectName: '',
    statusTag: '',
    techTags: [],
    designTags: [],
    interestTags: [],
    bio: '',
    isProfileComplete: false,
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  };
  
  const res = await db.collection('users').add({ data: userData });
  
  return {
    code: 2,
    msg: '请完善个人资料',
    userId: res._id
  };
}

// 完善资料
async function completeProfile(data) {
  const { OPENID } = cloud.getWXContext();
  const {
    nickname, avatar, grade, major,
    wechatId, projectName, statusTag,
    techTags, designTags, interestTags, bio
  } = data;
  
  // 脱敏处理微信号
  const wechatMasked = wechatId ? 
    wechatId.slice(0, 2) + '****' + wechatId.slice(-2) : '';
  
  const updateData = {
    nickname,
    avatar,
    grade,
    major,
    wechatId,
    wechatMasked,
    projectName,
    statusTag,
    techTags: techTags || [],
    designTags: designTags || [],
    interestTags: interestTags || [],
    bio,
    isProfileComplete: true,
    updateTime: db.serverDate()
  };
  
  await db.collection('users').where({ _openid: OPENID }).update({
    data: updateData
  });
  
  // 返回完整用户信息
  const userRes = await db.collection('users').where({ _openid: OPENID }).get();
  
  return {
    code: 0,
    data: userRes.data[0],
    msg: '资料完善成功'
  };
}

// 获取当前用户资料
async function getProfile() {
  const { OPENID } = cloud.getWXContext();
  
  const res = await db.collection('users').where({ 
    _openid: OPENID 
  }).get();
  
  if (res.data.length > 0) {
    return { code: 0, data: res.data[0] };
  }
  
  return { code: -1, msg: '用户不存在' };
}