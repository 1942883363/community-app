const api = require('../../utils/request')
const { resolveImage } = api

Page({
  data: {
    user: {
      id: 0,
      nickname: '',
      phone: '',
      avatar: ''
    },
    isRegistered: false,
    showEdit: false,
    editForm: {
      nickname: '',
      phone: ''
    },
    editAvatarUrl: '',
    activeTab: 'liked',
    likedList: [],
    registeredList: [],
    feedbackList: []
  },

  onLoad() {
    this.checkRegistration()
  },

  onShow() {
    if (wx.getStorageSync('need_refresh_mine')) {
      wx.removeStorageSync('need_refresh_mine')
      this.checkRegistration()
      return
    }
    if (this._needRefresh) {
      this._needRefresh = false
      this.checkRegistration()
    } else if (this._isRegistered) {
      this.loadRecords()
    }
  },

  checkRegistration() {
    api.get('/users/me').then(res => {
      const isRegistered = res.is_registered
      this._isRegistered = isRegistered
      this.setData({
        user: { ...res, avatar: resolveImage(res.avatar || '') },
        isRegistered
      })
      if (!isRegistered) {
        const skipped = wx.getStorageSync('login_skip')
        if (!skipped) {
          this._needRefresh = true
          wx.redirectTo({ url: '/pages/login/login' })
          return
        }
      }
      this.loadRecords()
    }).catch(() => {
      wx.showToast({ title: '连接服务器失败', icon: 'none' })
    })
  },

  loadRecords() {
    this.loadLiked()
    this.loadRegistered()
    this.loadFeedback()
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  loadLiked() {
    api.get('/news/my-likes').then(res => {
      const list = (res || []).map(item => ({
        id: item.id,
        title: item.title
      }))
      this.setData({ likedList: list })
    }).catch(() => {
      this.setData({ likedList: [] })
    })
  },

  loadRegistered() {
    api.get('/events/my').then(res => {
      const list = (res || []).map(item => ({
        id: item.id,
        title: item.title || `活动 #${item.id}`,
        time: item.created_at || ''
      }))
      this.setData({ registeredList: list })
    }).catch(() => {
      this.setData({ registeredList: [] })
    })
  },

  loadFeedback() {
    api.get('/feedback/my').then(res => {
      const list = (res || []).map(item => ({
        id: item.id,
        content: item.content,
        status: item.status,
        created_at: item.created_at || ''
      }))
      this.setData({ feedbackList: list })
    }).catch(() => {
      this.setData({ feedbackList: [] })
    })
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({ editAvatarUrl: avatarUrl })
  },

  onNicknameInput(e) {
    this.setData({ 'editForm.nickname': e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ 'editForm.phone': e.detail.value })
  },

  onShowEdit() {
    const { user } = this.data
    this.setData({
      showEdit: true,
      editAvatarUrl: '',
      editForm: {
        nickname: user.nickname || '',
        phone: user.phone || ''
      }
    })
  },

  onCancelEdit() {
    this.setData({ showEdit: false })
  },

  onSaveProfile() {
    const { editForm, editAvatarUrl } = this.data

    const saveData = (avatarParam) => {
      const payload = {
        nickname: editForm.nickname.trim(),
        phone: editForm.phone.trim()
      }
      if (avatarParam !== undefined) {
        payload.avatar = avatarParam
      }
      api.put('/users/me', payload).then(res => {
        this.setData({
          user: { ...res, avatar: resolveImage(res.avatar || '') },
          showEdit: false,
          editAvatarUrl: '',
          isRegistered: res.is_registered
        })
        wx.showToast({ title: '保存成功', icon: 'success' })
      }).catch(() => {
        wx.showToast({ title: '保存失败', icon: 'none' })
      })
    }

    if (editAvatarUrl && editAvatarUrl.startsWith('http://tmp/')) {
      wx.uploadFile({
        url: api.BASE_URL + '/upload/public',
        filePath: editAvatarUrl,
        name: 'file',
        header: {
          'X-User-Id': api.getUserId()
        },
        success: (res) => {
          try {
            const d = JSON.parse(res.data)
            saveData(d.code === 200 ? d.data.url : '')
          } catch (e) {
            saveData(undefined)
          }
        },
        fail: (err) => {
          console.error('头像上传失败', err)
          wx.showToast({ title: '头像上传失败', icon: 'none' })
        }
      })
      return
    }

    saveData(undefined)
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后可使用其他账号登录，确定退出？',
      success: (res) => {
        if (res.confirm) {
          api.post('/users/logout').then(() => {
            wx.removeStorageSync('login_skip')
            this._needRefresh = true
            wx.redirectTo({ url: '/pages/login/login' })
          }).catch(() => {
            wx.showToast({ title: '退出失败', icon: 'none' })
          })
        }
      }
    })
  },

  onLikedNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/news-detail/news-detail?id=${id}` })
  },

  onGoFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  },

  onGoRegister() {
    wx.removeStorageSync('login_skip')
    wx.redirectTo({ url: '/pages/login/login' })
  }
})
