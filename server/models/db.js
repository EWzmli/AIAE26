// 模拟数据存储（MVP阶段用内存存储，后期换数据库）
const users = new Map();
const posts = new Map();
const events = new Map();
const interactions = new Map();
const matches = new Map();

// 验证码存储
const verificationCodes = new Map();

// ID生成
let userIdCounter = 1;
let postIdCounter = 1;
let eventIdCounter = 1;

module.exports = {
  users,
  posts,
  events,
  interactions,
  matches,
  verificationCodes,
  generateUserId: () => `user_${userIdCounter++}`,
  generatePostId: () => `post_${postIdCounter++}`,
  generateEventId: () => `event_${eventIdCounter++}`
};
