const api = require('../../utils/request')

Page({
  data: {
    eventId: '',
    event: {},
    showForm: false,
    formName: '',
    formPhone: '',
    registered: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ eventId: options.id })
      this.loadDetail(options.id)
      this.checkRegistration(options.id)
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.event.title || '社区活动',
      path: `/pages/event-detail/event-detail?id=${this.data.eventId}`
    }
  },

  loadDetail(id) {
    api.get(`/events/${id}`).then(res => {
      const event = {
        id: res.id,
        title: res.title,
        content: res.content || '',
        cover: res.cover_image || '',
        start_time: this.formatTime(res.event_date || res.start_time),
        end_time: this.formatTime(res.end_time),
        location: res.address || '',
        max_participants: res.max_participants || 0,
        enrolled_count: res.enrolled_count || 0,
        status: res.status,
        organizer: res.organizer || ''
      }

      this.setData({ event })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  checkRegistration(id) {
    api.get(`/events/my`).then(res => {
      const events = res || []
      if (events.some(e => e.id == id)) {
        this.setData({ registered: true })
      }
    }).catch(() => {})
  },

  onRegister() {
    const { event } = this.data
    if (event.status === 3 || event.status === 'closed') {
      wx.showToast({ title: '活动已结束', icon: 'none' })
      return
    }
    if (event.max_participants > 0 && event.enrolled_count >= event.max_participants) {
      wx.showToast({ title: '名额已满', icon: 'none' })
      return
    }
    if (this.data.registered) {
      wx.showToast({ title: '您已报名', icon: 'none' })
      return
    }
    this.setData({ showForm: true })
  },

  onCloseForm() {
    this.setData({ showForm: false })
  },

  onNameInput(e) {
    this.setData({ formName: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ formPhone: e.detail.value })
  },

  onSubmitRegistration() {
    const { formName, formPhone, eventId } = this.data

    if (!formName.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!formPhone.trim() || !/^1\d{10}$/.test(formPhone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    api.post(`/events/${eventId}/register`, {
      user_name: formName.trim(),
      user_phone: formPhone.trim()
    }).then(() => {
      wx.showToast({ title: '报名成功', icon: 'success' })
      this.setData({
        showForm: false,
        registered: true,
        formName: '',
        formPhone: '',
        'event.enrolled_count': (this.data.event.enrolled_count || 0) + 1
      })
    }).catch(() => {
      wx.showToast({ title: '报名失败，请重试', icon: 'none' })
    })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
  }
})
