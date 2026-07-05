const api = require('../../utils/request')

Page({
  data: {
    userId: '',
    activeTab: 'liked',
    likedList: [],
    registeredList: [],
    feedbackList: []
  },

  onLoad() {
    const userId = api.getUserId()
    this.setData({ userId: userId.replace('mp_', '').substring(0, 12) })
  },

  onShow() {
    this.loadRecords()
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
    const likedIds = wx.getStorageSync('liked_news_ids') || []
    if (likedIds.length === 0) {
      this.setData({ likedList: [] })
      return
    }

    api.get('/news', { page: 1, pageSize: 100 }).then(res => {
      const allNews = (res.list || (res.data && res.data.list) || res || [])
      const liked = allNews
        .filter(item => likedIds.indexOf(Number(item.ID || item.id)) !== -1)
        .map(item => ({
          id: item.ID || item.id,
          title: item.title
        }))
      this.setData({ likedList: liked })
    }).catch(() => {
      const list = likedIds.map(id => ({ id, title: `资讯 #${id}` }))
      this.setData({ likedList: list })
    })
  },

  loadRegistered() {
    api.get('/events/my').then(res => {
      const list = (res.list || (res.data && res.data.list) || res || []).map(item => ({
        id: item.ID || item.id,
        title: item.title || item.event_title || `活动 #${item.event_id || item.id}`,
        time: item.created_at || item.register_time || ''
      }))
      this.setData({ registeredList: list })
    }).catch(() => {
      this.setData({ registeredList: [] })
    })
  },

  loadFeedback() {
    api.get('/feedback/my').then(res => {
      const list = (res.list || (res.data && res.data.list) || res || []).map(item => ({
        id: item.ID || item.id,
        content: item.content,
        status: item.status || 'pending',
        created_at: item.created_at || ''
      }))
      this.setData({ feedbackList: list })
    }).catch(() => {
      this.setData({ feedbackList: [] })
    })
  },

  onLikedNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/news-detail/news-detail?id=${id}` })
  },

  onGoFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  }
})
