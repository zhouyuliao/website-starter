'use client'

import { useEffect, useState } from 'react'
import {
  Clock,
  Minus,
  Phone,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { quotes, type PriceNode, type Quote } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Capsule, StatusBar } from './screen-chrome'

type Filter = 'all' | 'week' | 'month'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'week', label: '本周' },
  { id: 'month', label: '本月' },
]

/** 红涨绿跌的涨跌标识 */
function ChangeBadge({
  change,
  onDark = false,
  className,
}: {
  change: number
  onDark?: boolean
  className?: string
}) {
  if (change === 0) {
    return (
      <span className={cn('inline-flex items-center gap-0.5 text-[11px] text-muted-foreground', className)}>
        <Minus className="size-3" />
        持平
      </span>
    )
  }
  const up = change > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-display text-[11px] font-semibold',
        up ? (onDark ? 'text-red-400' : 'text-red-600') : onDark ? 'text-emerald-400' : 'text-emerald-600',
        className
      )}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? '+' : ''}
      {change}
    </span>
  )
}

/** 报价走势折线图 */
function PriceChart({ history }: { history: PriceNode[] }) {
  const W = 320
  const H = 120
  const PAD_X = 26
  const PAD_TOP = 20
  const PAD_BOTTOM = 22

  const prices = history.map((h) => h.p)
  const min = Math.min(...prices) - 2
  const max = Math.max(...prices) + 2
  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (history.length - 1)
  const y = (p: number) => PAD_TOP + ((max - p) / (max - min)) * (H - PAD_TOP - PAD_BOTTOM)
  const points = history.map((h, i) => `${x(i)},${y(h.p)}`).join(' ')
  const areaPoints = `${PAD_X},${H - PAD_BOTTOM} ${points} ${x(history.length - 1)},${H - PAD_BOTTOM}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="报价走势图">
      {[0, 0.5, 1].map((r) => {
        const gy = PAD_TOP + r * (H - PAD_TOP - PAD_BOTTOM)
        return (
          <line
            key={r}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={gy}
            y2={gy}
            stroke="var(--border)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />
        )
      })}
      <polygon points={areaPoints} fill="var(--color-safety)" opacity="0.08" />
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-safety)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {history.map((h, i) => (
        <g key={h.t}>
          <circle cx={x(i)} cy={y(h.p)} r="3" fill="#fff" stroke="var(--color-safety)" strokeWidth="2" />
          <text
            x={x(i)}
            y={y(h.p) - 8}
            textAnchor="middle"
            className="fill-ink font-display"
            fontSize="10"
            fontWeight="600"
          >
            {h.p}
          </text>
          <text
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="9"
          >
            {h.t}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function QuotesScreen() {
  const [filter, setFilter] = useState<Filter>('all')
  const [active, setActive] = useState<Quote | null>(null)
  const [quantity, setQuantity] = useState('10')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 2400)
    return () => window.clearTimeout(timer)
  }, [message])

  const closeDetail = () => {
    setActive(null)
    setSubmitted(false)
    setQuantity('10')
    setNote('')
  }

  const submitInquiry = () => {
    const amount = Number(quantity)
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage('请输入大于 0 的预计用量')
      return
    }
    setSubmitted(true)
    setMessage('询价需求已记录（演示环境）')
  }

  const filtered = quotes.filter((q) => {
    if (filter === 'week') return q.daysAgo <= 7
    if (filter === 'month') return q.daysAgo <= 30
    return true
  })

  return (
    <div className="animate-screen-in flex h-full flex-col bg-background">
      {/* 深色头部（固定） */}
      <header className="shrink-0 bg-ink text-white">
        <StatusBar dark />
        <div className="flex items-center justify-between px-5 pb-3 pt-1.5">
          <h1 className="text-lg font-black">报价中心</h1>
          <Capsule dark />
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-28">
        {/* 深色延伸带（随内容滚动，供汇总卡片叠放） */}
        <div className="bg-ink px-5 pb-14 pt-1 text-white">
          <p className="text-xs leading-relaxed text-white/50">
            查看您的历史报价，轻松获取本月及本周的最新报价信息
          </p>
        </div>

        {/* 汇总卡片 */}
        <div className="-mt-9 grid grid-cols-2 gap-3 px-5">
          <div className="chamfer bg-card p-4 shadow-sm">
            <p className="flex items-center justify-between text-[11px] text-muted-foreground">
              本周 C30 均价
              <span className="font-display text-[9px] tracking-[0.2em]">WEEK</span>
            </p>
            <p className="mt-1.5 font-display text-[26px] font-bold leading-none">
              ¥386
              <span className="ml-0.5 font-sans text-[10px] font-normal text-muted-foreground">
                /方
              </span>
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              较上周
              <ChangeBadge change={5} />
            </p>
          </div>
          <div className="chamfer bg-card p-4 shadow-sm">
            <p className="flex items-center justify-between text-[11px] text-muted-foreground">
              本月 C30 均价
              <span className="font-display text-[9px] tracking-[0.2em]">MONTH</span>
            </p>
            <p className="mt-1.5 font-display text-[26px] font-bold leading-none">
              ¥381
              <span className="ml-0.5 font-sans text-[10px] font-normal text-muted-foreground">
                /方
              </span>
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              较上月
              <ChangeBadge change={8} />
            </p>
          </div>
        </div>

        {/* 筛选 */}
        <div className="mt-5 flex items-center gap-2 px-5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                'chamfer-badge px-3.5 py-1.5 text-xs font-semibold transition-colors',
                filter === f.id
                  ? 'bg-ink text-hazard'
                  : 'border border-border bg-card text-muted-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground">
            共 {filtered.length} 条
          </span>
        </div>

        {/* 报价列表 */}
        <div className="stagger mt-3 flex flex-col gap-2.5 px-5">
          {filtered.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setActive(q)}
              className="flex w-full items-center gap-3 border border-border bg-card p-4 text-left transition hover:border-safety/50"
            >
              <span className="chamfer-badge grid h-11 w-12 shrink-0 place-items-center bg-ink font-display text-sm font-bold tracking-wide text-hazard">
                {q.grade}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">{q.station}</span>
                <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  {q.time}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-lg font-bold leading-none">
                  ¥{q.price}
                  <span className="ml-0.5 font-sans text-[10px] font-normal text-muted-foreground">
                    /方
                  </span>
                </span>
                <ChangeBadge change={q.change} className="mt-1" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 报价详情底部弹层 */}
      {active && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="关闭详情"
            onClick={closeDetail}
            className="animate-fade-in absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="报价详情"
            className="animate-sheet-in no-scrollbar relative max-h-[86%] overflow-y-auto bg-background"
          >
            <div className="hazard-stripes h-1.5" aria-hidden />
            <div className="p-5 pb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="chamfer-badge grid h-12 w-14 place-items-center bg-ink font-display text-base font-bold tracking-wide text-hazard">
                    {active.grade}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black">{active.station}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      最新报价 · {active.time}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  aria-label="关闭"
                  className="grid size-8 place-items-center bg-secondary text-ink transition hover:bg-border"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 flex items-end justify-between bg-ink p-4 text-white">
                <div>
                  <p className="text-[10px] tracking-wider text-white/45">当前报价（含泵送）</p>
                  <p className="mt-1 font-display text-[32px] font-bold leading-none text-hazard">
                    ¥{active.price}
                    <span className="ml-1 font-sans text-xs font-normal text-white/50">/方</span>
                  </p>
                </div>
                <ChangeBadge change={active.change} onDark className="text-xs" />
              </div>

              <h4 className="mt-5 flex items-center gap-2 text-sm font-black">
                <span className="h-3 w-1 bg-safety" aria-hidden />
                价格走势
              </h4>
              <div className="mt-2 border border-border bg-card p-3">
                <PriceChart history={active.history} />
              </div>

              <h4 className="mt-5 flex items-center gap-2 text-sm font-black">
                <span className="h-3 w-1 bg-safety" aria-hidden />
                报价时间节点
              </h4>
              <ul className="mt-3">
                {active.history.map((h, i) => (
                  <li key={h.t} className="relative flex items-center justify-between pb-4 pl-5 last:pb-0">
                    {i < active.history.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-[3.5px] top-4 w-px bg-border"
                      />
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-0 top-1.5 size-2 rounded-full',
                        i === active.history.length - 1
                          ? 'bg-safety ring-4 ring-safety/20'
                          : 'bg-border'
                      )}
                    />
                    <span className="text-xs text-muted-foreground">{h.t}</span>
                    <span className="font-display text-sm font-bold">¥{h.p}/方</span>
                  </li>
                ))}
              </ul>

              {submitted ? (
                <div role="status" className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <p className="font-bold">询价需求已记录</p>
                  <p className="mt-1 text-xs">{active.station} 会按 {quantity} 方的预计用量准备联系。</p>
                  <button type="button" onClick={closeDetail} className="mt-3 text-xs font-bold text-emerald-700 underline underline-offset-2">
                    返回报价列表
                  </button>
                </div>
              ) : (
                <div className="mt-6 border border-border bg-card p-4">
                  <h4 className="text-sm font-black">提交询价需求</h4>
                  <p className="mt-1 text-[11px] text-muted-foreground">填写预计用量，便于站点快速响应。</p>
                  <label htmlFor="quote-quantity" className="mt-3 block text-xs font-bold">预计用量（方）</label>
                  <input
                    id="quote-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="mt-1 h-11 w-full border border-border bg-background px-3 font-display text-sm outline-none focus:border-safety"
                  />
                  <label htmlFor="quote-note" className="mt-3 block text-xs font-bold">备注（选填）</label>
                  <textarea
                    id="quote-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={80}
                    rows={2}
                    placeholder="例如：明日上午 9 点前送达"
                    className="mt-1 w-full resize-none border border-border bg-background px-3 py-2 text-xs outline-none focus:border-safety"
                  />
                  <button
                    type="button"
                    onClick={submitInquiry}
                    className="chamfer mt-4 flex w-full items-center justify-center gap-2 bg-safety py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98]"
                  >
                    <Phone className="size-4" />
                    提交询价需求
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {message && (
        <div role="status" className="chamfer-badge animate-fade-in absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap bg-ink px-4 py-2 text-xs text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  )
}
