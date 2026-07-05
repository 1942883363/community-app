App({
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 0
  }
})
