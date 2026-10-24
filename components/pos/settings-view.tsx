'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { usePos } from './pos-provider'

export function SettingsView() {
  const { settings, updateSettings, setTaxEnabled } = usePos()
  const [draft, setDraft] = useState(settings)

  const field = (key: 'storeName' | 'address' | 'phone' | 'cashier' | 'receiptFooter', label: string) => (
    <div className="grid gap-2">
      <Label htmlFor={`set-${key}`}>{label}</Label>
      <Input id={`set-${key}`} value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} />
    </div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <form
        className="mx-auto max-w-3xl space-y-5 p-4 lg:p-6"
        onSubmit={(e) => {
          e.preventDefault()
          updateSettings(draft)
          setTaxEnabled(draft.taxEnabledByDefault)
          toast.success('Pengaturan disimpan')
        }}
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight">Pengaturan</h2>
          <p className="text-sm text-muted-foreground">Atur informasi toko, kasir, dan struk.</p>
        </div>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Informasi Toko</h3>
          {field('storeName', 'Nama Toko')}
          {field('address', 'Alamat')}
          {field('phone', 'No. Telepon')}
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Kasir & Transaksi</h3>
          {field('cashier', 'Nama Kasir')}
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-3">
            <div>
              <Label htmlFor="set-tax">Aktifkan PPN 11% secara default</Label>
              <p className="text-xs text-muted-foreground">Pajak otomatis diterapkan di setiap transaksi baru.</p>
            </div>
            <Switch
              id="set-tax"
              checked={draft.taxEnabledByDefault}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, taxEnabledByDefault: v }))}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Struk</h3>
          {field('receiptFooter', 'Pesan Footer Struk')}
        </section>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save data-icon="inline-start" />
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  )
}
