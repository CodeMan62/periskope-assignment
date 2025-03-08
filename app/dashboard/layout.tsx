import { ReactNode } from 'react'
import Sidebar from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-10 ml-16">
        <div className="flex items-center justify-between h-full px-4">
          <h1 className="text-xl font-semibold">Periskope</h1>
        </div>
      </header>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-16">
          {children}
        </main>
      </div>
    </div>
  )
} 
