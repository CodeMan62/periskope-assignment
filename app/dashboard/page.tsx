'use client'

import { clearSupabaseSession } from '@/lib/supabase'

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to your dashboard!</p>
      <button 
        onClick={clearSupabaseSession}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
      >
        Sign Out
      </button>
    </div>
  )
} 
