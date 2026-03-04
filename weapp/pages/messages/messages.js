Page({
  data: {
    messages: [
      {
        id: 1,
        icon: '💬',
        title: '系统通知',
        content: '欢迎加入AIAE创业者社区，完善资料即可获得更多曝光机会！',
        time: '今天 10:30',
        unread: true
      },
      {
        id: 2,
        icon: '👤',
        title: '新Link请求',
        content: '张三请求与你建立连接，点击查看详情。',
        time: '昨天 15:20',
        unread: false
      },
      {
        id: 3,
        icon: '📢',
        title: '活动提醒',
        content: '您报名的"创业思维讲座"将在明天14:00开始，请准时参加。',
        time: '昨天 09:00',
        unread: false
      }
    ]
  },

  onLoad() {
    // 后续接入后端API获取真实消息
  },

  onShow() {
    // 刷新消息列表
  }
})
