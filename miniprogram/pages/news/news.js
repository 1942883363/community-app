const api = require('../../utils/request')
const { resolveImage } = api

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
    api.get('/categories').then(res => {
      const cats = res || []
      this.setData({
        categories: cats.map(c => ({ id: c.id, name: c.name }))
      })
    }).catch(() => {})
  },

  loadNews(append = false) {
    const { page, pageSize, currentCategory, keyword } = this.data
    const params = { page, page_size: pageSize }
    if (currentCategory) params.category_id = currentCategory
    if (keyword) params.keyword = keyword

    return api.get('/news', params).then(res => {
      const items = res.items || res || []
      const list = items.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary || '',
        cover: resolveImage(item.cover_image || ''),
        views: item.view_count || 0,
        likes: item.like_count || 0,
        created_at: this.formatTime(item.created_at)
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
