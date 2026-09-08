'use client'

import { ArrowLeft } from 'lucide-react'
import type { Identity, Profile } from '@/lib/data'
import { ProfileForm } from './profile-form'
import { Capsule, StatusBar } from './screen-chrome'

interface RegisterScreenProps {
  identity: Identity
  initial: Profile
  onBack: () => void
  onDone: (profile: Profile) => void
}

export function RegisterScreen({ identity, initial, onBack, onDone }: RegisterScreenProps) {
  return (
    <div className="animate-screen-in no-scrollbar flex h-full flex-col overflow-y-auto bg-background">
      <StatusBar />

      {/* 导航栏 */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-1.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="返回身份选择"
          className="grid size-9 place-items-center text-ink transition hover:bg-secondary"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-center text-[15px] font-bold">完善资料</h1>
        <Capsule />
      </div>

      {/* 步骤指示 */}
      <div className="px-5 pt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-display font-semibold tracking-wider text-safety">步骤 2/2</span>
          <span className="text-muted-foreground">填写联系人信息</span>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          <span className="h-1 flex-1 bg-safety" />
          <span className="h-1 flex-1 bg-safety" />
        </div>
      </div>

      {/* 当前身份 */}
      <div className="mx-5 mt-4 flex items-center gap-3 bg-ink p-3.5 text-white">
        <span className="chamfer-badge grid size-9 shrink-0 place-items-center bg-safety/20 text-hazard">
          <identity.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-wider text-white/45">当前身份</p>
          <p className="text-sm font-bold">{identity.name}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 text-[11px] font-semibold text-hazard"
        >
          更换
        </button>
      </div>

      {/* 表单 */}
      <div className="px-5 pb-10 pt-5">
        <h2 className="text-lg font-black">请填写以下信息</h2>
        <p className="mb-5 mt-1 text-xs leading-relaxed text-muted-foreground">
          请填写以下信息以便我们为您提供更好的服务，信息仅用于报价对接与站点匹配。
        </p>
        <ProfileForm initial={initial} submitLabel="完成注册，进入首页" onSubmit={onDone} />
      </div>
    </div>
  )
}
