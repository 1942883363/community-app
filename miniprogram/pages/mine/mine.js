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

    api.get('/news', { page: 1, page_size: 100 }).then(res => {
      const allNews = res.items || res || []
      const liked = allNews
        .filter(item => likedIds.indexOf(Number(item.id)) !== -1)
        .map(item => ({
          id: item.id,
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

  onLikedNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/news-detail/news-detail?id=${id}` })
  },

  onGoFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  }
})
