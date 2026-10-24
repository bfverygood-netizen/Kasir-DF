'use client'

import { useState } from 'react'
import { Clock, PauseCircle, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { calculateTotals, formatRupiah, formatTime } from '@/lib/pos-utils'
import { usePos } from './pos-provider'

export function HeldDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { held, products, resumeHeld, deleteHeld, holdCurrent, cart } = usePos()
  const [label, setLabel] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <PauseCircle className="size-5 text-warning" aria-hidden />
            Transaksi Diparkir
          </DialogTitle>
          <DialogDescription>Simpan sementara pesanan pelanggan dan lanjutkan kapan saja.</DialogDescription>
        </DialogHeader>

        {cart.length > 0 && (
          <form
            className="flex gap-2 border-b p-4"
            onSubmit={(e) => {
              e.preventDefault()
              holdCurrent(label)
              setLabel('')
            }}
          >
            <label htmlFor="hold-label" className="sr-only">
              Nama antrian
            </label>
            <input
              id="hold-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nama pelanggan / meja (opsional)"
              className="h-9 flex-1 rounded-lg border bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
            />
            <Button type="submit">Parkir Pesanan</Button>
          </form>
        )}

        <div className="max-h-[50vh] overflow-y-auto p-4">
          {held.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada transaksi yang diparkir.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {held.map((h) => {
                const t = calculateTotals(h.items, products, h.totalDiscount, h.taxEnabled)
                return (
                  <li key={h.id} className="flex items-center gap-3 rounded-xl border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{h.label}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" aria-hidden />
                        {formatTime(h.createdAt)} · {t.qty} item
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-primary">{formatRupiah(t.total)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteHeld(h.id)}
                      aria-label={`Hapus ${h.label}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        resumeHeld(h.id)
                        onOpenChange(false)
                      }}
                    >
                      <Play data-icon="inline-start" />
                      Lanjutkan
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
