const api = require('../../utils/request')

Page({
  data: {
    banners: [
      { id: 1, title: '社区便民资讯平台', color: '#1677ff', icon: '🏠' },
      { id: 2, title: '最新活动等你参加', color: '#52c41a', icon: '🎉' },
      { id: 3, title: '周边商家优惠多多', color: '#fa8c16', icon: '🛒' }
    ],
    services: [
      { id: 1, name: '便民电话簿', icon: '📞', color: '#1677ff', path: '/pages/phone/phone' },
      { id: 2, name: '社区活动', icon: '🎯', color: '#52c41a', path: '/pages/event/event' },
      { id: 3, name: '周边商家', icon: '🏪', color: '#fa8c16', path: '/pages/business/business' },
      { id: 4, name: '公交查询', icon: '🚌', color: '#722ed1', path: '/pages/transit/transit' },
      { id: 5, name: '意见反馈', icon: '💬', color: '#eb2f96', path: '/pages/feedback/feedback' }
    ],
    newsList: [],
    loading: true
  },

  onLoad() {
    this.loadNews()
  },

  onShow() {
    if (!this.data.loading) {
      this.loadNews()
    }
  },

  onPullDownRefresh() {
    this.loadNews().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadNews() {
    const limit = 5
    return api.get('/news', { page: 1, pageSize: limit })
      .then(res => {
        const list = (res.list || (res.data && res.data.list) || res || []).slice(0, 5)
        const newsList = list.map(item => ({
          id: item.ID || item.id,
          title: item.title,
          summary: item.summary || '',
          cover: item.cover_image || item.cover || '',
          views: item.view_count || item.views || 0,
          likes: item.like_count || item.likes || 0,
          created_at: item.created_at || item.publish_time || ''
        }))
        this.setData({ newsList, loading: false })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  onServiceTap(e) {
    const path = e.currentTarget.dataset.path
    if (path) {
      wx.navigateTo({ url: path })
    }
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/news-detail/news-detail?id=${id}` })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }
})
