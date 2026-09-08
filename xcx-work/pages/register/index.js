const { roleOptions } = require('../../utils/data')
const app = getApp()

Page({
  data: {
    roleOptions,
    role: '',
    customRole: '',
    name: '',
    phone: '',
    address: '',
    location: null,
    locationText: '',
    locating: false,
    errors: {},
  },
  onShow() {
    if (app.globalData.session) {
      wx.switchTab({ url: '/pages/home/index' })
    }
  },
  onInput(event) {
    this.setData({ [event.currentTarget.dataset.field]: event.detail.value, errors: {} })
  },
  chooseRole(event) {
    this.setData({ role: event.currentTarget.dataset.value, errors: {} })
  },
  useLocation() {
    this.setData({ locating: true })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = { latitude: res.latitude, longitude: res.longitude }
        this.setData({
          location,
          locationText: `已获取当前位置（${res.latitude.toFixed(5)}，${res.longitude.toFixed(5)}）`,
          errors: {},
        })
      },
      fail: () => wx.showToast({ title: '定位未授权，请自行填写位置', icon: 'none' }),
      complete: () => this.setData({ locating: false }),
    })
  },
  submit() {
    const { name, phone, role, customRole, address, location } = this.data
    const roleName = role === '自定义' ? customRole.trim() : role
    const errors = {}
    if (!name.trim()) errors.name = '请输入联系人姓名'
    if (!/^1[3-9]\d{9}$/.test(phone)) errors.phone = '请输入正确的 11 位手机号码'
    if (!roleName) errors.role = '请选择或填写当前身份'
    if (!address.trim() && !location) errors.address = '请授权获取当前位置或自行填写位置'
    if (Object.keys(errors).length) { this.setData({ errors }); return }
    app.saveSession({
      role: roleName,
      profile: { name: name.trim(), phone, address: address.trim(), location },
    })
    wx.showToast({ title: '注册完成', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 500)
  },
})
