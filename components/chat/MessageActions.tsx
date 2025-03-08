'use client'

import { useState } from 'react'
import { MoreVertical, Trash2, Reply, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MessageActionsProps {
  onDelete: () => void
  onReply: () => void
  onReact: () => void
  isOwnMessage: boolean
}

export default function MessageActions({ onDelete, onReply, onReact, isOwnMessage }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={onReply} className="cursor-pointer">
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReact} className="cursor-pointer">
            <Smile className="mr-2 h-4 w-4" />
            React
          </DropdownMenuItem>
          {isOwnMessage && (
            <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 
