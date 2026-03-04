Page({
  data: {
    userInfo: {},
    grades: ['本科大一', '本科大二', '本科大三', '本科大四', '硕士', '博士'],
    gradeIndex: 0
  },

  onLoad() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({ userInfo })
  },

  onNicknameInput(e) {
    this.setData({ 'userInfo.nickname': e.detail.value })
  },

  onRealNameInput(e) {
    this.setData({ 'userInfo.realName': e.detail.value })
  },

  onGradeChange(e) {
    this.setData({
      gradeIndex: e.detail.value,
      'userInfo.grade': this.data.grades[e.detail.value]
    })
  },

  onMajorInput(e) {
    this.setData({ 'userInfo.major': e.detail.value })
  },

  onBioInput(e) {
    this.setData({ 'userInfo.bio': e.detail.value })
  },

  addTag() {
    wx.showModal({
      title: '添加标签',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const tags = this.data.userInfo.tags || []
          tags.push(res.content)
          this.setData({ 'userInfo.tags': tags })
        }
      }
    })
  },

  saveProfile() {
    wx.request({
      url: 'http://localhost:3000/api/user/profile',
      method: 'PUT',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: this.data.userInfo,
      success: (res) => {
        if (res.data.success) {
          wx.setStorageSync('userInfo', this.data.userInfo)
          wx.showToast({ title: '保存成功' })
          setTimeout(() => wx.navigateBack(), 1000)
        }
      },
      fail: () => {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  }
})
