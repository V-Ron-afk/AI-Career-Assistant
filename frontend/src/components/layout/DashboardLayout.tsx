import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface bg-grid-pattern">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: offset by top bar height */}
      <main className="flex-1 min-w-0 lg:ml-64 mt-14 lg:mt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  )
}