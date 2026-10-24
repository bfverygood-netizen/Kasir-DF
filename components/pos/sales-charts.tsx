'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatRupiah } from '@/lib/pos-utils'

const compact = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}rb` : String(v))

const dailyConfig = {
  omzet: { label: 'Omzet', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function DailySalesChart({ data }: { data: { day: string; omzet: number; transaksi: number }[] }) {
  return (
    <ChartContainer config={dailyConfig} className="aspect-auto h-[260px] w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={compact} />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)' }}
          content={<ChartTooltipContent formatter={(v) => formatRupiah(Number(v))} />}
        />
        <Bar dataKey="omzet" fill="var(--color-omzet)" radius={[8, 8, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ChartContainer>
  )
}

const hourlyConfig = {
  omzet: { label: 'Omzet', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function HourlySalesChart({ data }: { data: { jam: string; omzet: number }[] }) {
  return (
    <ChartContainer config={hourlyConfig} className="aspect-auto h-[220px] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillOmzet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-omzet)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-omzet)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="jam" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={compact} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatRupiah(Number(v))} />} />
        <Area dataKey="omzet" type="monotone" stroke="var(--color-omzet)" strokeWidth={2} fill="url(#fillOmzet)" />
      </AreaChart>
    </ChartContainer>
  )
}
