const api = require('../../utils/request')

Page({
  data: {
    categories: [],
    currentCategory: '',
    newsList: [],
    keyword: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadCategories()
    this.loadNews()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadNews().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({ loadingMore: true })
      this.loadNews(true)
    }
  },

  loadCategories() {
    api.get('/news/categories').then(res => {
      const cats = res.list || res || []
      this.setData({
        categories: cats.map(c => ({ id: c.ID || c.id, name: c.name }))
      })
    }).catch(() => {})
  },

  loadNews(append = false) {
    const { page, pageSize, currentCategory, keyword } = this.data
    const params = { page, pageSize }
    if (currentCategory) params.category_id = currentCategory
    if (keyword) params.keyword = keyword

    return api.get('/news', params).then(res => {
      const list = (res.list || (res.data && res.data.list) || res || []).map(item => ({
        id: item.ID || item.id,
        title: item.title,
        summary: item.summary || '',
        cover: item.cover_image || item.cover || '',
        views: item.view_count || item.views || 0,
        likes: item.like_count || item.likes || 0,
        created_at: this.formatTime(item.created_at || item.publish_time)
      }))

      const newsList = append ? this.data.newsList.concat(list) : list
      this.setData({
        newsList,
        loadingMore: false,
        hasMore: list.length >= pageSize
      })
    }).catch(() => {
      this.setData({ loadingMore: false })
    })
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      page: 1,
      hasMore: true,
      newsList: []
    })
    this.loadNews()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.setData({ page: 1, hasMore: true, newsList: [] })
    this.loadNews()
  },

  onClearSearch() {
    this.setData({ keyword: '', page: 1, hasMore: true, newsList: [] })
    this.loadNews()
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/news-detail/news-detail?id=${id}` })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
})
