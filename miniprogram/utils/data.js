const identities = [
  { id: 'dealer', name: '经销商', en: 'DEALER', desc: '获取批发指导价与货源对接', icon: '货' },
  { id: 'agent', name: '代理', en: 'AGENT', desc: '掌握区域价盘、返点与政策动向', icon: '协' },
  { id: 'supplier', name: '供应商', en: 'SUPPLIER', desc: '高效对接搅拌站采购需求', icon: '供' },
]

const presetAddresses = [
  '郑州市经开区第八大街搅拌站',
  '郑州市高新区科学大道商砼站',
  '中牟县官渡工业园搅拌站',
]

const stations = [
  { id: 's1', name: '豫砼商砼站', distance: 1.8, latitude: 34.7602, longitude: 113.6398, c30: 385, status: '产能充足', address: '经开区第八大街与经北三路交叉口' },
  { id: 's2', name: '恒基搅拌站', distance: 2.4, latitude: 34.7415, longitude: 113.6582, c30: 382, status: '产能充足', address: '高新区科学大道 128 号' },
  { id: 's3', name: '黄河商砼中心', distance: 3.1, latitude: 34.7638, longitude: 113.6605, c30: 390, status: '供应紧张', address: '金水区龙湖中环北路' },
  { id: 's4', name: '中建砼业站', distance: 4.6, latitude: 34.7351, longitude: 113.6312, c30: 378, status: '产能充足', address: '二七区鼎盛大道西段' },
  { id: 's5', name: '绿源环保搅拌站', distance: 5.2, latitude: 34.7489, longitude: 113.6761, c30: 375, status: '产能充足', address: '中牟县官渡工业园东区' },
]

const quotes = [
  { id: 'q1', grade: 'C30', station: '豫砼商砼站', price: 388, change: 3, time: '今天 10:24', daysAgo: 0, history: [{t:'09-02',p:379},{t:'09-04',p:382},{t:'09-05',p:385},{t:'09-07',p:385},{t:'今天',p:388}] },
  { id: 'q2', grade: 'C25', station: '恒基搅拌站', price: 362, change: -2, time: '昨天 16:40', daysAgo: 1, history: [{t:'09-01',p:368},{t:'09-03',p:366},{t:'09-05',p:364},{t:'09-06',p:364},{t:'昨天',p:362}] },
  { id: 'q3', grade: 'C35', station: '黄河商砼中心', price: 415, change: 5, time: '09-03 09:15', daysAgo: 5, history: [{t:'08-28',p:402},{t:'08-30',p:405},{t:'09-01',p:408},{t:'09-02',p:410},{t:'09-03',p:415}] },
  { id: 'q4', grade: 'C40', station: '豫砼商砼站', price: 448, change: 8, time: '09-02 11:20', daysAgo: 6, history: [{t:'08-26',p:432},{t:'08-29',p:436},{t:'08-31',p:440},{t:'09-01',p:442},{t:'09-02',p:448}] },
  { id: 'q5', grade: 'C30', station: '中建砼业站', price: 382, change: 0, time: '09-01 14:30', daysAgo: 7, history: [{t:'08-25',p:378},{t:'08-27',p:380},{t:'08-29',p:382},{t:'08-31',p:382},{t:'09-01',p:382}] },
  { id: 'q6', grade: 'C20', station: '绿源环保搅拌站', price: 338, change: -3, time: '08-28 10:05', daysAgo: 11, history: [{t:'08-21',p:345},{t:'08-23',p:343},{t:'08-25',p:341},{t:'08-27',p:341},{t:'08-28',p:338}] },
]

const notifications = [
  { id: 'n1', type: '报价提醒', title: '豫砼商砼站 C30 上调至 ¥388/方', desc: '受水泥价格上涨影响，C30 报价上调 3 元/方。', time: '今天 10:24' },
  { id: 'n2', type: '系统通知', title: '8 月报价月报已生成', desc: '您关注的 5 个搅拌站月度报价报告已生成。', time: '昨天 18:00' },
  { id: 'n3', type: '活动通知', title: '备货季泵送费减免', desc: '9 月 10 日前下单，部分站点泵送费立减 5 元/方。', time: '09-05 09:00' },
]

module.exports = { identities, presetAddresses, stations, quotes, notifications }
