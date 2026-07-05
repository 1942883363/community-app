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
    api.get(`/businesses/${id}`).then(res => {
      const business = {
        id: res.id,
        name: res.name,
        address: res.address || '',
        phone: res.phone || '',
        description: res.description || '',
        business_hours: res.business_hours || '',
        logo: res.logo || ''
      }
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
