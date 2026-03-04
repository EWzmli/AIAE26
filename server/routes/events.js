const express = require('express');
const router = express.Router();
const { events, users, eventParticipants, generateEventId } = require('../models/db');

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: '未登录' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aiae_dev_secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token无效' });
  }
};

// 初始化示例活动
const initEvents = () => {
  if (events.size === 0) {
    const sampleEvents = [
      {
        id: 'event_1',
        title: '2026春季黑客松',
        description: '48小时极限编程，组队挑战真实商业问题。无论你是技术大牛还是产品小白，都能找到合适的队友！提供餐饮和住宿。',
        organizer: '创协 & 电院',
        location: '交大闵行校区 电信楼',
        startTime: '2026-03-15T09:00:00',
        endTime: '2026-03-16T18:00:00',
        type: 'hackathon',
        poster: 'https://picsum.photos/400/300?random=1',
        maxParticipants: 100,
        participantCount: 45,
        teamupEnabled: true,
        status: 'upcoming',
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'event_2',
        title: 'AI创业分享会',
        description: '邀请3位校友AI创业者分享从0到1的创业历程。包括技术选型、融资经历、团队搭建等实战经验。',
        organizer: '电院团委',
        location: '东上院101',
        startTime: '2026-03-10T19:00:00',
        endTime: '2026-03-10T21:00:00',
        type: 'lecture',
        poster: 'https://picsum.photos/400/300?random=2',
        maxParticipants: 200,
        participantCount: 128,
        teamupEnabled: false,
        status: 'upcoming',
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'event_3',
        title: '百团大战 · 春季招新',
        description: '百团大战来了！创业类社团联合招新，现场可以了解各社团项目，寻找志同道合的伙伴。',
        organizer: '社团总会',
        location: '光体',
        startTime: '2026-03-08T10:00:00',
        endTime: '2026-03-08T17:00:00',
        type: 'fair',
        poster: 'https://picsum.photos/400/300?random=3',
        maxParticipants: 500,
        participantCount: 0,
        teamupEnabled: true,
        status: 'upcoming',
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'event_4',
        title: '创业路演日',
        description: '优秀创业项目路演展示，邀请投资人和校友评委点评。观众可以现场提问交流。',
        organizer: '创业学院',
        location: '创业学院报告厅',
        startTime: '2026-03-20T14:00:00',
        endTime: '2026-03-20T17:00:00',
        type: 'demo',
        poster: 'https://picsum.photos/400/300?random=4',
        maxParticipants: 150,
        participantCount: 89,
        teamupEnabled: false,
        status: 'upcoming',
        createdAt: new Date(),
        createdBy: 'admin'
      }
    ];
    
    sampleEvents.forEach(e => events.set(e.id, e));
  }
};

// 获取活动列表
router.get('/', (req, res) => {
  initEvents();
  
  const { type, status = 'upcoming' } = req.query;
  
  let list = Array.from(events.values());
  
  if (type) {
    list = list.filter(e => e.type === type);
  }
  
  if (status) {
    list = list.filter(e => e.status === status);
  }
  
  // 按时间排序
  list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
  res.json(list.map(e => ({
    ...e,
    timeAgo: getTimeAgo(e.startTime)
  })));
});

// 获取单个活动
router.get('/:id', (req, res) => {
  initEvents();
  
  const event = events.get(req.params.id);
  if (!event) {
    return res.status(404).json({ message: '活动不存在' });
  }
  
  // 检查当前用户是否已报名
  const isRegistered = eventParticipants.has(`${req.params.id}_${req.userId}`);
  
  res.json({
    ...event,
    isRegistered,
    timeAgo: getTimeAgo(event.startTime)
  });
});

// 报名活动
router.post('/:id/register', authMiddleware, (req, res) => {
  initEvents();
  
  const event = events.get(req.params.id);
  if (!event) {
    return res.status(404).json({ message: '活动不存在' });
  }
  
  const participantKey = `${req.params.id}_${req.userId}`;
  if (eventParticipants.has(participantKey)) {
    return res.status(400).json({ message: '已经报名过了' });
  }
  
  // 检查是否满员
  if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
    return res.status(400).json({ message: '活动已满员' });
  }
  
  const { message, teamup } = req.body;
  
  const participant = {
    id: participantKey,
    eventId: req.params.id,
    userId: req.userId,
    message: message || '',
    teamup: teamup || false,
    status: 'registered',
    createdAt: new Date()
  };
  
  eventParticipants.set(participantKey, participant);
  
  // 更新活动报名人数
  event.participantCount = (event.participantCount || 0) + 1;
  
  res.json({ message: '报名成功', participant });
});

// 取消报名
router.delete('/:id/register', authMiddleware, (req, res) => {
  const event = events.get(req.params.id);
  if (!event) {
    return res.status(404).json({ message: '活动不存在' });
  }
  
  const participantKey = `${req.params.id}_${req.userId}`;
  if (!eventParticipants.has(participantKey)) {
    return res.status(400).json({ message: '未报名该活动' });
  }
  
  eventParticipants.delete(participantKey);
  event.participantCount = Math.max(0, (event.participantCount || 0) - 1);
  
  res.json({ message: '取消报名成功' });
});

// 获取活动参与者（组队专区）
router.get('/:id/participants', (req, res) => {
  initEvents();
  
  const event = events.get(req.params.id);
  if (!event) {
    return res.status(404).json({ message: '活动不存在' });
  }
  
  const participants = Array.from(eventParticipants.values())
    .filter(p => p.eventId === req.params.id && p.teamup)
    .map(p => {
      const user = users.get(p.userId);
      return {
        ...p,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          grade: user.grade,
          major: user.major,
          statusTag: user.statusTag,
          techTags: user.techTags || []
        } : null
      };
    });
  
  res.json(participants);
});

// 获取我的活动报名
router.get('/my/registrations', authMiddleware, (req, res) => {
  initEvents();
  
  const myRegistrations = Array.from(eventParticipants.values())
    .filter(p => p.userId === req.userId)
    .map(p => {
      const event = events.get(p.eventId);
      return {
        ...p,
        event: event ? {
          id: event.id,
          title: event.title,
          startTime: event.startTime,
          location: event.location,
          poster: event.poster
        } : null
      };
    });
  
  res.json(myRegistrations);
});

// 创建活动（管理员）
router.post('/', authMiddleware, (req, res) => {
  const {
    title, description, organizer, location, 
    startTime, endTime, type, poster, maxParticipants, teamupEnabled
  } = req.body;
  
  if (!title || !startTime || !location) {
    return res.status(400).json({ message: '缺少必要信息' });
  }
  
  const event = {
    id: generateEventId(),
    title,
    description: description || '',
    organizer: organizer || '',
    location,
    startTime,
    endTime: endTime || startTime,
    type: type || 'other',
    poster: poster || '',
    maxParticipants: maxParticipants || null,
    participantCount: 0,
    teamupEnabled: teamupEnabled || false,
    status: 'upcoming',
    createdAt: new Date(),
    createdBy: req.userId
  };
  
  events.set(event.id, event);
  
  res.status(201).json({ message: '活动创建成功', event });
});

function getTimeAgo(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  
  if (diff < 0) return '已结束';
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  
  if (days > 0) return `${days}天后`;
  if (hours > 0) return `${hours}小时后`;
  return '即将开始';
}

module.exports = router;
