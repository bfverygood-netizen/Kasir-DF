'use client'

import { useMemo } from 'react'
import { AlertTriangle, ArrowRight, Package, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hourlySales, todayTransactions, topProducts } from '@/lib/pos-stats'
import { formatRupiah, formatTime } from '@/lib/pos-utils'
import { usePos } from './pos-provider'
import { HourlySalesChart } from './sales-charts'
import { StatCard } from './stat-card'

export function DashboardView() {
  const { transactions, products, setView, setActiveReceipt, settings } = usePos()
  const today = useMemo(() => todayTransactions(transactions), [transactions])
  const omzet = today.reduce((s, t) => s + t.total, 0)
  const items = today.reduce((s, t) => s + t.lines.reduce((a, l) => a + l.qty, 0), 0)
  const hourly = useMemo(() => hourlySales(today), [today])
  const top = useMemo(() => topProducts(today, 5), [today])
  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Halo, {settings.cashier}</h2>
            <p className="text-sm text-muted-foreground">Ringkasan performa toko hari ini.</p>
          </div>
          <Button onClick={() => setView('transaksi')}>
            <ShoppingCart data-icon="inline-start" />
            Mulai Transaksi
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Omzet Hari Ini" value={formatRupiah(omzet)} hint="Termasuk pajak" icon={Wallet} />
          <StatCard label="Transaksi" value={String(today.length)} hint="Nota berhasil" icon={Receipt} tone="success" />
          <StatCard label="Item Terjual" value={String(items)} hint="Total kuantitas" icon={Package} tone="violet" />
          <StatCard
            label="Rata-rata / Nota"
            value={formatRupiah(today.length ? omzet / today.length : 0)}
            hint="Average basket"
            icon={TrendingUp}
            tone="warning"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card p-4 lg:col-span-2">
            <div className="mb-3">
              <h3 className="font-semibold">Penjualan per Jam</h3>
              <p className="text-xs text-muted-foreground">Omzet hari ini berdasarkan jam transaksi</p>
            </div>
            <HourlySalesChart data={hourly} />
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="font-semibold">Produk Terlaris</h3>
            <p className="mb-3 text-xs text-muted-foreground">Berdasarkan jumlah terjual hari ini</p>
            <ol className="space-y-3">
              {top.length === 0 && <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>}
              {top.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(p.qty / top[0].qty) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{p.qty}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Transaksi Terakhir</h3>
              <Button variant="ghost" size="sm" onClick={() => setView('laporan')}>
                Lihat semua
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
            <ul className="divide-y">
              {transactions.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveReceipt(t)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Receipt className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm font-semibold">{t.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(t.date)} · {t.payment.detail ?? t.payment.label}
                      </p>
                    </div>
                    <span className="text-sm font-bold">{formatRupiah(t.total)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4 text-warning" aria-hidden />
              Stok Menipis
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">Produk dengan stok ≤ 5</p>
            <ul className="space-y-2">
              {lowStock.length === 0 && <p className="text-sm text-muted-foreground">Semua stok aman.</p>}
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? 'bg-destructive/10 text-destructive' : 'bg-warning/15 text-warning'}`}
                  >
                    {p.stock === 0 ? 'Habis' : `${p.stock} tersisa`}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-3 w-full" onClick={() => setView('produk')}>
              Kelola Stok
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}
