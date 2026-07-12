const api = require('../../utils/request')
const { resolveImage } = api

Page({
  data: {
    categories: [],
    currentCategory: '',
    businessList: [],
    keyword: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadCategories()
    this.loadBusinessList()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({ loadingMore: true })
      this.loadBusinessList(true)
    }
  },

  loadCategories() {
    api.get('/business-categories').then(res => {
      const cats = res.items || res || []
      this.setData({
        categories: cats.map(c => ({ id: c.id, name: c.name }))
      })
    }).catch(() => {})
  },

  loadBusinessList(append = false) {
    const { page, pageSize, currentCategory, keyword } = this.data
    const params = { page, page_size: pageSize }
    if (currentCategory) params.category_id = currentCategory
    if (keyword) params.keyword = keyword

    return api.get('/businesses', params).then(res => {
      const items = res.items || res || []
      const list = items.map(item => ({
        id: item.id,
        name: item.name,
        image: resolveImage(item.logo || ''),
        address: item.address || '',
        phone: item.phone || '',
        description: item.description || ''
      }))

      const businessList = append ? this.data.businessList.concat(list) : list
      this.setData({
        businessList,
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
      businessList: []
    })
    this.loadBusinessList()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.setData({ page: 1, hasMore: true, businessList: [] })
    this.loadBusinessList()
  },

  onClearSearch() {
    this.setData({ keyword: '', page: 1, hasMore: true, businessList: [] })
    this.loadBusinessList()
  },

  onBusinessTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/business-detail/business-detail?id=${id}` })
  }
})
