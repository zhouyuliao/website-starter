const { legacyRoleNames, notifications, roleOptions } = require('../../utils/data')
const app = getApp()
Page({
  data: { profile: {}, roleName: '', roleOptions, stats: [{ label: '累计询价', value: '26', unit: '次' }, { label: '常用站点', value: '5', unit: '座' }, { label: '加入天数', value: '18', unit: '天' }], notifications, sheet: '', editName: '', editPhone: '', editRole: '', customRole: '', editAddress: '', editLocation: null, locationText: '', locating: false, errors: {} },
  onShow() {
    const session = app.globalData.session
    if (!session) { wx.reLaunch({ url: '/pages/register/index' }); return }
    const roleName = session.role || legacyRoleNames[session.identityId] || '报价人员'
    const isPresetRole = roleOptions.includes(roleName)
    this.setData({ profile: session.profile, roleName, editName: session.profile.name, editPhone: session.profile.phone, editRole: isPresetRole ? roleName : '自定义', customRole: isPresetRole ? '' : roleName, editAddress: session.profile.address || '', editLocation: session.profile.location || null, locationText: session.profile.location ? '已保存授权位置，可重新获取' : '', sheet: '' })
  },
  openSheet(event) { this.setData({ sheet: event.currentTarget.dataset.sheet, errors: {} }) },
  closeSheet() { this.setData({ sheet: '' }) },
  onInput(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value, errors: {} }) },
  chooseEditRole(event) { this.setData({ editRole: event.currentTarget.dataset.value, errors: {} }) },
  useLocation() {
    this.setData({ locating: true })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => this.setData({ editLocation: { latitude: res.latitude, longitude: res.longitude }, locationText: `已获取当前位置（${res.latitude.toFixed(5)}，${res.longitude.toFixed(5)}）`, errors: {} }),
      fail: () => wx.showToast({ title: '定位未授权，请自行填写位置', icon: 'none' }),
      complete: () => this.setData({ locating: false }),
    })
  },
  save() {
    const { editName, editPhone, editRole, customRole, editAddress, editLocation } = this.data
    const roleName = editRole === '自定义' ? customRole.trim() : editRole
    const errors = {}
    if (!editName.trim()) errors.name = '请输入联系人姓名'
    if (!/^1[3-9]\d{9}$/.test(editPhone)) errors.phone = '请输入正确的 11 位手机号码'
    if (!roleName) errors.role = '请选择或填写当前身份'
    if (!editAddress.trim() && !editLocation) errors.address = '请授权获取当前位置或自行填写位置'
    if (Object.keys(errors).length) { this.setData({ errors }); return }
    const session = app.globalData.session
    app.saveSession({ ...session, role: roleName, profile: { name: editName.trim(), phone: editPhone, address: editAddress.trim(), location: editLocation } })
    this.setData({ profile: app.globalData.session.profile, roleName, sheet: '' })
    wx.showToast({ title: '资料已更新', icon: 'success' })
  },
  resetProfile() { app.clearSession(); wx.reLaunch({ url: '/pages/register/index' }) },
  logout() { wx.showModal({ title: '退出登录', content: '退出后将清除本机保存的演示资料。', success: (res) => { if (res.confirm) { app.clearSession(); wx.reLaunch({ url: '/pages/register/index' }) } } }) },
  goQuotes() { wx.switchTab({ url: '/pages/quotes/index' }) },
  showComingSoon(event) { wx.showToast({ title: `${event.currentTarget.dataset.label}将在接入后开放`, icon: 'none' }) },
})
