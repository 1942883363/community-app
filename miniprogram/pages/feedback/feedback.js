const api = require('../../utils/request')

Page({
  data: {
    content: '',
    contact: '',
    images: []
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value })
  },

  onChooseImage() {
    const remain = 3 - this.data.images.length
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPaths = res.tempFilePaths
        const uploadPromises = tempPaths.map(filePath => {
          return api.upload('/feedback/upload', filePath)
            .then(url => url)
            .catch(() => filePath)
        })

        Promise.all(uploadPromises).then(urls => {
          this.setData({
            images: this.data.images.concat(urls)
          })
        })
      }
    })
  },

  onRemoveImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images })
  },

  onSubmit() {
    const { content, contact, images } = this.data

    if (!content.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })

    api.post('/feedback', {
      content: content.trim(),
      contact: contact.trim(),
      images: images
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '反馈成功，感谢您的建议', icon: 'success' })
      this.setData({
        content: '',
        contact: '',
        images: []
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
    })
  }
})
