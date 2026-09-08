'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  LocateFixed,
  MapPin,
  MapPinned,
  Navigation,
  Zap,
} from 'lucide-react'
import { stations, tickerItems, type Identity, type Profile } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Capsule, StatusBar } from './screen-chrome'
import type { TabId } from './tab-bar'

const StationMap = dynamic(() => import('@/components/station-map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-secondary text-xs text-muted-foreground">
      地图加载中…
    </div>
  ),
})

const guideSteps = [
  {
    no: '01',
    title: '完善资料',
    desc: '填写联系人与搅拌站信息，完成身份认证',
    icon: FileCheck2,
    done: true,
  },
  {
    no: '02',
    title: '浏览附近站点',
    desc: '在地图上查看周边搅拌站位置与距离',
    icon: MapPinned,
    done: false,
  },
  {
    no: '03',
    title: '查看实时报价',
    desc: '掌握本周与本月的最新报价行情',
    icon: ClipboardList,
    done: false,
  },
  {
    no: '04',
    title: '维护账户信息',
    desc: '在「我的」页面管理资料与消息通知',
    icon: BadgeCheck,
    done: false,
  },
]

interface HomeScreenProps {
  profile: Profile
  identity: Identity
  onNavigate: (tab: TabId) => void
}

export function HomeScreen({ profile, identity, onNavigate }: HomeScreenProps) {
  const mapRef = useRef<HTMLElement>(null)
  const [locationMessage, setLocationMessage] = useState('')

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationMessage('当前设备不支持定位，请在资料中填写地址')
      return
    }
    setLocationMessage('正在获取当前位置…')
    navigator.geolocation.getCurrentPosition(
      () => setLocationMessage('定位成功，已按当前位置匹配站点'),
      () => setLocationMessage('定位未授权，已继续使用资料地址匹配站点'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    )
    window.setTimeout(() => setLocationMessage(''), 2600)
  }

  return (
    <div className="animate-screen-in no-scrollbar flex h-full flex-col overflow-y-auto bg-background">
      {/* 深色工业头部 */}
      <header className="shrink-0 bg-ink text-white">
        <StatusBar dark />
        <div className="flex items-center justify-between px-5 pb-4 pt-1.5">
          <div className="flex items-center gap-3">
            <span className="chamfer-badge grid size-10 shrink-0 place-items-center bg-safety text-base font-black">
              {profile.name ? profile.name[0] : '砼'}
            </span>
            <div>
              <p className="text-[15px] font-bold leading-tight">
                欢迎回来，{profile.name || '砼友'}
              </p>
              <span className="chamfer-badge mt-1 inline-flex items-center gap-1 bg-hazard px-1.5 py-px text-[10px] font-bold text-ink">
                <BadgeCheck className="size-3" />
                {identity.name} · 已认证
              </span>
            </div>
          </div>
          <Capsule dark />
        </div>
        {/* 行情跑马灯 */}
        <div className="overflow-hidden bg-hazard py-1.5" aria-label="今日行情">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-[11px] font-semibold tracking-wide text-ink">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Zap className="size-3" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 pb-28">
        <p className="px-5 pt-4 text-xs leading-relaxed text-muted-foreground">
          欢迎来到智能报价助手首页。请选择您感兴趣的模块开始您的旅程。
        </p>

        {/* 新手引导 */}
        <section className="mt-4" aria-labelledby="guide-title">
          <div className="flex items-center justify-between px-5">
            <h2 id="guide-title" className="flex items-center gap-2 text-base font-black">
              <span className="h-3.5 w-1 bg-safety" aria-hidden />
              新手引导
            </h2>
            <span className="font-display text-[10px] tracking-[0.25em] text-muted-foreground">
              GUIDE
            </span>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {guideSteps.map((step) => (
              <div
                key={step.no}
                className="relative w-44 shrink-0 overflow-hidden border border-border bg-card p-3.5"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-3 font-display text-[44px] font-bold text-secondary"
                >
                  {step.no}
                </span>
                <span className="chamfer-badge relative grid size-9 place-items-center bg-ink text-hazard">
                  <step.icon className="size-4" />
                </span>
                <p className="relative mt-2.5 flex items-center gap-1.5 text-[13px] font-bold">
                  {step.title}
                  {step.done && (
                    <span className="bg-safety/10 px-1 py-px text-[9px] font-semibold text-safety">
                      已完成
                    </span>
                  )}
                </p>
                <p className="relative mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 快捷入口 */}
        <div className="mt-5 flex gap-3 px-5">
          <button
            type="button"
            onClick={() => onNavigate('quotes')}
            className="chamfer flex flex-1 items-center justify-center gap-1.5 bg-safety py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            立即询价
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="chamfer flex flex-1 items-center justify-center gap-1.5 bg-ink py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            附近站点
            <MapPin className="size-4" />
          </button>
        </div>

        {/* 附近搅拌站 */}
        <section ref={mapRef} className="mt-6 scroll-mt-4 px-5" aria-labelledby="nearby-title">
          <div className="flex items-center justify-between">
            <h2 id="nearby-title" className="flex items-center gap-2 text-base font-black">
              <span className="h-3.5 w-1 bg-safety" aria-hidden />
              附近搅拌站
            </h2>
            <span className="text-[11px] text-muted-foreground">共 {stations.length} 座</span>
          </div>

          <div className="mt-3 overflow-hidden border border-border bg-card">
            <div className="relative h-60">
              <StationMap />
              <div className="chamfer-badge absolute left-3 top-3 z-[600] flex items-center gap-1.5 bg-ink/85 px-2.5 py-1.5 text-[10px] text-white backdrop-blur">
                <MapPin className="size-3 text-hazard" />
                {profile.address || '郑州市经开区'}
              </div>
              <button
                type="button"
                aria-label="重新定位"
                onClick={locateUser}
                className="chamfer-badge absolute bottom-3 right-3 z-[600] grid size-9 place-items-center bg-white shadow-md transition active:scale-95"
              >
                <LocateFixed className="size-4 text-safety" />
              </button>
            </div>

            {locationMessage && (
              <p role="status" className="border-t border-border bg-ink px-4 py-2 text-[11px] text-white">
                {locationMessage}
              </p>
            )}

            <ul>
              {stations.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0"
                >
                  <span className="chamfer-badge grid h-9 w-12 shrink-0 place-items-center bg-secondary font-display text-xs font-bold text-safety">
                    {s.distance}km
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{s.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      C30 参考 ¥{s.c30}/方 ·{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          s.status === '产能充足' ? 'text-emerald-600' : 'text-safety'
                        )}
                      >
                        {s.status}
                      </span>
                    </p>
                  </div>
                  <a
                    href={`https://uri.amap.com/marker?position=${s.lng},${s.lat}&name=${encodeURIComponent(s.name)}&coordinate=gaode&callnative=1`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-safety"
                  >
                    <Navigation className="size-3.5" />
                    导航
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
