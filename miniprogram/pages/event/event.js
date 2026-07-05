const api = require('../../utils/request')

Page({
  data: {
    eventList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadEvents()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadEvents().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({ loadingMore: true })
      this.loadEvents(true)
    }
  },

  loadEvents(append = false) {
    const { page, pageSize } = this.data

    return api.get('/events', { page, pageSize }).then(res => {
      const list = (res.list || (res.data && res.data.list) || res || []).map(item => ({
        id: item.ID || item.id,
        title: item.title,
        cover: item.cover_image || item.cover || '',
        start_time: this.formatTime(item.start_time || item.start_date),
        location: item.location || item.address || '',
        max_participants: item.max_participants || item.max_people || 0,
        current_participants: item.current_participants || item.registered_count || 0,
        status: item.status || 'open'
      }))

      const eventList = append ? this.data.eventList.concat(list) : list
      this.setData({
        eventList,
        loadingMore: false,
        hasMore: list.length >= pageSize
      })
    }).catch(() => {
      this.setData({ loadingMore: false })
    })
  },

  onEventTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/event-detail/event-detail?id=${id}` })
  },

  getStatusText(item) {
    if (item.status === 'closed') return { text: '已结束', cls: 'status-closed' }
    if (item.max_participants > 0 && item.current_participants >= item.max_participants) {
      return { text: '已满额', cls: 'status-full' }
    }
    return { text: '报名中', cls: 'status-open' }
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
