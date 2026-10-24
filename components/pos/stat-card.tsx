import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'primary' | 'success' | 'warning' | 'violet'
}) {
  const tones = {
    primary: 'bg-secondary text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning',
    violet: 'bg-chart-5/10 text-chart-5',
  }
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
      </div>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
