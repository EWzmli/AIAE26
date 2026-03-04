Page({
  data: {
    post: {},
    commentList: []
  },

  onLoad(options) {
    this.loadPostDetail(options.id)
  },

  loadPostDetail(id) {
    // 模拟数据
    this.setData({
      post: {
        id: id,
        author: '李明',
        title: '寻找技术合伙人',
        content: '我们团队正在开发一款AI教育产品，目前产品原型已完成，正在寻找一位有前端开发经验的技术合伙人。要求：熟悉React/Vue，有微信小程序开发经验优先。',
        time: '2小时前',
        likes: 24,
        comments: 8
      },
      commentList: [
        { id: 1, author: '王芳', content: '感兴趣，私信你了', time: '1小时前' },
        { id: 2, author: '张三', content: '有完整商业计划书吗？', time: '30分钟前' }
      ]
    })
  },

  likePost() {
    wx.showToast({ title: '点赞成功' })
  }
})
