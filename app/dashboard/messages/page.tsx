'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Plus, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ChatArea from '@/components/chat/ChatArea'

interface User {
  id: string
  email: string
  full_name?: string | null
  created_at: string
}

interface Chat {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  last_message?: string
  other_user?: {
    id: string
    email: string
    full_name?: string
  }
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  useEffect(() => {
    fetchChats()

    // Set up realtime subscription for chats
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          console.log('Chat update:', payload)
          fetchChats() // Refresh chats when there's an update
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery)
    } else {
      setUsers([])
    }
  }, [searchQuery])

  const fetchChats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        *,
        other_user:users!chats_user2_id_fkey(id, email)
      `)
      .eq('user1_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching chats:', error)
      return
    }

    // Also fetch chats where the user is user2
    const { data: chats2, error: error2 } = await supabase
      .from('chats')
      .select(`
        *,
        other_user:users!chats_user1_id_fkey(id, email)
      `)
      .eq('user2_id', user.id)
      .order('created_at', { ascending: false })

    if (error2) {
      console.error('Error fetching chats2:', error2)
      return
    }

    // Combine and sort all chats
    const allChats = [...(chats || []), ...(chats2 || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    setChats(allChats)
  }

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUsers([])
      return
    }

    setIsSearching(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data: searchResults, error } = await supabase
        .from('users')
        .select('id, email, full_name, created_at')
        .neq('id', currentUser.id)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5)

      if (error) {
        console.error('Search error:', error)
        throw error
      }

      setUsers(searchResults || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const createChat = async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if chat already exists
    const { data: existingChat } = await supabase
      .from('chats')
      .select('*')
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),` +
        `and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
      )
      .single()

    if (existingChat) {
      setShowSearch(false)
      setSearchQuery('')
      return
    }

    // Create new chat
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert([
        {
          user1_id: user.id,
          user2_id: otherUserId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating chat:', error)
      return
    }

    if (newChat) {
      setChats([newChat, ...chats])
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat)
  }

  return (
    <div className="h-[calc(100vh-4rem)] pt-16 fixed inset-0 ml-16">
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Chats</h2>
              <Button
                onClick={() => setShowSearch(!showSearch)}
                variant="ghost"
                size="icon"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center border rounded-lg bg-gray-50">
                <Search className="h-4 w-4 ml-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  className="w-full p-2 pl-2 rounded-lg focus:outline-none bg-transparent"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearch(true)
                  }}
                />
              </div>
              
              {showSearch && (
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                  {isSearching ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Searching...
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    users.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b">
                          Search Results
                        </div>
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => createChat(user.id)}
                          >
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback>
                                {user.email.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {user.email}
                              </span>
                              {user.full_name && (
                                <span className="text-xs text-gray-500">
                                  {user.full_name}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No users found matching &quot;{searchQuery}&quot;
                      </div>
                    )
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Type at least 2 characters to search
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto flex-1">
            {chats.map((chat) => {
              const otherUserEmail = chat.other_user?.email || 'Unknown User'
              return (
                <div
                  key={chat.id}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b ${
                    selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => handleChatClick(chat)}
                >
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarFallback>
                      {otherUserEmail.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{otherUserEmail}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          {selectedChat ? (
            <ChatArea
              otherUser={selectedChat.other_user || { email: 'Unknown User' }}
              chatId={selectedChat.id}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Select a chat</h3>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
