'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createSeedTransactions, DEFAULT_SETTINGS, INITIAL_PRODUCTS } from '@/lib/pos-data'
import type {
  CartItem,
  Discount,
  HeldTransaction,
  PaymentInfo,
  Product,
  StoreSettings,
  Transaction,
  View,
} from '@/lib/pos-types'
import { calculateLine, calculateTotals, generateTransactionNumber } from '@/lib/pos-utils'

const EMPTY_DISCOUNT: Discount = { type: 'nominal', value: 0 }

type PosContextValue = {
  view: View
  setView: (view: View) => void
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  adjustStock: (productId: string, delta: number) => void
  cart: CartItem[]
  addToCart: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  setItemDiscount: (productId: string, discount: Discount) => void
  clearCart: () => void
  totalDiscount: Discount
  setTotalDiscount: (discount: Discount) => void
  taxEnabled: boolean
  setTaxEnabled: (enabled: boolean) => void
  totals: ReturnType<typeof calculateTotals>
  held: HeldTransaction[]
  holdCurrent: (label?: string) => void
  resumeHeld: (id: string) => void
  deleteHeld: (id: string) => void
  transactions: Transaction[]
  checkout: (payment: PaymentInfo, paid: number) => Transaction | null
  activeReceipt: Transaction | null
  setActiveReceipt: (trx: Transaction | null) => void
  settings: StoreSettings
  updateSettings: (patch: Partial<StoreSettings>) => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const PosContext = createContext<PosContextValue | null>(null)

export function PosProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>('transaksi')
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [cart, setCart] = useState<CartItem[]>([])
  const [totalDiscount, setTotalDiscount] = useState<Discount>(EMPTY_DISCOUNT)
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [taxEnabled, setTaxEnabled] = useState(DEFAULT_SETTINGS.taxEnabledByDefault)
  const [held, setHeld] = useState<HeldTransaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    createSeedTransactions(DEFAULT_SETTINGS.cashier),
  )
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const addToCart = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return
      const inCart = cart.find((c) => c.productId === productId)?.qty ?? 0
      if (inCart + 1 > product.stock) {
        toast.error(`Stok ${product.name} tidak mencukupi`)
        return
      }
      setCart((prev) => {
        const existing = prev.find((c) => c.productId === productId)
        if (existing) {
          return prev.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c))
        }
        return [...prev, { productId, qty: 1, discount: EMPTY_DISCOUNT }]
      })
    },
    [products, cart],
  )

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return
      if (qty <= 0) {
        setCart((prev) => prev.filter((c) => c.productId !== productId))
        return
      }
      if (qty > product.stock) {
        toast.error(`Stok ${product.name} tersisa ${product.stock}`)
        qty = product.stock
      }
      setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, qty } : c)))
    },
    [products],
  )

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }, [])

  const setItemDiscount = useCallback((productId: string, discount: Discount) => {
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, discount } : c)))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setTotalDiscount(EMPTY_DISCOUNT)
    setTaxEnabled(settings.taxEnabledByDefault)
  }, [settings.taxEnabledByDefault])

  const totals = useMemo(
    () => calculateTotals(cart, products, totalDiscount, taxEnabled),
    [cart, products, totalDiscount, taxEnabled],
  )

  const holdCurrent = useCallback(
    (label?: string) => {
      if (cart.length === 0) return
      const entry: HeldTransaction = {
        id: crypto.randomUUID(),
        label: label?.trim() || `Antrian #${held.length + 1}`,
        createdAt: new Date().toISOString(),
        items: cart,
        totalDiscount,
        taxEnabled,
      }
      setHeld((prev) => [entry, ...prev])
      clearCart()
      toast.success(`Transaksi diparkir sebagai "${entry.label}"`)
    },
    [cart, held.length, totalDiscount, taxEnabled, clearCart],
  )

  const resumeHeld = useCallback(
    (id: string) => {
      const entry = held.find((h) => h.id === id)
      if (!entry) return
      setHeld((prev) => {
        const rest = prev.filter((h) => h.id !== id)
        if (cart.length > 0) {
          return [
            {
              id: crypto.randomUUID(),
              label: `Antrian #${prev.length + 1}`,
              createdAt: new Date().toISOString(),
              items: cart,
              totalDiscount,
              taxEnabled,
            },
            ...rest,
          ]
        }
        return rest
      })
      setCart(entry.items)
      setTotalDiscount(entry.totalDiscount)
      setTaxEnabled(entry.taxEnabled)
      toast.success(`"${entry.label}" dilanjutkan`)
    },
    [held, cart, totalDiscount, taxEnabled],
  )

  const deleteHeld = useCallback((id: string) => {
    setHeld((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const checkout = useCallback(
    (payment: PaymentInfo, paid: number) => {
      if (cart.length === 0) return null
      const date = new Date()
      const lines = cart.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return []
        const line = calculateLine(item, product)
        return [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: item.qty,
            discountAmount: line.discount,
            total: line.net,
          },
        ]
      })
      const trx: Transaction = {
        id: crypto.randomUUID(),
        number: generateTransactionNumber(date),
        date: date.toISOString(),
        cashier: settings.cashier,
        lines,
        subtotal: totals.subtotal,
        totalDiscount: totals.orderDiscount,
        tax: totals.tax,
        total: totals.total,
        payment,
        paid,
        change: Math.max(0, paid - totals.total),
      }
      setProducts((prev) =>
        prev.map((p) => {
          const item = cart.find((c) => c.productId === p.id)
          return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
        }),
      )
      setTransactions((prev) => [trx, ...prev])
      clearCart()
      setCartOpen(false)
      setActiveReceipt(trx)
      return trx
    },
    [cart, products, settings.cashier, totals, clearCart],
  )

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: crypto.randomUUID() }])
  }, [])

  const adjustStock = useCallback((productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    )
  }, [])

  const updateSettings = useCallback((patch: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value: PosContextValue = {
    view,
    setView,
    products,
    addProduct,
    adjustStock,
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    setItemDiscount,
    clearCart,
    totalDiscount,
    setTotalDiscount,
    taxEnabled,
    setTaxEnabled,
    totals,
    held,
    holdCurrent,
    resumeHeld,
    deleteHeld,
    transactions,
    checkout,
    activeReceipt,
    setActiveReceipt,
    settings,
    updateSettings,
    cartOpen,
    setCartOpen,
  }

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>
}

export function usePos() {
  const ctx = useContext(PosContext)
  if (!ctx) throw new Error('usePos must be used within PosProvider')
  return ctx
}
