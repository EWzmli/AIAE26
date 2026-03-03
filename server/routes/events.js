const express = require('express');
const router = express.Router();
const { events, users, generateEventId } = require('../models/db');

// 初始化一些示例活动
const initEvents = () => {
  if (events.size === 0) {
    const sampleEvents = [
      {
        id: 'event_1',
        title: '2026春季黑客松',
        description: '48小时极限编程，组队挑战真实商业问题',
        organizer: '创协',
        location: '交大闵行校区',
        startTime: '2026-03-15 09:00',
        endTime: '2026-03-16 18:00',
        type: 'Hackathon',
        poster: 'https://picsum.photos/400/300?random=1',
        participantCount: 45,
        teamupEnabled: true,
        createdAt: new Date()
      },
      {
        id: 'event_2',
        title: 'AI创业分享会',
        description: '邀请校友AI创业者分享经验',
        organizer: '电院团委',
        location: '东上院101',
        startTime: '2026-03-10 19:00',
        endTime: '2026-03-10 21:00',
        type: '分享会',
        poster: 'https://picsum.photos/400/300?random=2',
        participantCount: 128,
        teamupEnabled: false,
        createdAt: new Date()
      },
      {
        id: 'event_3',
        title: '百团大战',
        description: '春季社团招新',
        organizer: '社团总会',
        location: '光体',
        startTime: '2026-03-08 10:00',
        endTime: '2026-03-08 17:00',
        type: '社团活动',
        poster: 'https://picsum.photos/400/300?random=3',
        participantCount: 0,
        teamupEnabled: true,
        createdAt: new Date()
      }
    ];
    
    sampleEvents.forEach(e => events.set(e.id, e));
  }
};

// 获取活动列表
router.get('/', (req, res) => {
  initEvents();
  
  const list = Array.from(events.values())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
  res.json(list);
});

// 获取单个活动
router.get('/:id', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) {
    return res.status(404).json({ message: '活动不存在' });
  }
  
  res.json(event);
});

// 报名活动
router.post('/:id/register', (req, res) => {
  // TODO: 实现活动报名
  res.json({ message: '报名成功' });
});

// 获取活动参与者（组队专区）
router.get('/:id/participants', (req, res) => {
  // TODO: 实现参与者列表
  res.json([]);
});

module.exports = router;
