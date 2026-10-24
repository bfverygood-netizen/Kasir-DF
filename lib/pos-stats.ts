import type { Transaction } from './pos-types'
import { isSameDay } from './pos-utils'

export function dailySales(transactions: Transaction[], days = 7) {
  const now = new Date()
  const result: { day: string; date: Date; omzet: number; transaksi: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const list = transactions.filter((t) => isSameDay(new Date(t.date), date))
    result.push({
      day: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
      date,
      omzet: list.reduce((s, t) => s + t.total, 0),
      transaksi: list.length,
    })
  }
  return result
}

export function hourlySales(transactions: Transaction[]) {
  const buckets = Array.from({ length: 14 }, (_, i) => ({ jam: `${String(i + 8).padStart(2, '0')}:00`, omzet: 0 }))
  for (const t of transactions) {
    const h = new Date(t.date).getHours()
    const idx = h - 8
    if (idx >= 0 && idx < buckets.length) buckets[idx].omzet += t.total
  }
  return buckets
}

export function topProducts(transactions: Transaction[], limit = 5) {
  const map = new Map<string, { name: string; qty: number; omzet: number }>()
  for (const t of transactions) {
    for (const l of t.lines) {
      const cur = map.get(l.productId) ?? { name: l.name, qty: 0, omzet: 0 }
      cur.qty += l.qty
      cur.omzet += l.total
      map.set(l.productId, cur)
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
}

export function paymentBreakdown(transactions: Transaction[]) {
  const labels: Record<string, string> = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer', ewallet: 'E-Wallet' }
  const map = new Map<string, { method: string; key: string; total: number; count: number }>()
  for (const t of transactions) {
    const cur = map.get(t.payment.type) ?? { method: labels[t.payment.type], key: t.payment.type, total: 0, count: 0 }
    cur.total += t.total
    cur.count += 1
    map.set(t.payment.type, cur)
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

export function todayTransactions(transactions: Transaction[]) {
  const now = new Date()
  return transactions.filter((t) => isSameDay(new Date(t.date), now))
}
