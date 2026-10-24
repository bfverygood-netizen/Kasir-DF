'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Banknote, Check, CheckCircle2, Copy, Landmark, QrCode, RefreshCw, Smartphone, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { BANKS, EWALLETS } from '@/lib/pos-data'
import type { PaymentInfo, PaymentType } from '@/lib/pos-types'
import { formatNumber, formatRupiah, parseNumber, suggestCashAmounts } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'
import { usePos } from './pos-provider'

const METHODS: { id: PaymentType; label: string; desc: string; icon: typeof Banknote }[] = [
  { id: 'cash', label: 'Tunai', desc: 'Cash', icon: Banknote },
  { id: 'qris', label: 'QRIS', desc: 'Scan QR', icon: QrCode },
  { id: 'transfer', label: 'Transfer', desc: 'BCA · BRI · Mandiri', icon: Landmark },
  { id: 'ewallet', label: 'E-Wallet', desc: 'GoPay · OVO · DANA', icon: Smartphone },
]

const QRIS_SECONDS = 5 * 60

function QrisPanel({ total, onExpiredChange }: { total: number; onExpiredChange: (expired: boolean) => void }) {
  const [seconds, setSeconds] = useState(QRIS_SECONDS)
  const [ref] = useState(() => `QRIS-DF-${Date.now().toString(36).toUpperCase()}`)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const expired = seconds === 0
  useEffect(() => onExpiredChange(expired), [expired, onExpiredChange])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const progress = (seconds / QRIS_SECONDS) * 100

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-full max-w-[260px] rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-black tracking-tight">QRIS</span>
          <span className="text-[10px] font-medium text-muted-foreground">NMID: ID1026DF0001</span>
        </div>
        <div className={cn('relative mx-auto w-fit rounded-lg bg-white p-2', expired && 'opacity-20 blur-[2px]')}>
          <QRCodeSVG value={`00020101021226${ref}5204581253033605404${total}5802ID5908KASIR DF`} size={180} level="M" />
        </div>
        <p className="mt-3 text-xs font-semibold">KASIR DF</p>
        <p className="font-mono text-[10px] text-muted-foreground">{ref}</p>
      </div>

      <div className="w-full max-w-[260px]">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Timer className="size-3.5" aria-hidden />
            {expired ? 'QR kedaluwarsa' : 'Berlaku selama'}
          </span>
          <span className={cn('font-mono text-sm tabular-nums', seconds < 60 ? 'text-destructive' : 'text-primary')}>
            {mm}:{ss}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-[width] duration-1000 ease-linear', seconds < 60 ? 'bg-destructive' : 'bg-primary')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Minta pelanggan scan QR menggunakan aplikasi m-banking atau e-wallet apa pun.
      </p>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard?.writeText(text.replace(/\s/g, ''))
        setCopied(true)
        toast.success('Nomor rekening disalin')
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {copied ? 'Disalin' : 'Salin'}
    </Button>
  )
}

function PaymentContent({ onDone }: { onDone: () => void }) {
  const { totals, checkout } = usePos()
  const total = totals.total
  const [method, setMethod] = useState<PaymentType>('cash')
  const [cash, setCash] = useState(0)
  const [bank, setBank] = useState(BANKS[0].id)
  const [wallet, setWallet] = useState(EWALLETS[0].id)
  const [qrisKey, setQrisKey] = useState(0)
  const [qrisExpired, setQrisExpired] = useState(false)

  const change = cash - total
  const canPay =
    method === 'cash' ? cash >= total : method === 'qris' ? !qrisExpired : true

  const selectedBank = BANKS.find((b) => b.id === bank)!
  const selectedWallet = EWALLETS.find((w) => w.id === wallet)!

  const handlePay = () => {
    if (!canPay) return
    let payment: PaymentInfo
    switch (method) {
      case 'cash':
        payment = { type: 'cash', label: 'Tunai' }
        break
      case 'qris':
        payment = { type: 'qris', label: 'QRIS' }
        break
      case 'transfer':
        payment = { type: 'transfer', label: 'Transfer Bank', detail: selectedBank.name }
        break
      default:
        payment = { type: 'ewallet', label: 'E-Wallet', detail: selectedWallet.name }
    }
    const trx = checkout(payment, method === 'cash' ? cash : total)
    if (trx) {
      toast.success('Pembayaran berhasil', { description: trx.number })
      onDone()
    }
  }

  return (
    <div className="grid max-h-[90dvh] grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="border-b bg-primary px-5 py-4 text-primary-foreground">
        <DialogTitle className="text-sm font-medium text-primary-foreground/80">Total Pembayaran</DialogTitle>
        <p className="mt-0.5 text-3xl font-extrabold tracking-tight">{formatRupiah(total)}</p>
        <DialogDescription className="mt-1 text-xs text-primary-foreground/80">
          {totals.qty} item · Subtotal {formatRupiah(totals.subtotal)}
          {totals.orderDiscount > 0 && ` · Diskon ${formatRupiah(totals.orderDiscount)}`}
          {totals.tax > 0 && ` · PPN ${formatRupiah(totals.tax)}`}
        </DialogDescription>
      </div>

      <div className="grid min-h-0 overflow-y-auto md:grid-cols-[200px_1fr]">
        <div
          className="grid grid-cols-4 gap-2 border-b bg-muted/40 p-3 md:flex md:flex-col md:border-r md:border-b-0"
          role="radiogroup"
          aria-label="Metode pembayaran"
        >
          {METHODS.map((m) => {
            const active = method === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors md:flex-row md:text-left',
                  active ? 'border-primary bg-card text-primary shadow-sm ring-1 ring-primary' : 'bg-card/60 hover:bg-card',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
                  )}
                >
                  <m.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold md:text-sm">{m.label}</span>
                  <span className="hidden truncate text-[11px] text-muted-foreground md:block">{m.desc}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="min-h-[360px] p-5">
          {method === 'cash' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="cash-input" className="text-sm font-semibold">
                  Uang Diterima
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-muted-foreground">
                    Rp
                  </span>
                  <input
                    id="cash-input"
                    autoFocus
                    inputMode="numeric"
                    value={cash ? formatNumber(cash) : ''}
                    onChange={(e) => setCash(parseNumber(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) handlePay()
                    }}
                    placeholder="0"
                    className="h-14 w-full rounded-xl border-2 bg-card pr-4 pl-12 text-right font-mono text-2xl font-bold outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Nominal Cepat</p>
                <div className="grid grid-cols-3 gap-2">
                  {suggestCashAmounts(total).map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCash(amount)}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-sm font-semibold transition-colors',
                        cash === amount ? 'border-primary bg-secondary text-primary' : 'hover:border-primary/40',
                      )}
                    >
                      {amount === total ? 'Uang Pas' : formatRupiah(amount)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCash(0)}
                    className="rounded-lg border px-2 py-2 text-sm font-semibold text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center justify-between rounded-xl p-4',
                  cash === 0 ? 'bg-muted' : change >= 0 ? 'bg-success/10' : 'bg-destructive/10',
                )}
                aria-live="polite"
              >
                <span className="text-sm font-semibold">{change < 0 && cash > 0 ? 'Kurang' : 'Kembalian'}</span>
                <span
                  className={cn(
                    'font-mono text-2xl font-extrabold',
                    cash === 0 ? 'text-muted-foreground' : change >= 0 ? 'text-success' : 'text-destructive',
                  )}
                >
                  {formatRupiah(Math.abs(cash === 0 ? 0 : change))}
                </span>
              </div>
            </div>
          )}

          {method === 'qris' && (
            <div className="space-y-3">
              <QrisPanel key={qrisKey} total={total} onExpiredChange={setQrisExpired} />
              {qrisExpired && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => setQrisKey((k) => k + 1)}>
                    <RefreshCw data-icon="inline-start" />
                    Buat QR Baru
                  </Button>
                </div>
              )}
            </div>
          )}

          {method === 'transfer' && (
            <div className="space-y-4">
              <p className="text-sm font-semibold">Pilih Bank Tujuan</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Bank tujuan">
                {BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={bank === b.id}
                    onClick={() => setBank(b.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors',
                      bank === b.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40',
                    )}
                  >
                    <span
                      className="flex h-8 w-14 items-center justify-center rounded-md text-xs font-black tracking-tight text-white italic"
                      style={{ backgroundColor: b.color }}
                    >
                      {b.name}
                    </span>
                    <span className="text-xs font-semibold">Bank {b.name}</span>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Nomor Rekening {selectedBank.name}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-mono text-xl font-bold tracking-wide">{selectedBank.accountNumber}</p>
                  <CopyButton text={selectedBank.accountNumber} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  a.n. <span className="font-semibold text-foreground">{selectedBank.holder}</span>
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-dashed pt-3">
                  <span className="text-xs text-muted-foreground">Jumlah transfer</span>
                  <span className="font-mono font-bold text-primary">{formatRupiah(total)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pastikan dana sudah masuk ke rekening sebelum menekan tombol konfirmasi.
              </p>
            </div>
          )}

          {method === 'ewallet' && (
            <div className="space-y-4">
              <p className="text-sm font-semibold">Pilih E-Wallet</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="E-wallet">
                {EWALLETS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    role="radio"
                    aria-checked={wallet === w.id}
                    onClick={() => setWallet(w.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors',
                      wallet === w.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40',
                    )}
                  >
                    <span
                      className="flex size-10 items-center justify-center rounded-full text-base font-black text-white shadow-sm"
                      style={{ backgroundColor: w.color }}
                    >
                      {w.initial}
                    </span>
                    <span className="text-xs font-semibold">{w.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4">
                <div className="rounded-lg bg-white p-1.5">
                  <QRCodeSVG value={`${selectedWallet.id}://pay?merchant=KASIRDF&amount=${total}`} size={96} fgColor={selectedWallet.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: selectedWallet.color }}>
                    Bayar dengan {selectedWallet.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Scan QR atau kirim ke nomor merchant:</p>
                  <p className="font-mono text-sm font-bold">0812-3456-7890</p>
                  <p className="mt-1 font-mono text-sm font-bold text-primary">{formatRupiah(total)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t bg-card p-4">
        <Button variant="outline" size="lg" className="h-12" onClick={onDone}>
          Batal
        </Button>
        <Button size="lg" className="h-12 flex-1 text-base font-bold" disabled={!canPay} onClick={handlePay}>
          <CheckCircle2 data-icon="inline-start" />
          {method === 'cash' ? 'Bayar & Cetak Struk' : 'Konfirmasi Pembayaran'}
        </Button>
      </div>
    </div>
  )
}

export function PaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton={false}>
        {open && <PaymentContent onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
