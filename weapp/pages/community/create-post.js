Page({
  data: {
    title: '',
    content: '',
    tagList: ['找合伙人', '招聘', '求资源', '分享', '求助'],
    selectedTags: []
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  selectTag(e) {
    const tag = e.currentTarget.dataset.tag
    const selected = this.data.selectedTags
    if (selected.includes(tag)) {
      this.setData({ selectedTags: selected.filter(t => t !== tag) })
    } else {
      this.setData({ selectedTags: [...selected, tag] })
    }
  },

  submitPost() {
    if (!this.data.title || !this.data.content) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    wx.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
