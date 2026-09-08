'use client'

import { ClipboardList, House, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'home' | 'quotes' | 'profile'

const tabs = [
  { id: 'home', label: '首页', icon: House },
  { id: 'quotes', label: '报价', icon: ClipboardList },
  { id: 'profile', label: '我的', icon: UserRound },
] as const

export function TabBar({
  active,
  onChange,
}: {
  active: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <nav
      aria-label="主导航"
      className="absolute inset-x-0 bottom-0 z-30 bg-ink pb-[env(safe-area-inset-bottom)]"
    >
      <div className="hazard-stripes h-[3px] opacity-90" aria-hidden />
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              {isActive && (
                <span className="absolute top-0 h-[3px] w-8 bg-hazard" aria-hidden />
              )}
              <tab.icon
                className={cn('size-5', isActive ? 'text-hazard' : 'text-white/40')}
              />
              <span
                className={cn(
                  'text-[11px] leading-none',
                  isActive ? 'font-bold text-white' : 'text-white/40'
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
