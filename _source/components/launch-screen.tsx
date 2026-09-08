'use client'

import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import { identities, type IdentityId } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Capsule, StatusBar } from './screen-chrome'

interface LaunchScreenProps {
  selected: IdentityId | null
  onSelect: (id: IdentityId) => void
  onNext: () => void
}

export function LaunchScreen({ selected, onSelect, onNext }: LaunchScreenProps) {
  return (
    <div className="concrete-noise animate-screen-in no-scrollbar relative flex h-full flex-col overflow-y-auto bg-ink text-white">
      <StatusBar dark />

      {/* 主视觉：搅拌站夜景插画 */}
      <div className="relative shrink-0">
        <div className="relative aspect-[16/11] w-full">
          <Image
            src="/images/hero-plant.png"
            alt="混凝土搅拌站夜景插画"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-ink/50" />
          <Capsule dark className="absolute right-4 top-2.5 z-10" />
          <div className="absolute bottom-3 left-5 right-5">
            <div className="flex items-center gap-2">
              <span className="chamfer-badge bg-safety px-2 py-0.5 font-display text-[10px] font-semibold tracking-[0.2em] text-white">
                CONCRETE
              </span>
              <span className="font-display text-[10px] tracking-[0.3em] text-white/45">
                PRICING ASSISTANT
              </span>
            </div>
            <h1 className="mt-2 text-[30px] font-black leading-tight tracking-wide">
              搅拌站报价助手
            </h1>
          </div>
        </div>
        <div className="hazard-stripes h-2" aria-hidden />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-4">
        <p className="text-[13px] leading-relaxed text-white/55">
          欢迎使用报价助手，请选择您的身份。系统将根据身份为您提供个性化的报价服务与站点推荐。
        </p>

        {/* 身份选择 */}
        <div className="stagger mt-5 flex flex-col gap-3" role="radiogroup" aria-label="选择身份">
          {identities.map((item) => {
            const active = selected === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(item.id)}
                className={cn(
                  'relative flex items-center gap-3.5 border p-4 text-left transition-all',
                  active
                    ? 'border-safety bg-safety/10'
                    : 'border-ink-line bg-ink-soft hover:border-white/25'
                )}
              >
                <span
                  className={cn(
                    'chamfer-badge grid size-11 shrink-0 place-items-center transition-colors',
                    active ? 'bg-safety text-white' : 'bg-ink-line/60 text-hazard'
                  )}
                >
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[15px] font-bold">{item.name}</span>
                    <span className="font-display text-[10px] tracking-[0.25em] text-white/35">
                      {item.en}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-white/50">
                    {item.desc}
                  </span>
                </span>
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                    active ? 'border-safety bg-safety text-white' : 'border-white/20 text-transparent'
                  )}
                >
                  <Check className="size-3" />
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          disabled={!selected}
          onClick={onNext}
          className="chamfer mt-6 flex w-full items-center justify-center gap-2 bg-safety py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink-line disabled:text-white/35"
        >
          {selected ? '确认身份，进入注册' : '请先选择您的身份'}
          <ArrowRight className="size-4" />
        </button>
        <p className="mt-4 text-center text-[11px] text-white/35">
          继续即代表同意《服务协议》与《隐私政策》 · v1.0.0
        </p>
      </div>
    </div>
  )
}
