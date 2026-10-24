'use client'

import { BarChart3, LayoutDashboard, Package, Settings, ShoppingCart, Store } from 'lucide-react'
import type { View } from '@/lib/pos-types'
import { cn } from '@/lib/utils'
import { usePos } from './pos-provider'

export const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transaksi', label: 'Transaksi', icon: ShoppingCart },
  { id: 'produk', label: 'Produk', icon: Package },
  { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
]

export function AppSidebar() {
  const { view, setView } = usePos()

  return (
    <aside className="hidden w-[88px] shrink-0 flex-col items-center border-r bg-sidebar py-4 md:flex">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <Store className="size-5" aria-hidden />
        <span className="sr-only">Kasir DF</span>
      </div>
      <nav aria-label="Navigasi utama" className="mt-8 flex w-full flex-1 flex-col items-center gap-1.5 px-2">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg transition-colors',
                  active && 'bg-primary text-primary-foreground shadow-sm shadow-primary/30',
                )}
              >
                <item.icon className="size-[18px]" aria-hidden />
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>
      <p className="text-[10px] font-medium text-muted-foreground">v1.0</p>
    </aside>
  )
}

export function MobileNav() {
  const { view, setView } = usePos()
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = view === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-1 py-2 text-[10px] font-medium',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="size-5" aria-hidden />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
