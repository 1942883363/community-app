const api = require('../../utils/request')

Page({
  data: {
    businessId: '',
    business: {},
    images: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ businessId: options.id })
      this.loadDetail(options.id)
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.business.name || '周边商家',
      path: `/pages/business-detail/business-detail?id=${this.data.businessId}`
    }
  },

  loadDetail(id) {
    api.get(`/business/${id}`).then(res => {
      const item = res.data || res
      const business = {
        id: item.ID || item.id,
        name: item.name,
        address: item.address || item.location || '',
        phone: item.phone || '',
        description: item.description || item.intro || '',
        business_hours: item.business_hours || item.working_hours || '',
        latitude: item.latitude || item.lat || 0,
        longitude: item.longitude || item.lng || 0,
        images: item.images || item.photos || []
      }

      let images = []
      if (item.cover_image || item.image || item.cover) {
        images.push(item.cover_image || item.image || item.cover)
      }
      if (business.images && business.images.length > 0) {
        images = images.concat(business.images)
      }

      this.setData({ business, images })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onCall() {
    const phone = this.data.business.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    } else {
      wx.showToast({ title: '暂无联系电话', icon: 'none' })
    }
  },

  onOpenLocation() {
    const { business } = this.data
    if (business.latitude && business.longitude) {
      wx.openLocation({
        latitude: business.latitude,
        longitude: business.longitude,
        name: business.name,
        address: business.address,
        scale: 16
      })
    } else if (business.address) {
      wx.showToast({ title: '暂无坐标信息', icon: 'none' })
    } else {
      wx.showToast({ title: '暂无位置信息', icon: 'none' })
    }
  }
})
