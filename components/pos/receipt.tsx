'use client'

import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Printer, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { StoreSettings, Transaction } from '@/lib/pos-types'
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/pos-utils'
import { usePos } from './pos-provider'

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'text-[13px] font-bold' : ''}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export function Receipt({ trx, settings }: { trx: Transaction; settings: StoreSettings }) {
  const paymentLabel = trx.payment.detail ? `${trx.payment.label} (${trx.payment.detail})` : trx.payment.label

  return (
    <div className="mx-auto w-full max-w-[300px] bg-white font-mono text-[11px] leading-relaxed text-neutral-900">
      <div className="text-center">
        <p className="font-sans text-lg font-extrabold tracking-tight">{settings.storeName.toUpperCase()}</p>
        <p>{settings.address}</p>
        <p>Telp. {settings.phone}</p>
      </div>
      <div className="my-2 border-t border-dashed border-neutral-400" />
      <div className="space-y-0.5">
        <Row label="No. Transaksi" value={trx.number} />
        <Row label="Tanggal" value={formatDateTime(trx.date)} />
        <Row label="Kasir" value={trx.cashier} />
        <Row label="Metode Bayar" value={paymentLabel} />
      </div>
      <div className="my-2 border-t border-dashed border-neutral-400" />
      <ul className="space-y-1.5">
        {trx.lines.map((l) => (
          <li key={l.productId}>
            <p className="font-semibold">{l.name}</p>
            <div className="flex justify-between">
              <span>
                {l.qty} x {formatNumber(l.price)}
              </span>
              <span>{formatNumber(l.price * l.qty)}</span>
            </div>
            {l.discountAmount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>  Diskon</span>
                <span>-{formatNumber(l.discountAmount)}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="my-2 border-t border-dashed border-neutral-400" />
      <div className="space-y-0.5">
        <Row label="Subtotal" value={formatRupiah(trx.subtotal)} />
        {trx.totalDiscount > 0 && <Row label="Diskon" value={`-${formatRupiah(trx.totalDiscount)}`} />}
        {trx.tax > 0 && <Row label="PPN 11%" value={formatRupiah(trx.tax)} />}
        <div className="my-1 border-t border-neutral-300" />
        <Row label="TOTAL" value={formatRupiah(trx.total)} bold />
        <Row label={trx.payment.type === 'cash' ? 'Tunai' : 'Dibayar'} value={formatRupiah(trx.paid)} />
        <Row label="Kembalian" value={formatRupiah(trx.change)} />
      </div>
      <div className="my-2 border-t border-dashed border-neutral-400" />
      <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
        <QRCodeSVG value={`https://kasirdf.app/review/${trx.number}`} size={84} level="M" />
        <p className="font-semibold">Scan untuk beri ulasan</p>
        <p>{settings.receiptFooter}</p>
        <p className="text-neutral-500">— Powered by Kasir DF —</p>
      </div>
    </div>
  )
}

export function ReceiptDialog() {
  const { activeReceipt, setActiveReceipt, settings, setView } = usePos()

  return (
    <Dialog open={!!activeReceipt} onOpenChange={(open) => !open && setActiveReceipt(null)}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {activeReceipt && (
          <>
            <div className="flex items-center gap-3 border-b bg-success/10 px-5 py-4">
              <CheckCircle2 className="size-8 shrink-0 text-success" aria-hidden />
              <div>
                <DialogTitle className="text-base">Transaksi Berhasil</DialogTitle>
                <DialogDescription>
                  Kembalian:{' '}
                  <span className="font-bold text-foreground">{formatRupiah(activeReceipt.change)}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="max-h-[60dvh] overflow-y-auto bg-muted/60 p-5">
              <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <Receipt trx={activeReceipt} settings={settings} />
              </div>
            </div>
            <div className="flex gap-2 border-t p-4">
              <Button
                variant="outline"
                size="lg"
                className="h-11 flex-1"
                onClick={() => {
                  setActiveReceipt(null)
                  setView('transaksi')
                }}
              >
                <Plus data-icon="inline-start" />
                Transaksi Baru
              </Button>
              <Button size="lg" className="h-11 flex-1" onClick={() => window.print()}>
                <Printer data-icon="inline-start" />
                Cetak Struk
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ReceiptPrintArea() {
  const { activeReceipt, settings } = usePos()
  if (!activeReceipt) return null
  return (
    <div className="hidden print:block" aria-hidden>
      <Receipt trx={activeReceipt} settings={settings} />
    </div>
  )
}
