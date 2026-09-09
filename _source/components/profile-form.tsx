'use client'

import { useState } from 'react'
import { Check, KeyRound, MapPin, PencilLine, Phone, User } from 'lucide-react'
import { presetAddresses, type Profile } from '@/lib/data'
import { cn } from '@/lib/utils'

interface ProfileFormProps {
  initial: Profile
  submitLabel: string
  passwordRequired?: boolean
  onSubmit: (profile: Profile, password?: string) => void | Promise<void>
}

interface FormErrors {
  name?: string
  phone?: string
  address?: string
  password?: string
  confirmPassword?: string
}

const CUSTOM = '__custom__'

export function ProfileForm({ initial, submitLabel, passwordRequired = false, onSubmit }: ProfileFormProps) {
  const isPreset = presetAddresses.includes(initial.address)
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone)
  const [addressKey, setAddressKey] = useState<string>(
    initial.address ? (isPreset ? initial.address : CUSTOM) : ''
  )
  const [customAddress, setCustomAddress] = useState(isPreset ? '' : initial.address)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const handleSubmit = () => {
    const address = addressKey === CUSTOM ? customAddress.trim() : addressKey
    const next: FormErrors = {}
    if (!name.trim()) next.name = '请输入联系人姓名'
    if (!/^1[3-9]\d{9}$/.test(phone)) next.phone = '请输入正确的 11 位手机号码'
    if (passwordRequired && password.length < 8) next.password = '密码至少需要 8 位'
    if (passwordRequired && password !== confirmPassword) next.confirmPassword = '两次输入的密码不一致'
    if (!address) next.address = '请选择或填写搅拌站地址'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    void onSubmit({ name: name.trim(), phone, address }, password)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 联系人姓名 */}
      <div>
        <label htmlFor="pf-name" className="mb-1.5 block text-xs font-bold">
          联系人姓名 <span className="text-safety">*</span>
        </label>
        <div
          className={cn(
            'flex items-center gap-2 border bg-card px-3 transition-colors focus-within:border-safety',
            errors.name ? 'border-destructive' : 'border-border'
          )}
        >
          <User className="size-4 shrink-0 text-muted-foreground" />
          <input
            id="pf-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入联系人姓名"
            maxLength={12}
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        {errors.name && <p className="mt-1 text-[11px] text-destructive">{errors.name}</p>}
      </div>

      {/* 手机号码 */}
      <div>
        <label htmlFor="pf-phone" className="mb-1.5 block text-xs font-bold">
          手机号码 <span className="text-safety">*</span>
        </label>
        <div
          className={cn(
            'flex items-center border bg-card transition-colors focus-within:border-safety',
            errors.phone ? 'border-destructive' : 'border-border'
          )}
        >
          <span className="flex h-11 items-center gap-1.5 border-r border-border px-3 font-display text-sm font-semibold">
            <Phone className="size-3.5 text-muted-foreground" />
            +86
          </span>
          <input
            id="pf-phone"
            name="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="请输入 11 位手机号码"
            inputMode="numeric"
            className="h-11 w-full bg-transparent px-3 font-display text-sm tracking-wide outline-none placeholder:font-sans placeholder:text-muted-foreground/60"
          />
        </div>
        {errors.phone && <p className="mt-1 text-[11px] text-destructive">{errors.phone}</p>}
      </div>

      {passwordRequired && (
        <>
          <div>
            <label htmlFor="pf-password" className="mb-1.5 block text-xs font-bold">
              设置密码 <span className="text-safety">*</span>
            </label>
            <div className={cn('flex items-center gap-2 border bg-card px-3 transition-colors focus-within:border-safety', errors.password ? 'border-destructive' : 'border-border')}>
              <KeyRound className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="pf-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位密码"
                maxLength={72}
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            {errors.password && <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="pf-confirm-password" className="mb-1.5 block text-xs font-bold">
              确认密码 <span className="text-safety">*</span>
            </label>
            <div className={cn('flex items-center gap-2 border bg-card px-3 transition-colors focus-within:border-safety', errors.confirmPassword ? 'border-destructive' : 'border-border')}>
              <KeyRound className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="pf-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                maxLength={72}
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-[11px] text-destructive">{errors.confirmPassword}</p>}
          </div>
        </>
      )}

      {/* 搅拌站地址 */}
      <div>
        <span className="mb-1.5 block text-xs font-bold">
          搅拌站地址 <span className="text-safety">*</span>
        </span>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="搅拌站地址">
          {presetAddresses.map((addr) => {
            const active = addressKey === addr
            return (
              <button
                key={addr}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setAddressKey(addr)}
                className={cn(
                  'flex items-center gap-2.5 border px-3 py-2.5 text-left text-[13px] transition-colors',
                  active
                    ? 'border-safety bg-safety/5 font-semibold'
                    : 'border-border bg-card hover:border-ink/30'
                )}
              >
                <MapPin
                  className={cn('size-4 shrink-0', active ? 'text-safety' : 'text-muted-foreground')}
                />
                <span className="flex-1">{addr}</span>
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded-full border',
                    active ? 'border-safety bg-safety text-white' : 'border-border text-transparent'
                  )}
                >
                  <Check className="size-2.5" />
                </span>
              </button>
            )
          })}

          {/* 自定义地址 */}
          <button
            type="button"
            role="radio"
            aria-checked={addressKey === CUSTOM}
            onClick={() => setAddressKey(CUSTOM)}
            className={cn(
              'flex items-center gap-2.5 border px-3 py-2.5 text-left text-[13px] transition-colors',
              addressKey === CUSTOM
                ? 'border-safety bg-safety/5 font-semibold'
                : 'border-dashed border-border bg-card hover:border-ink/30'
            )}
          >
            <PencilLine
              className={cn(
                'size-4 shrink-0',
                addressKey === CUSTOM ? 'text-safety' : 'text-muted-foreground'
              )}
            />
            <span className="flex-1">自定义地址</span>
            <span
              className={cn(
                'grid size-4 shrink-0 place-items-center rounded-full border',
                addressKey === CUSTOM
                  ? 'border-safety bg-safety text-white'
                  : 'border-border text-transparent'
              )}
            >
              <Check className="size-2.5" />
            </span>
          </button>

          {addressKey === CUSTOM && (
            <textarea
              aria-label="自定义搅拌站地址"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="请输入搅拌站详细地址（省 / 市 / 区 / 详细位置）"
              rows={2}
              maxLength={60}
              className="animate-fade-in w-full resize-none border border-safety bg-card px-3 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground/60"
            />
          )}
        </div>
        {errors.address && <p className="mt-1 text-[11px] text-destructive">{errors.address}</p>}
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3" />
          地址信息用于为您匹配附近的搅拌站与实时报价
        </p>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="chamfer mt-1 w-full bg-safety py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98]"
      >
        {submitLabel}
      </button>
    </div>
  )
}
