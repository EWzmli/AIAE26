Page({
  data: {
    event: {}
  },

  onLoad(options) {
    const id = options.id
    this.loadEventDetail(id)
  },

  loadEventDetail(id) {
    // 模拟数据
    const mockEvents = {
      1: {
        id: 1,
        type: '讲座',
        title: '创业思维与商业模式创新',
        description: '本次讲座将深入探讨创业思维的核心要素，以及如何在实践中构建可持续的商业模式。',
        detail: '主讲人：李明，知名创投合伙人，曾投资多个独角兽企业。讲座内容包括：1. 创业机会识别 2. 商业模式画布 3. 创业案例分享 4. 现场问答交流。',
        date: '2026-03-15 14:00-16:00',
        location: '电子信息楼 305',
        joinCount: 128
      },
      2: {
        id: 2,
        type: '比赛',
        title: '"互联网+"大学生创新创业大赛校内选拔',
        description: '展示你的创业项目，赢取丰厚奖金和孵化资源支持。',
        detail: '参赛要求：1. 团队人数3-7人 2. 项目需有原型或初步成果 3. 提交商业计划书。奖项设置：一等奖1名（奖金3万元+孵化资源），二等奖2名（奖金1万元），三等奖3名（奖金5000元）。',
        date: '2026-03-20 09:00-17:00',
        location: '创业学院报告厅',
        joinCount: 256
      },
      3: {
        id: 3,
        type: '聚会',
        title: 'AIAE创业者线下交流会',
        description: '与志同道合的创业者面对面交流，寻找合作伙伴。',
        detail: '活动流程：1. 自我介绍（每人2分钟）2. 项目展示环节 3. 自由交流 4. 晚餐聚餐。温馨提示：请准备20张名片，方便交换联系方式。',
        date: '2026-03-22 18:00-21:00',
        location: '闵行校区咖啡厅',
        joinCount: 45
      }
    }
    this.setData({ event: mockEvents[id] || mockEvents[1] })
  },

  joinEvent() {
    wx.showModal({
      title: '确认报名',
      content: '确定要报名参加该活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
