// 社交匹配云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, data } = event;
  
  switch(action) {
    case 'getMatches':
      return await getMatches(data);
    case 'likeUser':
      return await likeUser(data);
    case 'getMatchesList':
      return await getMatchesList(data);
    default:
      return { code: -1, msg: '未知操作' };
  }
};

// 获取推荐匹配
async function getMatches(data) {
  const { OPENID } = cloud.getWXContext();
  const { page = 1, pageSize = 10 } = data || {};
  
  // 获取当前用户信息
  const userRes = await db.collection('users').where({
    _openid: OPENID
  }).get();
  
  if (userRes.data.length === 0) {
    return { code: -1, msg: '请先登录' };
  }
  
  const currentUser = userRes.data[0];
  
  // 简单的匹配逻辑：根据标签匹配
  const myTags = [
    ...(currentUser.techTags || []),
    ...(currentUser.designTags || []),
    ...(currentUser.interestTags || [])
  ];
  
  // 获取已匹配/已划过的用户ID列表
  const likeRes = await db.collection('likes').where({
    _openid: OPENID
  }).get();
  
  const likedUserIds = likeRes.data.map(item => item.targetUserId);
  likedUserIds.push(currentUser._id); // 排除自己
  
  // 查询推荐用户
  let query = db.collection('users')
    .where({
      _id: _.nin(likedUserIds),
      isProfileComplete: true
    });
  
  // 如果有标签，优先匹配有相同标签的用户
  if (myTags.length > 0) {
    query = query.where({
      techTags: _.in(myTags)
    });
  }
  
  const res = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  // 计算匹配度分数
  const matches = res.data.map(user => {
    const userTags = [
      ...(user.techTags || []),
      ...(user.designTags || []),
      ...(user.interestTags || [])
    ];
    
    const commonTags = myTags.filter(tag => userTags.includes(tag));
    const matchScore = myTags.length > 0 
      ? Math.round((commonTags.length / myTags.length) * 100)
      : 50;
    
    return {
      ...user,
      matchScore: Math.min(matchScore, 100),
      commonTags
    };
  });
  
  // 按匹配度排序
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return { code: 0, data: matches };
}

// 喜欢/匹配用户
async function likeUser(data) {
  const { OPENID } = cloud.getWXContext();
  const { targetUserId } = data || {};
  
  if (!targetUserId) {
    return { code: -1, msg: '目标用户ID不能为空' };
  }
  
  // 获取当前用户信息
  const userRes = await db.collection('users').where({
    _openid: OPENID
  }).get();
  
  if (userRes.data.length === 0) {
    return { code: -1, msg: '请先登录' };
  }
  
  const currentUser = userRes.data[0];
  
  // 记录喜欢
  await db.collection('likes').add({
    data: {
      _openid: OPENID,
      userId: currentUser._id,
      targetUserId,
      createTime: db.serverDate()
    }
  });
  
  // 检查对方是否也喜欢我（双向匹配）
  const mutualLike = await db.collection('likes').where({
    _openid: _.neq(OPENID),
    userId: targetUserId,
    targetUserId: currentUser._id
  }).get();
  
  if (mutualLike.data.length > 0) {
    // 创建匹配关系
    await db.collection('matches').add({
      data: {
        userId1: currentUser._id,
        userId2: targetUserId,
        createTime: db.serverDate()
      }
    });
    
    return { code: 0, msg: '匹配成功！', isMatch: true };
  }
  
  return { code: 0, msg: '已喜欢', isMatch: false };
}

// 获取我的匹配列表
async function getMatchesList(data) {
  const { OPENID } = cloud.getWXContext();
  
  const userRes = await db.collection('users').where({
    _openid: OPENID
  }).get();
  
  if (userRes.data.length === 0) {
    return { code: -1, msg: '请先登录' };
  }
  
  const currentUser = userRes.data[0];
  
  // 查询匹配关系
  const matchRes = await db.collection('matches').where(
    _.or([
      { userId1: currentUser._id },
      { userId2: currentUser._id }
    ])
  ).get();
  
  // 获取匹配用户信息
  const matches = await Promise.all(
    matchRes.data.map(async (match) => {
      const otherUserId = match.userId1 === currentUser._id 
        ? match.userId2 
        : match.userId1;
      
      const otherUserRes = await db.collection('users').doc(otherUserId).get();
      return {
        ...otherUserRes.data,
        matchTime: match.createTime
      };
    })
  );
  
  return { code: 0, data: matches };
}