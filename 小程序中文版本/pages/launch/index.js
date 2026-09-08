const { identities } = require('../../utils/data')
const app = getApp()

Page({
  data: { identities, selected: '' },
  onShow() {
    if (app.globalData.session) wx.switchTab({ url: '/pages/home/index' })
  },
  selectIdentity(event) { this.setData({ selected: event.currentTarget.dataset.id }) },
  next() {
    if (!this.data.selected) {
      wx.showToast({ title: '请先选择身份', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/register/index?identity=${this.data.selected}` })
  },
})
