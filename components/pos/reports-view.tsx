'use client'

import { useMemo, useState } from 'react'
import { Banknote, Eye, Landmark, QrCode, Receipt, Smartphone, Wallet, TrendingUp } from 'lucide-react'
import { dailySales, paymentBreakdown, todayTransactions } from '@/lib/pos-stats'
import { formatDateTime, formatRupiah } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'
import { usePos } from './pos-provider'
import { DailySalesChart } from './sales-charts'
import { StatCard } from './stat-card'

const METHOD_ICON = { cash: Banknote, qris: QrCode, transfer: Landmark, ewallet: Smartphone } as const

export function ReportsView() {
  const { transactions, setActiveReceipt } = usePos()
const [range, setRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('week')

  const daily = useMemo(() => dailySales(transactions, 7), [transactions])
const scoped = useMemo(() => {
  if (range === 'today') return todayTransactions(transactions)
  if (range === 'week') return transactions.filter(t => {
    const d = new Date((t as any).createdAt)
    return (Date.now() - d.getTime()) / 86400000 <= 7
  })
  if (range === 'month') return transactions.filter(t => {
    const d = new Date((t as any).createdAt)
    return (Date.now() - d.getTime()) / 86400000 <= 30
  })
  if (range === 'year') {
    const dNow = new Date()
    return transactions.filter(t => new Date((t as any).createdAt).getFullYear() === dNow.getFullYear())
  }   if (range === 'all') return transactions
  return transactions
}, [transactions, range])
  const omzet = scoped.reduce((s, t) => s + t.total, 0)
  const discount = scoped.reduce((s, t) => s + t.totalDiscount + t.lines.reduce((a, l) => a + l.discountAmount, 0), 0)
  const tax = scoped.reduce((s, t) => s + t.tax, 0)
  const breakdown = paymentBreakdown(scoped)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Laporan Penjualan</h2>
            <p className="text-sm text-muted-foreground">Pantau omzet, metode pembayaran, dan riwayat nota.</p>
          </div>
          <div className="flex rounded-xl border bg-card p-1" role="tablist" aria-label="Rentang laporan">
            {(
              [
                ['today', 'Hari Ini'],
                ['week', '7 Hari'],
                ['month', '30 hari'],
                ['year', '12 bulan']
                 
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={range === id}
                onClick={() => setRange(id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                  range === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Omzet" value={formatRupiah(omzet)} icon={Wallet} />
          <StatCard label="Jumlah Nota" value={String(scoped.length)} icon={Receipt} tone="success" />
          <StatCard label="Total Diskon" value={formatRupiah(discount)} icon={TrendingUp} tone="warning" />
          <StatCard label="PPN Terkumpul" value={formatRupiah(tax)} icon={Landmark} tone="violet" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card p-4 lg:col-span-2">
            <h3 className="font-semibold">Omzet Harian</h3>
            <p className="mb-3 text-xs text-muted-foreground">7 hari terakhir</p>
            <DailySalesChart data={daily} />
          </section>
          <section className="rounded-2xl border bg-card p-4">
            <h3 className="font-semibold">Metode Pembayaran</h3>
            <p className="mb-4 text-xs text-muted-foreground">Distribusi berdasarkan nilai transaksi</p>
            <ul className="space-y-4">
              {breakdown.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
              {breakdown.map((b) => {
                const Icon = METHOD_ICON[b.key as keyof typeof METHOD_ICON]
                const pct = omzet ? Math.round((b.total / omzet) * 100) : 0
                return (
                  <li key={b.key}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">{b.method}</span>
                          <span className="font-bold">{formatRupiah(b.total)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {b.count} transaksi · {pct}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Riwayat Transaksi</h3>
            <p className="text-xs text-muted-foreground">Klik baris untuk melihat & cetak ulang struk</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">No. Transaksi</th>
                  <th className="px-4 py-2.5 font-semibold">Waktu</th>
                  <th className="px-4 py-2.5 font-semibold">Item</th>
                  <th className="px-4 py-2.5 font-semibold">Metode</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-4 py-2.5">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scoped.slice(0, 50).map((t) => (
                  <tr key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setActiveReceipt(t)}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{t.number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(t.date)}</td>
                    <td className="px-4 py-3">{t.lines.reduce((s, l) => s + l.qty, 0)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {t.payment.detail ?? t.payment.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatRupiah(t.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveReceipt(t)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary"
                        aria-label={`Lihat struk ${t.number}`}
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
