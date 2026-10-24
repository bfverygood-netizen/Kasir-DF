'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Barcode, Package, Plus, Search, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/pos-data'
import type { Category, Product } from '@/lib/pos-types'
import { formatRupiah } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'
import { usePos } from './pos-provider'

type Filter = 'Semua' | Category

function ProductCard({ product, inCart, onAdd }: { product: Product; inCart: number; onAdd: () => void }) {
  const out = product.stock === 0
  const low = !out && product.stock <= 5

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={out}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
        inCart > 0 && 'border-primary ring-1 ring-primary',
        out && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1536px) 15vw, (min-width: 1024px) 20vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/50">
            <Package className="size-10" aria-hidden />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-card/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
          {product.category}
        </span>
        {inCart > 0 && (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
            {inCart}
          </span>
        )}
        {out && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
            <span className="rounded-md bg-card px-2 py-1 text-xs font-bold text-destructive">Stok Habis</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
        <p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <Barcode className="size-3" aria-hidden />
          {product.barcode}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div>
            <p className="text-sm font-bold text-primary">{formatRupiah(product.price)}</p>
            <p
              className={cn(
                'text-[11px] font-medium',
                out ? 'text-destructive' : low ? 'text-warning' : 'text-muted-foreground',
              )}
            >
              Stok: {product.stock}
              {low && ' · Menipis'}
            </p>
          </div>
          <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Plus className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  )
}

export function ProductCatalog() {
  const { products, cart, addToCart } = usePos()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('Semua')
  const deferredQuery = useDeferredValue(query)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    return products.filter((p) => {
      if (filter !== 'Semua' && p.category !== filter) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.category.toLowerCase().includes(q)
    })
  }, [products, deferredQuery, filter])

  const counts = useMemo(() => {
    const map: Record<string, number> = { Semua: products.length }
    for (const c of CATEGORIES) map[c] = products.filter((p) => p.category === c).length
    return map
  }, [products])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    const exact = products.find((p) => p.barcode === q)
    const target = exact ?? (filtered.length === 1 ? filtered[0] : null)
    if (target) {
      addToCart(target.id)
      setQuery('')
    }
  }

  return (
    <section aria-label="Katalog produk" className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b bg-card/60 px-4 py-3 lg:px-6">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="product-search" className="sr-only">
            Cari produk atau scan barcode
          </label>
          <input
            id="product-search"
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('')
            }}
            placeholder="Cari nama produk, kategori, atau scan barcode..."
            autoComplete="off"
            className="h-11 w-full rounded-xl border bg-card pr-20 pl-10 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Hapus pencarian"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">
                /
              </kbd>
            )}
            <span className="rounded-md p-1.5 text-primary" aria-hidden>
              <Barcode className="size-4" />
            </span>
          </div>
        </form>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5" role="tablist" aria-label="Filter kategori">
          {(['Semua', ...CATEGORIES] as Filter[]).map((c) => {
            const active = filter === c
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(c)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {c}
                <span
                  className={cn(
                    'rounded px-1 text-[11px] font-semibold',
                    active ? 'bg-primary-foreground/20' : 'bg-muted',
                  )}
                >
                  {counts[c]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-24 lg:px-6 lg:pb-4">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Search className="size-6" aria-hidden />
            </div>
            <p className="font-semibold">Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">Coba kata kunci lain atau ubah filter kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                inCart={cart.find((c) => c.productId === p.id)?.qty ?? 0}
                onAdd={() => addToCart(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
