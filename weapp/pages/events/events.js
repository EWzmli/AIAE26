Page({
  data: {
    events: []
  },

  onLoad() {
    this.loadEvents()
  },

  onShow() {
    this.loadEvents()
  },

  loadEvents() {
    // 模拟数据，后续接入后端API
    const mockEvents = [
      {
        id: 1,
        type: '讲座',
        title: '创业思维与商业模式创新',
        description: '邀请知名投资人分享创业经验，探讨如何构建可持续的商业模式...',
        date: '2026-03-15',
        location: '电子信息楼 305',
        joinCount: 128
      },
      {
        id: 2,
        type: '比赛',
        title: '"互联网+"大学生创新创业大赛校内选拔',
        description: '展示你的创业项目，赢取丰厚奖金和孵化资源支持...',
        date: '2026-03-20',
        location: '创业学院报告厅',
        joinCount: 256
      },
      {
        id: 3,
        type: '聚会',
        title: 'AIAE创业者线下交流会',
        description: '与志同道合的创业者面对面交流，寻找合作伙伴...',
        date: '2026-03-22',
        location: '闵行校区咖啡厅',
        joinCount: 45
      }
    ]
    this.setData({ events: mockEvents })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/events/event-detail?id=${id}`
    })
  },

  createEvent() {
    wx.showToast({
      title: '创建功能开发中',
      icon: 'none'
    })
  }
})
