const api = require('../../utils/request')

Page({
  data: {
    categories: [],
    currentCategory: '',
    phoneList: [],
    keyword: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadCategories()
    this.loadPhoneList()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({ loadingMore: true })
      this.loadPhoneList(true)
    }
  },

  loadCategories() {
    api.get('/phone-categories').then(res => {
      const cats = res.items || res || []
      this.setData({
        categories: cats.map(c => ({ id: c.id, name: c.name }))
      })
    }).catch(() => {})
  },

  loadPhoneList(append = false) {
    const { page, pageSize, currentCategory, keyword } = this.data
    const params = { page, page_size: pageSize }
    if (currentCategory) params.category_id = currentCategory
    if (keyword) params.keyword = keyword

    return api.get('/phone-entries', params).then(res => {
      const items = res.items || res || []
      const list = items.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone || '',
        remark: item.description || ''
      }))

      const phoneList = append ? this.data.phoneList.concat(list) : list
      this.setData({
        phoneList,
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
      phoneList: []
    })
    this.loadPhoneList()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.setData({ page: 1, hasMore: true, phoneList: [] })
    this.loadPhoneList()
  },

  onClearSearch() {
    this.setData({ keyword: '', page: 1, hasMore: true, phoneList: [] })
    this.loadPhoneList()
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  }
})
