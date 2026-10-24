'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Minus, Package, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/lib/pos-data'
import type { Category } from '@/lib/pos-types'
import { formatNumber, formatRupiah, parseNumber } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'
import { usePos } from './pos-provider'

function AddProductDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addProduct } = usePos()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Makanan')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(0)
  const [barcode, setBarcode] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price <= 0) {
      toast.error('Nama dan harga wajib diisi')
      return
    }
    addProduct({
      name: name.trim(),
      category,
      price,
      stock,
      barcode: barcode || `899${Date.now().toString().slice(-10)}`,
    })
    toast.success(`${name} ditambahkan`)
    setName('')
    setPrice(0)
    setStock(0)
    setBarcode('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Tambah Produk</DialogTitle>
            <DialogDescription>Produk baru langsung tersedia di katalog kasir.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="np-name">Nama Produk</Label>
            <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Es Campur" />
          </div>
          <div className="grid gap-2">
            <Label>Kategori</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium',
                    category === c ? 'border-primary bg-secondary text-primary' : 'text-muted-foreground',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="np-price">Harga (Rp)</Label>
              <Input
                id="np-price"
                inputMode="numeric"
                value={price ? formatNumber(price) : ''}
                onChange={(e) => setPrice(parseNumber(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="np-stock">Stok Awal</Label>
              <Input
                id="np-stock"
                inputMode="numeric"
                value={stock ? String(stock) : ''}
                onChange={(e) => setStock(parseNumber(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="np-barcode">Barcode (opsional)</Label>
            <Input
              id="np-barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))}
              placeholder="Otomatis jika kosong"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Produk</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProductsView() {
  const { products, adjustStock } = usePos()
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q))
  }, [products, query])

  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const stockValue = products.reduce((s, p) => s + p.stock * p.price, 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Manajemen Produk</h2>
            <p className="text-sm text-muted-foreground">
              {products.length} produk · {formatNumber(totalStock)} stok · Nilai {formatRupiah(stockValue)}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Tambah Produk
          </Button>
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="border-b p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor="product-filter" className="sr-only">
                Cari produk
              </label>
              <Input
                id="product-filter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau barcode..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Produk</th>
                  <th className="px-4 py-2.5 font-semibold">Kategori</th>
                  <th className="px-4 py-2.5 font-semibold">Barcode</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Harga</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          {p.image ? (
                            <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                          ) : (
                            <Package className="m-2.5 size-5 text-primary/60" aria-hidden />
                          )}
                        </div>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.barcode}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatRupiah(p.price)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => adjustStock(p.id, -1)}
                          aria-label={`Kurangi stok ${p.name}`}
                        >
                          <Minus />
                        </Button>
                        <span
                          className={cn(
                            'w-12 rounded-md py-0.5 text-center font-mono text-sm font-bold',
                            p.stock === 0
                              ? 'bg-destructive/10 text-destructive'
                              : p.stock <= 5
                                ? 'bg-warning/15 text-warning'
                                : 'bg-muted',
                          )}
                        >
                          {p.stock}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => adjustStock(p.id, 1)}
                          aria-label={`Tambah stok ${p.name}`}
                        >
                          <Plus />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => adjustStock(p.id, 10)}>
                          +10
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
