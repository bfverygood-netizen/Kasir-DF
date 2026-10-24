import type {
  Category,
  PaymentInfo,
  Product,
  StoreSettings,
  Transaction,
  TransactionLine,
} from './pos-types'

export const CATEGORIES: Category[] = ['Minuman', 'Makanan', 'Snack', 'Lainnya']

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p01', name: 'Es Jeruk', category: 'Minuman', price: 4000, stock: 48, barcode: '8991001000011', image: '/products/es-jeruk.png' },
  { id: 'p02', name: 'Es Teh Manis', category: 'Minuman', price: 3000, stock: 60, barcode: '8991001000028', image: '/products/es-teh.png' },
  { id: 'p03', name: 'Susu Segar', category: 'Minuman', price: 4000, stock: 32, barcode: '8991001000035', image: '/products/susu.png' },
  { id: 'p04', name: 'Kopi Hitam', category: 'Minuman', price: 5000, stock: 40, barcode: '8991001000042', image: '/products/kopi.png' },
  { id: 'p05', name: 'Jus Alpukat', category: 'Minuman', price: 10000, stock: 6, barcode: '8991001000059', image: '/products/jus-alpukat.png' },
  { id: 'p06', name: 'Soto Bathok', category: 'Makanan', price: 8500, stock: 25, barcode: '8991002000010', image: '/products/soto-bathok.png' },
  { id: 'p07', name: 'Ayam Goreng', category: 'Makanan', price: 15000, stock: 18, barcode: '8991002000027', image: '/products/ayam-goreng.png' },
  { id: 'p08', name: 'Pempek Palembang', category: 'Makanan', price: 11000, stock: 20, barcode: '8991002000034', image: '/products/pempek.png' },
  { id: 'p09', name: 'Nasi Goreng', category: 'Makanan', price: 13000, stock: 22, barcode: '8991002000041', image: '/products/nasi-goreng.png' },
  { id: 'p10', name: 'Mie Ayam', category: 'Makanan', price: 10000, stock: 4, barcode: '8991002000058', image: '/products/mie-ayam.png' },
  { id: 'p11', name: 'Tahu Isi', category: 'Snack', price: 2000, stock: 50, barcode: '8991003000019', image: '/products/tahu-isi.png' },
  { id: 'p12', name: 'Pisang Goreng', category: 'Snack', price: 2500, stock: 35, barcode: '8991003000026', image: '/products/pisang-goreng.png' },
  { id: 'p13', name: 'Tempe Mendoan', category: 'Snack', price: 2000, stock: 0, barcode: '8991003000033', image: '/products/mendoan.png' },
  { id: 'p14', name: 'Kerupuk', category: 'Lainnya', price: 1000, stock: 80, barcode: '8991004000018', image: '/products/kerupuk.png' },
  { id: 'p15', name: 'Air Mineral 600ml', category: 'Lainnya', price: 3000, stock: 72, barcode: '8991004000025', image: '/products/air-mineral.png' },
]

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Kasir DF',
  address: 'Jl. Malioboro No. 21, Yogyakarta',
  phone: '0812-3456-7890',
  cashier: '@zaykelz',
  taxEnabledByDefault: false,
  receiptFooter: 'Terima kasih telah berbelanja!',
}

export type BankAccount = {
  id: string
  name: string
  accountNumber: string
  holder: string
  color: string
}

export const BANKS: BankAccount[] = [
  { id: 'bca', name: 'BCA', accountNumber: '8720 1234 56', holder: 'PT Kasir DF Indonesia', color: '#0060AF' },
  { id: 'bri', name: 'BRI', accountNumber: '0021 0100 1234 567', holder: 'PT Kasir DF Indonesia', color: '#00529C' },
  { id: 'mandiri', name: 'Mandiri', accountNumber: '137 00 1234567 8', holder: 'PT Kasir DF Indonesia', color: '#003D79' },
]

export type EWallet = {
  id: string
  name: string
  color: string
  initial: string
}

export const EWALLETS: EWallet[] = [
  { id: 'gopay', name: 'GoPay', color: '#00AED6', initial: 'G' },
  { id: 'ovo', name: 'OVO', color: '#4C3494', initial: 'O' },
  { id: 'dana', name: 'DANA', color: '#118EEA', initial: 'D' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D', initial: 'S' },
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const SEED_PAYMENTS: PaymentInfo[] = [
  { type: 'cash', label: 'Tunai' },
  { type: 'cash', label: 'Tunai' },
  { type: 'qris', label: 'QRIS' },
  { type: 'transfer', label: 'Transfer Bank', detail: 'BCA' },
  { type: 'ewallet', label: 'E-Wallet', detail: 'GoPay' },
  { type: 'ewallet', label: 'E-Wallet', detail: 'DANA' },
  { type: 'ewallet', label: 'E-Wallet', detail: 'OVO' },
]

export function createSeedTransactions(cashier: string): Transaction[] {
  const rand = seededRandom(42)
  const now = new Date()
  const transactions: Transaction[] = []

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const count = dayOffset === 0 ? 9 : 10 + Math.floor(rand() * 10)
    for (let i = 0; i < count; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - dayOffset)
      const maxHour = dayOffset === 0 ? Math.max(8, now.getHours()) : 21
      const hour = 8 + Math.floor(rand() * (maxHour - 7))
      date.setHours(Math.min(hour, 21), Math.floor(rand() * 60), 0, 0)
      if (dayOffset === 0 && date > now) date.setTime(now.getTime() - (i + 1) * 600000)

      const lineCount = 1 + Math.floor(rand() * 3)
      const lines: TransactionLine[] = []
      for (let l = 0; l < lineCount; l++) {
        const product = INITIAL_PRODUCTS[Math.floor(rand() * INITIAL_PRODUCTS.length)]
        if (lines.some((x) => x.productId === product.id)) continue
        const qty = 1 + Math.floor(rand() * 3)
        lines.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty,
          discountAmount: 0,
          total: product.price * qty,
        })
      }
      const subtotal = lines.reduce((s, x) => s + x.total, 0)
      const payment = SEED_PAYMENTS[Math.floor(rand() * SEED_PAYMENTS.length)]
      const paid = payment.type === 'cash' ? Math.ceil(subtotal / 10000) * 10000 : subtotal
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      transactions.push({
        id: `seed-${dayOffset}-${i}`,
        number: `DF-${y}${m}${d}-${String(1000 + i * 37 + dayOffset * 7)}`,
        date: date.toISOString(),
        cashier,
        lines,
        subtotal,
        totalDiscount: 0,
        tax: 0,
        total: subtotal,
        payment,
        paid,
        change: paid - subtotal,
      })
    }
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date))
}
