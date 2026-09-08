const { identities, presetAddresses } = require('../../utils/data')
const app = getApp()
Page({
  data: { identities, presetAddresses, identity: null, name: '', phone: '', addressKey: '', customAddress: '', errors: {} },
  onLoad(options) { this.setData({ identity: identities.find((item) => item.id === options.identity) || identities[0] }) },
  onInput(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value, errors: {} }) },
  chooseAddress(event) { this.setData({ addressKey: event.currentTarget.dataset.value, errors: {} }) },
  submit() {
    const { name, phone, addressKey, customAddress, identity } = this.data
    const address = addressKey === 'custom' ? customAddress.trim() : addressKey
    const errors = {}
    if (!name.trim()) errors.name = '请输入联系人姓名'
    if (!/^1[3-9]\d{9}$/.test(phone)) errors.phone = '请输入正确的 11 位手机号码'
    if (!address) errors.address = '请选择或填写搅拌站地址'
    if (Object.keys(errors).length) { this.setData({ errors }); return }
    app.saveSession({ identityId: identity.id, profile: { name: name.trim(), phone, address } })
    wx.showToast({ title: '注册完成', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 500)
  },
})
