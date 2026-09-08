import { BatteryFull, CircleDot, MoreHorizontal, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 模拟小程序状态栏 */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 pb-1 pt-3',
        dark ? 'text-white' : 'text-ink'
      )}
    >
      <span className="font-display text-[13px] font-semibold tracking-wider">9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden>
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </div>
    </div>
  )
}

/** 微信小程序右上角胶囊按钮 */
export function Capsule({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex items-center gap-2 rounded-full border px-2.5 py-[5px]',
        dark ? 'border-white/30 bg-white/10 text-white' : 'border-ink/15 bg-white/70 text-ink',
        className
      )}
    >
      <MoreHorizontal className="size-4" />
      <span className={cn('h-3.5 w-px', dark ? 'bg-white/30' : 'bg-ink/15')} />
      <CircleDot className="size-3.5" />
    </div>
  )
}
