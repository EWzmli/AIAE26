// 内存数据存储（MVP阶段）

// 用户存储
const users = new Map();

// 帖子存储
const posts = new Map();

// 评论存储
const comments = new Map();

// 活动存储
const events = new Map();

// 活动报名存储
const eventParticipants = new Map();

// 验证码存储
const verificationCodes = new Map();

// 用户交互存储（喜欢/跳过）
const interactions = new Map();

// 匹配关系存储
const matches = new Map();

// ID生成器
let userIdCounter = 1;
let postIdCounter = 1;
let commentIdCounter = 1;
let eventIdCounter = 1;
let matchIdCounter = 1;

const generateUserId = () => `user_${String(userIdCounter++).padStart(4, '0')}`;
const generatePostId = () => `post_${String(postIdCounter++).padStart(4, '0')}`;
const generateCommentId = () => `comment_${String(commentIdCounter++).padStart(4, '0')}`;
const generateEventId = () => `event_${String(eventIdCounter++).padStart(4, '0')}`;
const generateMatchId = () => `match_${String(matchIdCounter++).padStart(4, '0')}`;

// 初始化一些测试数据
const initTestData = () => {
  // 创建测试用户
  const testUsers = [
    {
      id: 'user_0001',
      email: 'test1@sjtu.edu.cn',
      name: '李明',
      nickname: 'Ming',
      avatar: '',
      grade: '研二',
      major: '计算机科学',
      wechatId: 'liming2024',
      wechatMasked: 'lim****024',
      bio: 'AI创业者，寻找志同道合的技术合伙人',
      projectName: '智能教育平台',
      statusTag: '有项目找技术',
      techTags: ['Python', 'React', 'TensorFlow'],
      designTags: [],
      interestTags: ['创业', 'AI', '教育'],
      isProfileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'user_0002',
      email: 'test2@sjtu.edu.cn',
      name: '王芳',
      nickname: 'Fiona',
      avatar: '',
      grade: '研一',
      major: '工业设计',
      wechatId: 'wangfang_design',
      wechatMasked: 'wan****ign',
      bio: 'UX设计师，热爱产品设计',
      projectName: '',
      statusTag: '设计找项目',
      techTags: [],
      designTags: ['Figma', 'Sketch', 'UI/UX'],
      interestTags: ['设计', '创业'],
      isProfileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'user_0003',
      email: 'test3@sjtu.edu.cn',
      name: '张伟',
      nickname: 'David',
      avatar: '',
      grade: '本科大三',
      major: '软件工程',
      wechatId: 'zhangwei_dev',
      wechatMasked: 'zha****dev',
      bio: '全栈开发，想找创业机会',
      projectName: '',
      statusTag: '技术找项目',
      techTags: ['Vue', 'Node.js', 'MongoDB'],
      designTags: [],
      interestTags: ['编程', '创业', '音乐'],
      isProfileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  testUsers.forEach(u => users.set(u.id, u));
  
  // 创建测试帖子
  const testPosts = [
    {
      id: 'post_0001',
      userId: 'user_0001',
      type: 'find_partner',
      title: 'AI教育项目寻找技术合伙人',
      content: '我们团队正在开发一款基于大语言模型的智能教育产品，目前已有初步原型，用户反馈很好。现寻找一位有前端开发经验的技术合伙人，最好有Vue或React开发经验。',
      roleType: '前端开发',
      commitment: '兼职',
      reward: '股权+奖金',
      projectName: '智学AI',
      tags: ['前端', 'React', 'Vue'],
      status: 'approved',
      commentCount: 3,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'post_0002',
      userId: 'user_0002',
      type: 'find_partner',
      title: '招募UI/UX设计师',
      content: '创业团队寻找有互联网产品设计经验的设计师，主要负责移动端APP的界面设计和用户体验优化。',
      roleType: 'UI/UX设计',
      commitment: '兼职',
      reward: '项目分成',
      projectName: '校园生活APP',
      tags: ['UI设计', 'UX', 'Figma'],
      status: 'approved',
      commentCount: 1,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000)
    },
    {
      id: 'post_0003',
      userId: 'user_0003',
      type: 'job',
      title: '招后端开发实习生',
      content: '校内创业项目招后端开发实习生，技术栈Node.js+MongoDB，要求每周至少3天时间。',
      roleType: '后端开发',
      commitment: '实习',
      reward: '薪资+实习证明',
      projectName: '校园二手平台',
      tags: ['后端', 'Node.js', 'MongoDB'],
      status: 'approved',
      commentCount: 0,
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 259200000)
    }
  ];
  
  testPosts.forEach(p => posts.set(p.id, p));
  
  // 创建测试评论
  const testComments = [
    {
      id: 'comment_0001',
      postId: 'post_0001',
      userId: 'user_0002',
      content: '很感兴趣，可以详细聊聊吗？',
      parentId: null,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'comment_0002',
      postId: 'post_0001',
      userId: 'user_0003',
      content: '我有React经验，可以投简历吗？',
      parentId: null,
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      id: 'comment_0003',
      postId: 'post_0001',
      userId: 'user_0001',
      content: '欢迎欢迎，可以加我微信详聊',
      parentId: null,
      createdAt: new Date(Date.now() - 10800000)
    }
  ];
  
  testComments.forEach(c => comments.set(c.id, c));
  
  console.log('✅ 测试数据初始化完成');
  console.log(`   用户数: ${users.size}`);
  console.log(`   帖子数: ${posts.size}`);
  console.log(`   评论数: ${comments.size}`);
};

// 导出模块
module.exports = {
  users,
  posts,
  comments,
  events,
  eventParticipants,
  verificationCodes,
  interactions,
  matches,
  generateUserId,
  generatePostId,
  generateCommentId,
  generateEventId,
  generateMatchId,
  initTestData
};
