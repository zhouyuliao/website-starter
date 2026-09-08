const { legacyRoleNames, stations } = require('../../utils/data')
const app = getApp()
Page({
  data: { profile: {}, roleName: '', stations, latitude: 34.7527, longitude: 113.6471, markers: [], locating: false },
  onShow() {
    const session = app.globalData.session
    if (!session) { wx.reLaunch({ url: '/pages/register/index' }); return }
    const markers = stations.map((item, index) => ({ id: index, latitude: item.latitude, longitude: item.longitude, title: item.name, callout: { content: item.name, color: '#1b1917', bgColor: '#ffffff', padding: 6, borderRadius: 2, display: 'BYCLICK' } }))
    const roleName = session.role || legacyRoleNames[session.identityId] || '报价人员'
    const location = session.profile.location
    this.setData({ profile: session.profile, roleName, latitude: location ? location.latitude : 34.7527, longitude: location ? location.longitude : 113.6471, markers })
  },
  goQuotes() { wx.switchTab({ url: '/pages/quotes/index' }) },
  locate() {
    this.setData({ locating: true })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => { this.setData({ latitude: res.latitude, longitude: res.longitude }); wx.showToast({ title: '定位成功，已更新中心点', icon: 'success' }) },
      fail: () => wx.showToast({ title: '定位未授权，继续使用资料地址', icon: 'none' }),
      complete: () => this.setData({ locating: false }),
    })
  },
  navigate(event) {
    const station = stations.find((item) => item.id === event.currentTarget.dataset.id)
    if (!station) return
    wx.openLocation({ latitude: station.latitude, longitude: station.longitude, scale: 15, name: station.name, address: station.address })
  },
})
