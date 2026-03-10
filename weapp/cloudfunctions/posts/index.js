// 帖子云函数
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
    case 'like':
      return await like(data);
    default:
      return { code: -1, msg: '未知操作' };
  }
};

// 获取帖子列表
async function getList(data) {
  const { page = 1, pageSize = 10, category } = data || {};
  
  let where = {};
  if (category && category !== 'all') {
    where.category = category;
  }
  
  const res = await db.collection('posts')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  return { code: 0, data: res.data };
}

// 获取帖子详情
async function getDetail(data) {
  const { postId } = data || {};
  
  if (!postId) {
    return { code: -1, msg: '帖子ID不能为空' };
  }
  
  const res = await db.collection('posts').doc(postId).get();
  
  // 增加浏览量
  await db.collection('posts').doc(postId).update({
    data: {
      viewCount: _.inc(1)
    }
  });
  
  return { code: 0, data: res.data };
}

// 创建帖子
async function create(data) {
  const { OPENID } = cloud.getWXContext();
  const { title, content, category, images = [] } = data || {};
  
  if (!title || !content) {
    return { code: -1, msg: '标题和内容不能为空' };
  }
  
  // 获取用户信息
  const userRes = await db.collection('users').where({
    _openid: OPENID
  }).get();
  
  if (userRes.data.length === 0) {
    return { code: -1, msg: '请先登录' };
  }
  
  const user = userRes.data[0];
  
  const postData = {
    _openid: OPENID,
    authorId: user._id,
    authorName: user.nickname,
    authorAvatar: user.avatar,
    authorStatusTag: user.statusTag,
    title,
    content,
    category,
    images,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createTime: db.serverDate()
  };
  
  const res = await db.collection('posts').add({ data: postData });
  
  return {
    code: 0,
    data: { ...postData, _id: res._id },
    msg: '发布成功'
  };
}

// 点赞
async function like(data) {
  const { postId } = data || {};
  
  if (!postId) {
    return { code: -1, msg: '帖子ID不能为空' };
  }
  
  await db.collection('posts').doc(postId).update({
    data: {
      likeCount: _.inc(1)
    }
  });
  
  return { code: 0, msg: '点赞成功' };
}
