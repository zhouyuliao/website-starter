App({
  globalData: {
    session: null,
  },
  onLaunch() {
    this.globalData.session = wx.getStorageSync('concrete-profile') || null
  },
  saveSession(session) {
    this.globalData.session = session
    wx.setStorageSync('concrete-profile', session)
  },
  clearSession() {
    this.globalData.session = null
    wx.removeStorageSync('concrete-profile')
  },
})
