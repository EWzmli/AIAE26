// 标签配置

// 当前状态标签
const STATUS_TAGS = [
  { id: 'want_startup', name: '想创业', icon: '💡' },
  { id: 'in_startup', name: '已在创业', icon: '🚀' },
  { id: 'find_partner', name: '寻找合伙人', icon: '🤝' },
  { id: 'provide_resource', name: '提供资源', icon: '📦' }
];

// 技术类技能标签
const TECH_TAGS = [
  'Python', 'C++', 'Java', 'JavaScript', 'TypeScript',
  '前端开发', '后端开发', '移动端开发', '小程序开发',
  'AIGC开发', '机器学习', '深度学习', '数据分析',
  'SQL', 'NoSQL', 'Redis', 'Docker', 'K8s',
  '硬件开发', '嵌入式', '物联网', '区块链'
];

// 设计/产品类技能标签
const DESIGN_TAGS = [
  'Figma', 'Sketch', 'Adobe XD',
  'UI设计', 'UX设计', '交互设计',
  '3D建模', '动画设计', '视频剪辑',
  '产品经理', '产品运营', '数据分析',
  '市场调研', '用户研究'
];

// 兴趣领域标签
const INTEREST_TAGS = [
  '生成式AI', '大模型应用', '计算机视觉', '自然语言处理',
  '游戏开发', '独立游戏', 'VR/AR', '元宇宙',
  '硬科技', '机器人', '自动驾驶', '航空航天',
  'Web3', 'DeFi', 'NFT', 'DAO',
  '新能源', '生物医药', '金融科技', '教育科技',
  '跨境电商', '内容创作', '社交媒体', '企业服务'
];

// 年级选项
const GRADE_OPTIONS = [
  '本科一年级', '本科二年级', '本科三年级', '本科四年级',
  '硕士一年级', '硕士二年级', '硕士三年级',
  '博士在读', '校友'
];

// 投入强度
const COMMITMENT_OPTIONS = [
  { value: 'fulltime', label: '全职 (Full-time)' },
  { value: 'parttime', label: '兼职 (Part-time)' },
  { value: 'project', label: '项目制' }
];

// 角色类型
const ROLE_OPTIONS = [
  '技术合伙人', '产品合伙人', '设计合伙人', '运营合伙人',
  '市场合伙人', '销售合伙人', 'Full Stack工程师',
  '前端工程师', '后端工程师', '算法工程师', 'UI设计师', 'UX设计师'
];

module.exports = {
  STATUS_TAGS,
  TECH_TAGS,
  DESIGN_TAGS,
  INTEREST_TAGS,
  GRADE_OPTIONS,
  COMMITMENT_OPTIONS,
  ROLE_OPTIONS
};
