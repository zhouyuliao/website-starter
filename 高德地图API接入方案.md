# 搅拌站报价助手：高德地图 API 接入方案

更新时间：2026-09-08

## 1. 结论

当前可运行的小程序目标工程按 `xcx-work` 评估。它是原生微信小程序，不依赖 npm，已经使用微信原生 `<map>`、`wx.getLocation` 和 `wx.openLocation`，坐标类型也是 `gcj02`。因此不需要为了“显示一张地图”替换现有地图组件。

推荐的生产架构是：

1. 微信 `<map>` 继续负责交互地图、标记点和路线折线展示。
2. 自有后端保存站点、报价、产能和询价等业务数据。
3. 高德 Web 服务 API 由后端统一调用，负责地址解析、真实驾车距离、预计耗时和路线规划。
4. `amap-wx.js` 仅用于需要即时地址提示、逆地理编码或静态图的轻量前端体验；它不是高德交互式底图 SDK。
5. 申请两个相互隔离的 Key：一个“微信小程序”Key 给 `amap-wx.js`，一个“Web 服务 API”Key 给后端。后端 Key 和数字签名私钥绝不下发到小程序。

第一期应先解决当前最明显的问题：定位后地址仍不更新、手填地址没有坐标、附近站点距离写死、站点没有按用户位置排序。货车路径规划很贴合混凝土配送，但属于后续企业能力，不建议阻塞第一期。

## 2. 当前架构与问题

### 2.1 当前工程

- 技术：微信原生 WXML / WXSS / JavaScript。
- 页面：注册、首页、报价、我的，共四个实际入口页面。
- 地图：首页已经使用微信 `<map>` 展示 5 个站点 marker。
- 定位：注册、首页和资料编辑均调用 `wx.getLocation({ type: 'gcj02' })`。
- 导航：调用 `wx.openLocation` 打开微信地图。
- 数据：站点、报价和消息全部来自 `utils/data.js` 静态数组。
- 会话：用户资料只保存到 `wx.setStorageSync('concrete-profile')`。
- 后端：当前仓库没有业务 API、数据库、登录态或服务端配置。

### 2.2 现有地图逻辑的缺口

1. `stations[].distance` 是固定演示值，重新定位后不会重算。
2. 首页地图中心会更新，但站点列表顺序、距离和预计送达时间不会更新。
3. 定位只保存经纬度，未通过逆地理编码得到省、市、区、街道和 `adcode`。
4. 手填地址只保存文本，没有地理编码和歧义确认，无法可靠参与附近站点匹配。
5. 所有站点都直接下发，缺少服务半径、状态、标号、价格和权限过滤。
6. 路线按钮直接打开地图，没有在小程序内展示里程、预计耗时或路线预览。
7. 当前 AppID 为 `wx098111863d8b3355`；高德 Key、微信合法域名和正式环境域名尚未配置。

## 3. 高德能力梳理

### 3.1 微信小程序插件 `amap-wx.js`

官方参考手册公开的能力如下：

| 分类 | 方法 | 能力 | 本项目建议 |
| --- | --- | --- | --- |
| 周边搜索 | `getPoiAround` | 查询当前位置或指定坐标周边 POI，并返回可用于微信 `<map>` 的 marker | P1，仅用于站点资料核验或附近地标；不能代替自有站点库 |
| 逆地理编码 | `getRegeo` | 坐标转详细地址、行政区和附近 POI | P0，用于注册和资料编辑定位回填 |
| 天气 | `getWeather` | 实时天气及未来 3 天预报 | P2，可用于配送风险提示 |
| 静态地图 | `getStaticmap` | 返回静态地图图片，可含 marker、标签、折线和路况 | P2，只适合分享卡片或只读预览 |
| 输入提示 | `getInputtips` | 根据关键词、城市和中心点返回地址/POI 建议 | P0，用于手填地址选择 |
| 路线规划 | `getDrivingRoute` | 驾车路线、距离、折线数据 | P1，开发演示可用；生产关键计算建议后端调用新版 Web API |
| 路线规划 | `getWalkingRoute` / `getTransitRoute` / `getRidingRoute` | 步行、公交、骑行路线 | 当前不需要 |

需要注意：文档把它称为“微信小程序插件”，实际接入方式是下载 `amap-wx.js` 并放到项目 `libs` 目录。它通过高德 REST 服务取得数据，再把 marker 或路线数据交给微信地图组件。它不会把微信 `<map>` 的交互底图切换成高德底图。

### 3.2 Web 服务 API

Web 服务 API 是 HTTP/HTTPS 数据服务，更适合放在业务后端。官方当前文档覆盖：

| 能力分类 | 典型能力 | 本项目用途 |
| --- | --- | --- |
| 地理/逆地理编码 | 地址与经纬度互转，返回 `adcode`、结构化地址、附近 POI/AOI | 用户地址标准化、站点地址入库 |
| POI 搜索与输入提示 | 关键词、周边、多边形、ID 查询和输入建议 | 地址选择、站点基础资料核验 |
| 行政区域查询 | 省市区层级和边界 | 服务区域配置、区域筛选 |
| 距离测量 | 最多批量计算 100 个起点到一个终点的直线/驾车距离和耗时 | 一次计算多个搅拌站到工地的配送距离 |
| 路径规划 2.0 | 驾车、公交、步行、骑行、电动车，支持策略和途经点 | 站点到工地的路线预览与 ETA |
| 坐标转换 | GPS、百度等坐标转高德坐标 | 外部站点数据迁移时使用 |
| 静态地图 | URL 返回地图图片 | 报价单、询价单或分享图 |
| 天气查询 | 按行政区查询实时和预报天气 | 浇筑/运输风险提示 |
| IP 定位 | 国内 IP 粗定位 | 只适合作为无授权兜底，不用于精确站点匹配 |
| 轨迹纠偏 | 将车辆轨迹纠偏到道路 | 有车队轨迹后再接入 |
| 交通态势 | 道路或区域路况 | 配送调度二期能力，先确认账号权限与配额 |
| 高级路径/货车路径 | 未来路况、车辆长宽高重、货车限行等 | 混凝土罐车调度的长期核心能力，通常需要企业权限/商务开通 |
| GeoHUB/云图 | 空间数据存储、检索和展现 | 当前已有自有业务数据模型时不优先采用 |

### 3.3 与现有四类业务页面的结合

| 页面/分类 | 现状 | 接入后 |
| --- | --- | --- |
| 注册 | 定位只得到坐标，手填地址只存字符串 | 定位后逆地理编码；输入时提示候选；选择后保存标准地址、坐标和 `adcode` |
| 首页/站点 | 5 个静态站点，距离固定 | 后端按坐标、服务半径、标号和产能筛选；返回配送距离、耗时并排序；地图 marker 仍由 `<map>` 展示 |
| 报价/询价 | 报价与站点名称弱关联，提交仅本地成功 | 报价关联 `stationId`；询价携带标准收货位置；可按路线公里数计算运费或提示超服务范围 |
| 我的/消息 | 地址可编辑但不校验 | 维护常用工地地址；天气、路况或超服务范围变化可生成业务通知 |

## 4. 推荐架构

```text
微信小程序
  |- wx.getLocation / 微信 <map> / wx.openLocation
  |- 业务 API Client
  |- 可选 amap-wx.js（地址即时体验）
  |
  v HTTPS + 业务登录态
业务 BFF / API 服务
  |- Auth：微信登录换取业务 session
  |- GeoService：地址、距离、路线统一接口
  |- StationService：站点、服务范围、产能
  |- QuoteService：标号、报价、历史
  |- InquiryService：询价与幂等提交
  |- AmapAdapter：参数校验、签名、超时、缓存、降级
  |
  +--> 业务数据库（站点/报价/询价/地址）
  +--> Redis（地址、距离、路线短期缓存）
  +--> 高德 Web 服务 API
```

项目没有现成后端，因此接口契约先保持框架无关。若需要从零新建，建议单独建立 TypeScript API 服务，并把 `AmapAdapter` 隔离在基础设施层。这样高德返回字段、版本升级和错误码不会渗入小程序页面。

## 5. Key 与配置

### 5.1 Key 划分

| 配置 | 平台类型 | 放置位置 | 用途 |
| --- | --- | --- | --- |
| `AMAP_WX_KEY` | 微信小程序 | 小程序私有配置/构建注入 | 仅供 `amap-wx.js` 调用；客户端包内可被查看，因此只授予所需能力 |
| `AMAP_WEB_SERVICE_KEY` | Web 服务 API | 后端环境变量/密钥管理服务 | 地址、距离、路径等生产调用 |
| `AMAP_WEB_SERVICE_SECRET` | Web 服务数字签名私钥 | 后端密钥管理服务 | 生成 `sig`，严禁进入仓库、日志和客户端 |

不要用一个 Key 跨平台调用。高德错误码 `10009 USERKEY_PLAT_NOMATCH` 就用于表示 Key 与绑定平台不匹配。

### 5.2 控制台配置步骤

1. 在高德开放平台创建“搅拌站报价助手”应用。
2. 添加“微信小程序”Key，用于 `amap-wx.js`。
3. 添加“Web 服务 API”Key，用于业务后端。
4. Web 服务 Key 配置生产服务器出口 IP 白名单；需要时开启数字签名并将私钥放入服务端密钥管理。
5. 微信公众平台的 request 合法域名：若小程序直连高德，添加 `https://restapi.amap.com`；业务请求还需添加自有 API HTTPS 域名。
6. 开发者工具里 `urlCheck: false` 只方便本地调试，不能代替微信公众平台的生产域名配置。
7. 上线前在高德控制台核对账号认证、服务权限、日配额、QPS 和商用许可；不要把当前网页显示的通用配额当成合同承诺。

### 5.3 小程序建议目录

```text
xcx-work/
  libs/
    amap-wx.js                 # 官方下载文件，记录来源版本与哈希
  config/
    amap.example.js            # 仅占位，不含真实 Key
    amap.local.js              # 本地 Key，加入 .gitignore
  services/
    api.js                     # 自有后端请求封装、token、requestId
    geo.js                     # 地址提示、逆地理、路线等页面适配
  utils/
    location.js                # 坐标校验、lon/lat 转换、格式化
```

生产环境更推荐在构建或发布流水线中注入 `AMAP_WX_KEY`。微信小程序 Key 即使做字符串混淆也不等于保密，安全性应依靠平台绑定、最小权限、配额监控和 Key 轮换。

## 6. 自有 API 设计

所有接口均只返回业务所需字段，不原样透传高德响应，也不接受客户端传入任意高德 URL 或参数。

### 6.1 地址输入提示

```http
GET /api/v1/geo/suggestions?keyword=经开第八大街&cityCode=410100&lng=113.6471&lat=34.7527
Authorization: Bearer <session>
```

```json
{
  "items": [
    {
      "placeId": "amap-poi-id",
      "name": "第八大街与经北三路交叉口",
      "formattedAddress": "河南省郑州市管城回族区...",
      "adcode": "410104",
      "location": { "lng": 113.6398, "lat": 34.7602 }
    }
  ],
  "requestId": "req_xxx"
}
```

服务端要求：关键词至少 2 个字符、前端 300-500ms 防抖、限制候选数量、过滤没有坐标的结果。

### 6.2 逆地理编码

```http
POST /api/v1/geo/reverse
Content-Type: application/json
Authorization: Bearer <session>

{ "lng": 113.6471, "lat": 34.7527 }
```

```json
{
  "formattedAddress": "河南省郑州市...",
  "province": "河南省",
  "city": "郑州市",
  "district": "管城回族区",
  "adcode": "410104",
  "location": { "lng": 113.6471, "lat": 34.7527 },
  "source": "amap"
}
```

### 6.3 手填地址解析

```http
POST /api/v1/geo/resolve
Content-Type: application/json
Authorization: Bearer <session>

{ "address": "河南省郑州市经开区第八大街与经北三路交叉口", "cityCode": "410100" }
```

只有唯一且精度满足要求的结果才自动确认。多个结果或匹配层级过粗时返回候选，让用户选择，不能静默选第一条。

### 6.4 附近站点

```http
GET /api/v1/stations/nearby?lng=113.6471&lat=34.7527&radiusKm=30&grade=C30
Authorization: Bearer <session>
```

```json
{
  "center": { "lng": 113.6471, "lat": 34.7527 },
  "items": [
    {
      "id": "s1",
      "name": "豫砼商砼站",
      "address": "经开区第八大街与经北三路交叉口",
      "location": { "lng": 113.6398, "lat": 34.7602 },
      "straightDistanceM": 1200,
      "drivingDistanceM": 1800,
      "drivingDurationS": 420,
      "grade": "C30",
      "price": 385,
      "capacityStatus": "AVAILABLE"
    }
  ],
  "distanceUpdatedAt": "2026-09-08T08:00:00Z"
}
```

处理流程：

1. 数据库先按空间索引和站点服务半径筛出候选站点。
2. 使用直线距离完成快速粗排。
3. 将候选站点作为 `origins`、用户工地作为 `destination`，调用高德 `/v3/distance` 批量取得“站点送往工地”的驾车距离与耗时。
4. 结合产能、标号、价格、距离和服务范围生成最终列表。
5. 高德超时或限流时返回直线距离，并明确 `distanceMode: "STRAIGHT_LINE"`，页面展示“约”而不是伪装成驾车距离。

### 6.5 单站路线预览

```http
GET /api/v1/stations/s1/route?toLng=113.6471&toLat=34.7527&strategy=RECOMMENDED
Authorization: Bearer <session>
```

后端使用路径规划 2.0 驾车接口，返回业务化后的距离、耗时、收费和 polyline 点串。小程序把点串传给 `<map polyline="...">`。只有用户点击某个站点时才请求完整路线，避免首页为每个站点重复算路。

## 7. 数据模型调整

### 7.1 站点

```text
station
  id
  name
  formatted_address
  province / city / district / adcode
  longitude / latitude            # 统一 GCJ-02，decimal(10,6)
  amap_poi_id                      # 可空，只用于资料关联
  service_radius_km
  capacity_status
  enabled
  created_at / updated_at
```

报价必须通过 `station_id` 关联站点，不能只保存站点名称。价格、产能和服务状态属于自有业务数据，高德只提供地理信息。

### 7.2 用户/工地地址

```text
user_address
  id / user_id
  label
  formatted_address
  province / city / district / adcode
  longitude / latitude            # GCJ-02
  source                           # WX_LOCATION / AMAP_POI / MANUAL_GEOCODE
  precision_level
  is_default
  created_at / updated_at
```

## 8. 稳定性、安全与隐私

- 高德连接超时建议 1.5-2 秒，总请求预算不超过业务接口 SLA；只对网络错误和 `5xx` 做有限重试，不重试参数、鉴权和配额错误。
- 统一识别 `status`、`info`、`infocode`，记录 `requestId`、接口名、耗时和错误码；日志中删除 Key、签名、手机号和精确地址。
- `10001/10002/10009` 视为配置或权限问题并告警；`10003/10004/10014` 视为配额/限流并降级；`10016` 可短暂重试。
- 地址建议缓存 1-24 小时；地理编码缓存 7-30 天；批量距离按坐标网格缓存数分钟；路线按起终点和策略短期缓存。实时耗时必须带更新时间。
- 对业务 API 做用户级和 IP 级限流，防止客户端绕过 UI 消耗高德配额。
- 原始定位只用于本次匹配；确需保存常用工地时取得明确业务授权，并提供删除能力和保存期限。
- 后端 Key 使用出口 IP 白名单和数字签名；定期轮换 Key，并为开发、测试、生产建立独立应用或 Key。

## 9. 分阶段实施

### 阶段 0：账号与环境

- 明确 `xcx-work` 为发布工程，确认正式 AppID。
- 申请微信小程序 Key 和 Web 服务 Key。
- 配置微信合法域名、后端环境变量、IP 白名单和监控。

### 阶段 1：地址闭环

- 注册和资料编辑接入定位后的逆地理编码。
- 手填地址改为输入提示 + 候选确认。
- 会话模型增加标准地址、坐标、`adcode`、来源和精度。
- 无定位权限时仍允许手工选择地址。

### 阶段 2：真实附近站点

- 建站点表和报价表，迁移当前 5 条演示站点并核验坐标。
- 完成 `/stations/nearby`，以服务半径和空间距离筛选。
- 批量补充配送驾车距离/耗时，替换静态 `distance`。
- 首页增加加载、空结果、弱网和降级状态。

### 阶段 3：路线和询价

- 用户选择站点时加载路径规划 2.0 polyline。
- 保留 `wx.openLocation` 作为最终导航入口。
- 询价携带 `stationId`、`addressId`、坐标和路线快照，后端做幂等提交。
- 根据业务规则判断服务范围、运费或预计送达。

### 阶段 4：配送优化

- 评估企业版货车路径规划，输入罐车长宽高重、轴数和限行策略。
- 有真实车队后再接轨迹纠偏、交通态势、未来路径和调度能力。

## 10. 验收标准

1. 首次定位成功后，页面显示结构化地址，坐标顺序始终为高德请求 `lng,lat`、小程序对象 `{ latitude, longitude }`。
2. 拒绝定位后可通过地址提示完成注册；模糊地址必须让用户确认候选。
3. 用户位置变化后，站点距离和排序随之变化，不再使用静态演示值。
4. 高德正常时显示驾车距离和预计耗时；高德不可用时显示带“约”的直线距离，报价浏览仍可用。
5. 点击站点可在小程序地图绘制路线，再通过 `wx.openLocation` 打开导航。
6. 小程序代码、网络响应和日志中不存在 Web 服务 Key 或签名私钥。
7. 验证无定位权限、无结果、超时、限流、Key 错误、登录过期、重复询价和坐标越界。
8. 真机覆盖 iOS/Android，并在微信公众平台启用域名校验后通过，不以开发者工具的 `urlCheck: false` 作为验收依据。

## 11. 实施前需要的输入

- 正式发布目录是否确定为 `xcx-work`。
- 高德“微信小程序”Key；若采用推荐后端架构，还需要“Web 服务 API”Key和数字签名私钥。私钥只配置到服务端密钥管理，不应发在聊天或提交到 Git。
- 计划使用的后端语言/框架、部署平台、HTTPS API 域名和固定出口 IP。
- 真实站点清单、坐标或完整地址、服务半径、可供标号与产能状态。
- 距离口径：客户到站、站到工地，或罐车实际配送路线。本方案默认“站点到工地”。
- 是否需要第一期就做货车限行路线；若需要，应先确认高德企业权限和商务配额。

## 12. 官方文档依据

- [微信小程序插件：配置工程](https://lbs.amap.com/api/wx/guide/create-project/config-project)
- [微信小程序插件：获取 Key](https://lbs.amap.com/api/wx/guide/create-project/get-key)
- [微信小程序插件：入门指南与合法域名](https://lbs.amap.com/api/wx/gettingstarted)
- [微信小程序插件：基础类参考手册](https://lbs.amap.com/api/wx/reference/core)
- [微信小程序插件：路线规划](https://lbs.amap.com/api/wx/guide/route/route)
- [Web 服务 API：概述](https://lbs.amap.com/api/webservice/summary/)
- [Web 服务 API：地理/逆地理编码](https://lbs.amap.com/api/webservice/guide/api/georegeo/)
- [Web 服务 API：搜索 POI](https://lbs.amap.com/api/webservice/guide/api/search/)
- [Web 服务 API：路径规划与距离测量](https://lbs.amap.com/api/webservice/guide/api/direction)
- [Web 服务 API：路径规划 2.0](https://lbs.amap.com/api/webservice/guide/api/newroute)
- [高德错误码说明](https://lbs.amap.com/api/web-service/tools/info)
- [Web 服务 Key IP 白名单说明](https://lbs.amap.com/faq/webservice/webservice-api/basic-configuration/43238)
- [Web 服务数字签名说明](https://lbs.amap.com/faq/quota-key/key/41181/)
- [货车路径规划高级版](https://lbs.amap.com/api/logistic-service/guide/wagon_path/hc-route-plan)
