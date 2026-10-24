'use client'

import { useEffect, useState } from 'react'
import { Clock, Store } from 'lucide-react'
import { NAV_ITEMS } from './app-sidebar'
import { usePos } from './pos-provider'

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now)
    : '--.--.--'
  const date = now
    ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    : '\u00a0'

  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-1.5">
      <Clock className="size-4 text-primary" aria-hidden />
      <div className="leading-tight">
        <p className="font-mono text-sm font-semibold tabular-nums" aria-live="off">
          {time}
        </p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">{date}</p>
      </div>
    </div>
  )
}

export function AppHeader() {
  const { settings, view } = usePos()
  const current = NAV_ITEMS.find((n) => n.id === view)

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-4 lg:px-6">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground md:hidden">
        <Store className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-base font-bold tracking-tight">{settings.storeName}</h1>
          <span className="hidden rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-secondary-foreground sm:inline">
            {current?.label}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{settings.address}</p>
      </div>

      <LiveClock />

      <div className="hidden items-center gap-2.5 rounded-xl border bg-card py-1.5 pl-1.5 pr-3 sm:flex">
        <div className="relative">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
            ZK
          </div>
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-success" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{settings.cashier}</p>
          <p className="text-[11px] font-medium text-success">Kasir Aktif · Shift Pagi</p>
        </div>
      </div>
    </header>
  )
}
