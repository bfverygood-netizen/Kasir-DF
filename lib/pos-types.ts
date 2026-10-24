export type Category = 'Minuman' | 'Makanan' | 'Snack' | 'Lainnya'

export type Product = {
  id: string
  name: string
  category: Category
  price: number
  stock: number
  barcode: string
  image?: string
}

export type DiscountType = 'nominal' | 'percent'

export type Discount = {
  type: DiscountType
  value: number
}

export type CartItem = {
  productId: string
  qty: number
  discount: Discount
}

export type PaymentType = 'cash' | 'qris' | 'transfer' | 'ewallet'

export type PaymentInfo = {
  type: PaymentType
  label: string
  detail?: string
}

export type TransactionLine = {
  productId: string
  name: string
  price: number
  qty: number
  discountAmount: number
  total: number
}

export type Transaction = {
  id: string
  number: string
  date: string
  cashier: string
  lines: TransactionLine[]
  subtotal: number
  totalDiscount: number
  tax: number
  total: number
  payment: PaymentInfo
  paid: number
  change: number
}

export type HeldTransaction = {
  id: string
  label: string
  createdAt: string
  items: CartItem[]
  totalDiscount: Discount
  taxEnabled: boolean
}

export type StoreSettings = {
  storeName: string
  address: string
  phone: string
  cashier: string
  taxEnabledByDefault: boolean
  receiptFooter: string
}

export type View = 'dashboard' | 'transaksi' | 'produk' | 'laporan' | 'pengaturan'
