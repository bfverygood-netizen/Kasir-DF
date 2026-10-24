'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Minus, PauseCircle, Plus, ShoppingBag, Tag, Trash2, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { CartItem, Product } from '@/lib/pos-types'
import { calculateLine, formatRupiah } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'
import { DiscountInput } from './discount-input'
import { usePos } from './pos-provider'

function CartLine({ item, product }: { item: CartItem; product: Product }) {
  const { updateQty, removeFromCart, setItemDiscount } = usePos()
  const [showDiscount, setShowDiscount] = useState(item.discount.value > 0)
  const line = calculateLine(item, product)

  return (
    <li className="rounded-xl border bg-card p-2.5">
      <div className="flex gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
          {product.image && <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
            <button
              type="button"
              onClick={() => removeFromCart(product.id)}
              className="-mt-0.5 -mr-0.5 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Hapus ${product.name}`}
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{formatRupiah(product.price)}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center rounded-lg border bg-muted/60">
              <button
                type="button"
                onClick={() => updateQty(product.id, item.qty - 1)}
                className="flex size-7 items-center justify-center rounded-l-lg text-foreground hover:bg-card"
                aria-label="Kurangi jumlah"
              >
                <Minus className="size-3.5" />
              </button>
              <label htmlFor={`qty-${product.id}`} className="sr-only">
                Jumlah {product.name}
              </label>
              <input
                id={`qty-${product.id}`}
                inputMode="numeric"
                value={item.qty}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/\D/g, ''))
                  if (!Number.isNaN(n) && n > 0) updateQty(product.id, n)
                }}
                className="h-7 w-9 bg-transparent text-center font-mono text-sm font-semibold outline-none"
              />
              <button
                type="button"
                onClick={() => updateQty(product.id, item.qty + 1)}
                className="flex size-7 items-center justify-center rounded-r-lg text-foreground hover:bg-card"
                aria-label="Tambah jumlah"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <div className="text-right">
              {line.discount > 0 && (
                <p className="font-mono text-[11px] text-muted-foreground line-through">{formatRupiah(line.gross)}</p>
              )}
              <p className="text-sm font-bold">{formatRupiah(line.net)}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowDiscount((v) => !v)}
        aria-expanded={showDiscount}
        className={cn(
          'mt-2 flex w-full items-center gap-1.5 rounded-md px-1 text-xs font-medium',
          line.discount > 0 ? 'text-success' : 'text-primary',
        )}
      >
        <Tag className="size-3" aria-hidden />
        {line.discount > 0 ? `Diskon item -${formatRupiah(line.discount)}` : 'Tambah diskon item'}
        <ChevronDown className={cn('ml-auto size-3.5 transition-transform', showDiscount && 'rotate-180')} aria-hidden />
      </button>
      {showDiscount && (
        <div className="mt-2">
          <DiscountInput
            id={`disc-${product.id}`}
            label={`Diskon ${product.name}`}
            value={item.discount}
            onChange={(d) => setItemDiscount(product.id, d)}
          />
        </div>
      )}
    </li>
  )
}

export function CartPanel({ onPay, onShowHeld }: { onPay: () => void; onShowHeld: () => void }) {
  const { cart, products, totals, clearCart, holdCurrent, held, totalDiscount, setTotalDiscount, taxEnabled, setTaxEnabled } =
    usePos()
  const [showTotalDiscount, setShowTotalDiscount] = useState(false)
  const empty = cart.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="flex-1">
          <h2 className="text-sm font-bold">Pesanan Saat Ini</h2>
          <p className="text-xs text-muted-foreground">
            {totals.qty} item · {cart.length} produk
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onShowHeld} className="relative">
          <PauseCircle data-icon="inline-start" />
          Parkir
          {held.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white">
              {held.length}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clearCart}
          disabled={empty}
          aria-label="Kosongkan keranjang"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-3">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <ShoppingBag className="size-6" aria-hidden />
            </div>
            <p className="text-sm font-semibold">Keranjang masih kosong</p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Klik produk di katalog atau scan barcode untuk menambahkan ke pesanan.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              return product ? <CartLine key={item.productId} item={item} product={product} /> : null
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t px-4 py-3">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowTotalDiscount((v) => !v)}
            aria-expanded={showTotalDiscount}
            className="flex w-full items-center gap-1.5 text-xs font-semibold text-primary"
          >
            <Tag className="size-3.5" aria-hidden />
            Diskon Total Transaksi
            <ChevronDown className={cn('ml-auto size-3.5 transition-transform', showTotalDiscount && 'rotate-180')} aria-hidden />
          </button>
          {showTotalDiscount && (
            <DiscountInput id="total-discount" label="Diskon total" value={totalDiscount} onChange={setTotalDiscount} />
          )}
          <div className="flex items-center justify-between">
            <label htmlFor="tax-switch" className="text-xs font-semibold">
              PPN 11%
            </label>
            <Switch id="tax-switch" checked={taxEnabled} onCheckedChange={(v) => setTaxEnabled(v)} />
          </div>
        </div>

        <dl className="space-y-1.5 rounded-xl bg-muted/60 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-mono font-medium">{formatRupiah(totals.subtotal)}</dd>
          </div>
          {totals.itemDiscounts > 0 && (
            <div className="flex justify-between text-xs">
              <dt className="text-muted-foreground">Termasuk diskon item</dt>
              <dd className="font-mono text-success">-{formatRupiah(totals.itemDiscounts)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Diskon{totalDiscount.type === 'percent' && totalDiscount.value ? ` (${totalDiscount.value}%)` : ''}
            </dt>
            <dd className={cn('font-mono font-medium', totals.orderDiscount > 0 && 'text-success')}>
              -{formatRupiah(totals.orderDiscount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Pajak (PPN 11%)</dt>
            <dd className="font-mono font-medium">{formatRupiah(totals.tax)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-dashed pt-2">
            <dt className="font-semibold">Total Bayar</dt>
            <dd className="text-xl font-extrabold tracking-tight text-primary">{formatRupiah(totals.total)}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="outline" size="lg" onClick={() => holdCurrent()} disabled={empty} className="h-12">
            <PauseCircle data-icon="inline-start" />
            Hold
          </Button>
          <Button size="lg" onClick={onPay} disabled={empty} className="h-12 text-base font-bold shadow-md shadow-primary/25">
            <Wallet data-icon="inline-start" />
            Bayar {!empty && formatRupiah(totals.total)}
          </Button>
        </div>
      </div>
    </div>
  )
}
