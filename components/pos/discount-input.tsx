'use client'

import type { Discount } from '@/lib/pos-types'
import { formatNumber, parseNumber } from '@/lib/pos-utils'
import { cn } from '@/lib/utils'

export function DiscountInput({
  value,
  onChange,
  id,
  label,
}: {
  value: Discount
  onChange: (value: Discount) => void
  id: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex shrink-0 rounded-lg border bg-muted p-0.5" role="radiogroup" aria-label={`Tipe ${label}`}>
        {(['nominal', 'percent'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={value.type === t}
            onClick={() => onChange({ type: t, value: t === 'percent' ? Math.min(value.value, 100) : value.value })}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
              value.type === t ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground',
            )}
          >
            {t === 'nominal' ? 'Rp' : '%'}
          </button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative flex-1">
        <input
          id={id}
          inputMode="numeric"
          value={value.value ? formatNumber(value.value) : ''}
          onChange={(e) => {
            let n = parseNumber(e.target.value)
            if (value.type === 'percent') n = Math.min(n, 100)
            onChange({ ...value, value: n })
          }}
          placeholder="0"
          className="h-8 w-full rounded-lg border bg-card px-2.5 pr-8 text-right font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
        />
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
          {value.type === 'percent' ? '%' : 'Rp'}
        </span>
      </div>
    </div>
  )
}
