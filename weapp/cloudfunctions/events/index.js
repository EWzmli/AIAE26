// 活动云函数
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, data } = event;
  
  switch(action) {
    case 'getList':
      return await getList(data);
    case 'getDetail':
      return await getDetail(data);
    case 'create':
      return await create(data);
    case 'join':
      return await join(data);
    default:
      return { code: -1, msg: '未知操作' };
  }
};

// 获取活动列表
async function getList(data) {
  const { page = 1, pageSize = 10, status } = data || {};
  
  let where = {};
  if (status) {
    where.status = status;
  }
  
  const res = await db.collection('events')
    .where(where)
    .orderBy('startTime', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  return { code: 0, data: res.data };
}

// 获取活动详情
async function getDetail(data) {
  const { eventId } = data || {};
  
  if (!eventId) {
    return { code: -1, msg: '活动ID不能为空' };
  }
  
  const res = await db.collection('events').doc(eventId).get();
  return { code: 0, data: res.data };
}

// 创建活动
async function create(data) {
  const { OPENID } = cloud.getWXContext();
  const { title, description, location, startTime, endTime, maxParticipants } = data || {};
  
  if (!title || !startTime) {
    return { code: -1, msg: '标题和开始时间不能为空' };
  }
  
  // 获取用户信息
  const userRes = await db.collection('users').where({
    _openid: OPENID
  }).get();
  
  if (userRes.data.length === 0) {
    return { code: -1, msg: '请先登录' };
  }
  
  const user = userRes.data[0];
  
  const eventData = {
    _openid: OPENID,
    organizerId: user._id,
    organizerName: user.nickname,
    organizerAvatar: user.avatar,
    title,
    description,
    location,
    startTime: new Date(startTime),
    endTime: endTime ? new Date(endTime) : null,
    maxParticipants: maxParticipants || 50,
    participants: [],
    status: 'upcoming',
    createTime: db.serverDate()
  };
  
  const res = await db.collection('events').add({ data: eventData });
  
  return {
    code: 0,
    data: { ...eventData, _id: res._id },
    msg: '活动创建成功'
  };
}

// 参加活动
async function join(data) {
  const { OPENID } = cloud.getWXContext();
  const { eventId } = data || {};
  
  if (!eventId) {
    return { code: -1, msg: '活动ID不能为空' };
  }
  
  // 获取用户信息
  const userRes = await db.collection('users').where({
    _openid: OPENID
  }).get();
  
  if (userRes.data.length === 0) {
    return { code: -1, msg: '请先登录' };
  }
  
  const user = userRes.data[0];
  
  // 检查是否已参加
  const eventRes = await db.collection('events').doc(eventId).get();
  const event = eventRes.data;
  
  if (event.participants && event.participants.includes(user._id)) {
    return { code: -1, msg: '您已参加该活动' };
  }
  
  if (event.participants && event.participants.length >= event.maxParticipants) {
    return { code: -1, msg: '活动名额已满' };
  }
  
  await db.collection('events').doc(eventId).update({
    data: {
      participants: _.push(user._id)
    }
  });
  
  return { code: 0, msg: '报名成功' };
}