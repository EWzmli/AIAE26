Page({
  data: {
    user: {
      name: '李明',
      grade: '研二',
      major: '计算机科学',
      bio: '热爱创业，寻找志同道合的伙伴',
      tags: ['前端开发', '产品设计', '创业']
    },
    posts: [
      { id: 1, title: '寻找技术合伙人', time: '2小时前' },
      { id: 2, title: '分享我的创业心得', time: '3天前' }
    ]
  },

  onLoad(options) {
    // 根据options.id加载用户详情
  },

  sendLink() {
    wx.showModal({
      title: '申请Link',
      content: '向对方发送Link申请？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '申请已发送' })
        }
      }
    })
  },

  sendMessage() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  }
})
