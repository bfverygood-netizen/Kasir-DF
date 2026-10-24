import type { CartItem, Discount, Product } from './pos-types'

export const TAX_RATE = 0.11

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number) {
  return rupiahFormatter.format(Math.round(value)).replace(/\u00a0/g, ' ')
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(Math.round(value))
}

export function parseNumber(input: string) {
  const digits = input.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

export function discountAmount(base: number, discount: Discount) {
  if (!discount.value || base <= 0) return 0
  if (discount.type === 'percent') {
    return Math.round((base * Math.min(discount.value, 100)) / 100)
  }
  return Math.min(discount.value, base)
}

export function calculateLine(item: CartItem, product: Product) {
  const gross = product.price * item.qty
  const disc = discountAmount(gross, item.discount)
  return { gross, discount: disc, net: gross - disc }
}

export function calculateTotals(
  items: CartItem[],
  products: Product[],
  totalDiscount: Discount,
  taxEnabled: boolean,
) {
  let subtotal = 0
  let itemDiscounts = 0
  let qty = 0
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue
    const line = calculateLine(item, product)
    subtotal += line.net
    itemDiscounts += line.discount
    qty += item.qty
  }
  const orderDiscount = discountAmount(subtotal, totalDiscount)
  const taxable = subtotal - orderDiscount
  const tax = taxEnabled ? Math.round(taxable * TAX_RATE) : 0
  return {
    subtotal,
    itemDiscounts,
    orderDiscount,
    taxable,
    tax,
    total: taxable + tax,
    qty,
  }
}

export function generateTransactionNumber(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `DF-${y}${m}${d}-${rand}`
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function suggestCashAmounts(total: number) {
  const denominations = [5000, 10000, 20000, 50000, 100000]
  const result = new Set<number>([total])
  for (const d of denominations) {
    const rounded = Math.ceil(total / d) * d
    if (rounded > total) result.add(rounded)
  }
  return Array.from(result)
    .sort((a, b) => a - b)
    .slice(0, 5)
}
