const { quotes } = require('../../utils/data')
Page({
  data: { filter: 'all', quotes, active: null, quantity: '10', note: '', submitted: false },
  onShow() { this.filterQuotes(this.data.filter) },
  filterQuotes(filter) { this.setData({ filter, quotes: quotes.filter((item) => filter === 'week' ? item.daysAgo <= 7 : filter === 'month' ? item.daysAgo <= 30 : true) }) },
  selectFilter(event) { this.filterQuotes(event.currentTarget.dataset.filter) },
  openDetail(event) { this.setData({ active: quotes.find((item) => item.id === event.currentTarget.dataset.id), submitted: false, quantity: '10', note: '' }) },
  closeDetail() { this.setData({ active: null }) },
  onInput(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value }) },
  submit() { const amount = Number(this.data.quantity); if (!amount || amount <= 0) { wx.showToast({ title: '请输入大于 0 的预计用量', icon: 'none' }); return } this.setData({ submitted: true }); wx.showToast({ title: '询价需求已记录', icon: 'success' }) },
})
