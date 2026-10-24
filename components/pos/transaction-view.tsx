'use client'

import { useState } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { formatRupiah } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'
import { CartPanel } from './cart-panel'
import { HeldDialog } from './held-dialog'
import { PaymentDialog } from './payment-dialog'
import { ProductCatalog } from './product-catalog'
import { usePos } from './pos-provider'

export function TransactionView() {
  const { totals, cartOpen, setCartOpen } = usePos()
  const [payOpen, setPayOpen] = useState(false)
  const [heldOpen, setHeldOpen] = useState(false)

  const openPay = () => setPayOpen(true)

  return (
    <div className="flex h-full min-h-0">
      <ProductCatalog />

      <aside aria-label="Keranjang" className="hidden w-[380px] shrink-0 border-l lg:block xl:w-[400px]">
        <CartPanel onPay={openPay} onShowHeld={() => setHeldOpen(true)} />
      </aside>

      {/* Mobile / tablet cart drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/30 backdrop-blur-xs transition-opacity lg:hidden',
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setCartOpen(false)}
        aria-hidden
      />
      <aside
        aria-label="Keranjang"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl transition-transform lg:hidden',
          cartOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b bg-card px-4 py-2">
          <span className="text-xs font-semibold text-muted-foreground">Keranjang</span>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Tutup keranjang"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <CartPanel onPay={openPay} onShowHeld={() => setHeldOpen(true)} />
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed inset-x-4 bottom-[72px] z-30 flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-xl shadow-primary/30 md:bottom-4 lg:hidden"
      >
        <span className="relative">
          <ShoppingCart className="size-5" aria-hidden />
          {totals.qty > 0 && (
            <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary">
              {totals.qty}
            </span>
          )}
        </span>
        <span className="text-sm font-semibold">Lihat Keranjang</span>
        <span className="ml-auto text-base font-bold">{formatRupiah(totals.total)}</span>
      </button>

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} />
      <HeldDialog open={heldOpen} onOpenChange={setHeldOpen} />
    </div>
  )
}
