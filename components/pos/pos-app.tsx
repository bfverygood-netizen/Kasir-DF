'use client'

import { AppHeader } from './app-header'
import { AppSidebar, MobileNav } from './app-sidebar'
import { DashboardView } from './dashboard-view'
import { PosProvider, usePos } from './pos-provider'
import { ProductsView } from './products-view'
import { ReceiptDialog, ReceiptPrintArea } from './receipt'
import { ReportsView } from './reports-view'
import { SettingsView } from './settings-view'
import { TransactionView } from './transaction-view'

function CurrentView() {
  const { view } = usePos()
  switch (view) {
    case 'dashboard':
      return <DashboardView />
    case 'produk':
      return <ProductsView />
    case 'laporan':
      return <ReportsView />
    case 'pengaturan':
      return <SettingsView />
    default:
      return <TransactionView />
  }
}

export function PosApp() {
  return (
    <PosProvider>
      <div className="flex h-dvh overflow-hidden bg-background print:hidden">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="min-h-0 flex-1 overflow-hidden pb-14 md:pb-0">
            <CurrentView />
          </main>
        </div>
        <MobileNav />
      </div>
      <ReceiptDialog />
      <ReceiptPrintArea />
    </PosProvider>
  )
}
