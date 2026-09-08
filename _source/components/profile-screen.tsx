'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Info,
  LogOut,
  MapPin,
  PencilLine,
  Phone,
  Repeat,
  Settings,
  X,
} from 'lucide-react'
import { notifications, type Identity, type Profile } from '@/lib/data'
import { ProfileForm } from './profile-form'
import { Capsule, StatusBar } from './screen-chrome'
import type { TabId } from './tab-bar'

interface ProfileScreenProps {
  profile: Profile
  identity: Identity
  onSave: (profile: Profile) => void
  onNavigate: (tab: TabId) => void
  onSwitchIdentity: () => void
  onLogout: () => void
}

const stats = [
  { label: '累计询价', value: '26', unit: '次' },
  { label: '常用站点', value: '5', unit: '座' },
  { label: '加入天数', value: '18', unit: '天' },
]

export function ProfileScreen({
  profile,
  identity,
  onSave,
  onNavigate,
  onSwitchIdentity,
  onLogout,
}: ProfileScreenProps) {
  const [sheet, setSheet] = useState<'edit' | 'notice' | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  const menus = [
    {
      icon: Bell,
      label: '消息通知',
      extra: <span className="bg-safety px-1.5 py-px text-[10px] font-bold text-white">3</span>,
      onClick: () => setSheet('notice'),
    },
    {
      icon: ClipboardList,
      label: '我的报价',
      extra: <span className="text-[10px] text-muted-foreground">快捷切换</span>,
      onClick: () => onNavigate('quotes'),
    },
    {
      icon: Settings,
      label: '账户设置',
      onClick: () => setToast('演示环境，账户设置即将上线'),
    },
    {
      icon: Repeat,
      label: '切换身份',
      extra: <span className="text-[10px] text-muted-foreground">{identity.name}</span>,
      onClick: onSwitchIdentity,
    },
    {
      icon: CircleHelp,
      label: '帮助与反馈',
      onClick: () => setToast('演示环境，帮助中心即将上线'),
    },
    {
      icon: Info,
      label: '关于我们',
      extra: <span className="font-display text-[10px] text-muted-foreground">v1.0.0</span>,
      onClick: () => setToast('搅拌站报价助手 v1.0.0'),
    },
  ]

  return (
    <div className="animate-screen-in flex h-full flex-col bg-background">
      {/* 深色头部（固定） */}
      <header className="shrink-0 bg-ink text-white">
        <StatusBar dark />
        <div className="flex items-center justify-between px-5 pb-3 pt-1.5">
          <h1 className="text-lg font-black">我的</h1>
          <Capsule dark />
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-28">
        {/* 用户卡片（随内容滚动） */}
        <div className="bg-ink px-5 pb-14 pt-3 text-white">
          <div className="flex items-center gap-4">
            <span className="chamfer grid size-14 shrink-0 place-items-center bg-safety text-xl font-black">
              {profile.name ? profile.name[0] : '砼'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-lg font-black">
                {profile.name || '砼友'}
                <span className="chamfer-badge inline-flex items-center gap-1 bg-hazard px-1.5 py-px text-[10px] font-bold text-ink">
                  <BadgeCheck className="size-3" />
                  {identity.name}
                </span>
              </p>
              <p className="mt-1 flex items-center gap-1 font-display text-xs tracking-wide text-white/55">
                <Phone className="size-3" />
                {profile.phone || '未绑定手机'}
              </p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/55">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{profile.address || '未设置搅拌站地址'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="chamfer mx-5 -mt-10 grid grid-cols-3 divide-x divide-border border border-border bg-card py-4 shadow-sm">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-xl font-bold leading-none">
                {s.value}
                <span className="ml-0.5 font-sans text-[10px] font-normal text-muted-foreground">
                  {s.unit}
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="px-5 pt-4 text-xs text-muted-foreground">
          我的页面，轻松管理个人资料与信息。
        </p>

        {/* 编辑资料入口 */}
        <button
          type="button"
          onClick={() => setSheet('edit')}
          className="chamfer mx-5 mt-3 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 bg-ink py-3 text-sm font-bold text-white transition active:scale-[0.98]"
        >
          <PencilLine className="size-4 text-hazard" />
          编辑资料
        </button>

        {/* 功能菜单 */}
        <div className="mx-5 mt-4 divide-y divide-border border border-border bg-card">
          {menus.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={m.onClick}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-secondary/60"
            >
              <span className="chamfer-badge grid size-8 shrink-0 place-items-center bg-secondary text-ink">
                <m.icon className="size-4" />
              </span>
              <span className="flex-1 text-[13px] font-semibold">{m.label}</span>
              {m.extra}
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 border border-border bg-card py-3 text-sm font-semibold text-muted-foreground transition hover:text-destructive"
        >
          <LogOut className="size-4" />
          退出登录
        </button>
      </div>

      {/* 轻提示 */}
      {toast && (
        <div className="chamfer-badge animate-fade-in absolute left-1/2 top-16 z-50 -translate-x-1/2 whitespace-nowrap bg-ink px-4 py-2 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* 编辑资料弹层 */}
      {sheet === 'edit' && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="关闭编辑资料"
            onClick={() => setSheet(null)}
            className="animate-fade-in absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="编辑资料"
            className="animate-sheet-in no-scrollbar relative max-h-[86%] overflow-y-auto bg-background"
          >
            <div className="hazard-stripes h-1.5" aria-hidden />
            <div className="p-5 pb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[15px] font-black">编辑资料</h3>
                <button
                  type="button"
                  onClick={() => setSheet(null)}
                  aria-label="关闭"
                  className="grid size-8 place-items-center bg-secondary text-ink transition hover:bg-border"
                >
                  <X className="size-4" />
                </button>
              </div>
              <ProfileForm
                initial={profile}
                submitLabel="保存修改"
                onSubmit={(p) => {
                  onSave(p)
                  setSheet(null)
                  setToast('资料已更新')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 消息通知弹层 */}
      {sheet === 'notice' && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="关闭消息通知"
            onClick={() => setSheet(null)}
            className="animate-fade-in absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="消息通知"
            className="animate-sheet-in no-scrollbar relative max-h-[86%] overflow-y-auto bg-background"
          >
            <div className="hazard-stripes h-1.5" aria-hidden />
            <div className="p-5 pb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[15px] font-black">消息通知</h3>
                <button
                  type="button"
                  onClick={() => setSheet(null)}
                  aria-label="关闭"
                  className="grid size-8 place-items-center bg-secondary text-ink transition hover:bg-border"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="chamfer-badge bg-safety/10 px-1.5 py-0.5 text-[10px] font-bold text-safety">
                        {n.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="mt-2 text-[13px] font-bold">{n.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
