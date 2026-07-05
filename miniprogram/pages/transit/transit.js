const api = require('../../utils/request')

Page({
  data: {
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    },
    stations: [],
    lineKeyword: '',
    lineList: []
  },

  onLoad() {
    this.getLocation()
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          'location.latitude': res.latitude,
          'location.longitude': res.longitude
        })
        this.reverseGeocoder(res.latitude, res.longitude)
        this.loadNearbyStations(res.latitude, res.longitude)
      },
      fail: () => {
        this.setData({
          'location.address': '定位失败，请授权位置权限'
        })
        wx.showToast({ title: '定位失败', icon: 'none' })
      }
    })
  },

  reverseGeocoder(lat, lng) {
    wx.request({
      url: `https://restapi.amap.com/v3/geocode/regeo`,
      data: {
        location: `${lng},${lat}`,
        key: '20f5edbe19f8b84bd22f0de4252e9573',
        output: 'json'
      },
      success: (res) => {
        if (res.data && res.data.regeocode) {
          this.setData({
            'location.address': res.data.regeocode.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          })
        } else {
          this.setData({ 'location.address': `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
        }
      },
      fail: () => {
        this.setData({ 'location.address': `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
      }
    })
  },

  loadNearbyStations(lat, lng) {
    api.get('/transit/nearby', { longitude: lng, latitude: lat, radius: 1000 }).then(res => {
      const src = res || []
      const stations = src.map(item => ({
        id: item.id,
        name: item.name,
        distance: item.distance || '',
        lines: item.lines || item.routes || []
      }))
      this.setData({ stations })
    }).catch(() => {
      wx.request({
        url: `https://restapi.amap.com/v3/place/around`,
        data: {
          location: `${lng},${lat}`,
          types: '150700',
          radius: 1000,
          key: '20f5edbe19f8b84bd22f0de4252e9573',
          output: 'json',
          offset: 20
        },
        success: (res) => {
          if (res.data && res.data.pois) {
            const stations = res.data.pois.map(item => ({
              id: item.id,
              name: item.name,
              distance: item.distance,
              lines: []
            }))
            this.setData({ stations })
          }
        }
      })
    })
  },

  onRefreshLocation() {
    wx.showLoading({ title: '获取位置...' })
    this.getLocation()
    wx.hideLoading()
  },

  onStationTap(e) {
    const id = e.currentTarget.dataset.id
    const station = this.data.stations.find(s => s.id === id)
    if (station) {
      wx.showToast({ title: `站点: ${station.name}`, icon: 'none' })
    }
  },

  onLineInput(e) {
    this.setData({ lineKeyword: e.detail.value })
  },

  onSearchLine() {
    const keyword = this.data.lineKeyword.trim()
    if (!keyword) return

    api.get('/transit/lines', { city: '成都', line_name: keyword }).then(res => {
      const src = res || []
      const lineList = src.map(item => ({
        id: item.id,
        name: item.name,
        stops: item.stops || item.stations || [],
        start_time: item.start_time || '',
        end_time: item.end_time || ''
      }))
      this.setData({ lineList })
    }).catch(() => {
      wx.showToast({ title: '暂无线路信息', icon: 'none' })
    })
  }
})
