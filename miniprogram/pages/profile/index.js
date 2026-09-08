const { identities, notifications, presetAddresses } = require('../../utils/data')
const app = getApp()
Page({
  data: { profile: {}, identity: {}, stats: [{ label: '累计询价', value: '26', unit: '次' }, { label: '常用站点', value: '5', unit: '座' }, { label: '加入天数', value: '18', unit: '天' }], notifications, sheet: '', editName: '', editPhone: '', editAddress: '', presetAddresses, errors: {} },
  onShow() {
    const session = app.globalData.session
    if (!session) { wx.reLaunch({ url: '/pages/launch/index' }); return }
    this.setData({ profile: session.profile, identity: identities.find((item) => item.id === session.identityId) || identities[0], editName: session.profile.name, editPhone: session.profile.phone, editAddress: session.profile.address, sheet: '' })
  },
  openSheet(event) { this.setData({ sheet: event.currentTarget.dataset.sheet, errors: {} }) },
  closeSheet() { this.setData({ sheet: '' }) },
  onInput(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value, errors: {} }) },
  chooseAddress(event) { this.setData({ editAddress: event.currentTarget.dataset.value, errors: {} }) },
  save() {
    const { editName, editPhone, editAddress } = this.data
    const errors = {}
    if (!editName.trim()) errors.name = '请输入联系人姓名'
    if (!/^1[3-9]\d{9}$/.test(editPhone)) errors.phone = '请输入正确的 11 位手机号码'
    if (!editAddress.trim()) errors.address = '请选择或填写搅拌站地址'
    if (Object.keys(errors).length) { this.setData({ errors }); return }
    const session = app.globalData.session
    app.saveSession({ ...session, profile: { name: editName.trim(), phone: editPhone, address: editAddress.trim() } })
    this.setData({ profile: app.globalData.session.profile, sheet: '' })
    wx.showToast({ title: '资料已更新', icon: 'success' })
  },
  switchIdentity() { app.clearSession(); wx.reLaunch({ url: '/pages/launch/index' }) },
  logout() { wx.showModal({ title: '退出登录', content: '退出后将清除本机保存的演示资料。', success: (res) => { if (res.confirm) { app.clearSession(); wx.reLaunch({ url: '/pages/launch/index' }) } } }) },
  goQuotes() { wx.switchTab({ url: '/pages/quotes/index' }) },
  showComingSoon(event) { wx.showToast({ title: `${event.currentTarget.dataset.label}将在接入后开放`, icon: 'none' }) },
})
