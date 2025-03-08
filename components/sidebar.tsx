"use client"

import { Home, MessageSquare, BarChart2, Users, FileText, Settings, Bell, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function Sidebar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <div className="w-16 bg-white flex flex-col items-center py-4 border-r min-h-screen fixed">
      <div className="mb-6">
        <Avatar className="h-10 w-10 bg-emerald-100">
          <AvatarImage src="/placeholder.svg" alt="Company logo" />
          <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold">F2</AvatarFallback>
        </Avatar>
      </div>

      <nav className="flex flex-col items-center gap-4 flex-1">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/messages">
          <Button
            variant="ghost"
            size="icon"
            className="text-emerald-600 hover:bg-emerald-100 bg-emerald-100"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/analytics">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <BarChart2 className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/users">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Users className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/files">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <FileText className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>
        </Link>
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:bg-gray-100"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

