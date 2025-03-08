'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Phone, Video, MoreVertical, Paperclip, Smile, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MessageActions from './MessageActions'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
  reply_to?: string | null
  chat_id: string
  reply_to_message?: {
    id: string
    content: string
    sender_id: string
  } | null
}

interface ChatAreaProps {
  otherUser: {
    email: string
    full_name?: string
  }
  chatId: string
}

export default function ChatArea({ otherUser, chatId }: ChatAreaProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          is_read,
          chat_id,
          reply_to,
          reply_to_message:reply_to (
            id,
            content,
            sender_id
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      // Transform the data to match the Message interface
      const transformedData = data?.map(msg => ({
        ...msg,
        reply_to_message: msg.reply_to_message?.[0] || null // Take first item if it's an array
      })) as Message[]

      setMessages(transformedData || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id)
      }
    })

    // Fetch existing messages
    fetchMessages()

    // Set up realtime subscription
    const channelName = `chat_messages_${chatId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Delete event:', payload)
          setMessages(current => 
            current.filter(msg => msg.id !== payload.old.id)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Insert event:', payload)
          setMessages(current => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentUserId) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: currentUserId,
            content: message,
            reply_to: replyingTo?.id,
            created_at: new Date().toISOString(),
          }
        ])

      if (error) throw error
      setMessage('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Optimistically update UI
      setMessages(current => current.filter(msg => msg.id !== messageId))

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', currentUserId)

      if (error) {
        console.error('Error deleting message:', error)
        // Revert optimistic update if error occurs
        fetchMessages()
        throw error
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      // Revert optimistic update if error occurs
      fetchMessages()
    }
  }

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message)
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    if (input) {
      input.focus()
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-white border-b h-16 flex-shrink-0">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {otherUser.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-medium">{otherUser.full_name || otherUser.email}</h3>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f2f5]">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.sender_id === currentUserId;
          const isFirstInGroup = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;
          const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id;

          return (
            <div
              key={msg.id}
              className={`flex items-end ${
                isCurrentUser ? 'justify-end' : 'justify-start'
              } ${!isLastInGroup ? 'mb-1' : 'mb-3'}`}
            >
              {!isCurrentUser && isFirstInGroup && (
                <Avatar className="h-6 w-6 flex-shrink-0 mb-2 mr-2">
                  <AvatarFallback>
                    {otherUser.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              {!isCurrentUser && !isFirstInGroup && (
                <div className="w-6 mr-2" /> /* Spacer for alignment */
              )}
              
              <div className="group relative max-w-[65%]">
                <div
                  className={`px-3 py-1.5 text-sm ${
                    isCurrentUser ? 'bg-[#0084ff] text-white' : 'bg-white'
                  } ${
                    isFirstInGroup && isLastInGroup
                      ? 'rounded-2xl'
                      : isFirstInGroup
                      ? isCurrentUser
                        ? 'rounded-t-2xl rounded-bl-2xl rounded-br-lg'
                        : 'rounded-t-2xl rounded-br-2xl rounded-bl-lg'
                      : isLastInGroup
                      ? isCurrentUser
                        ? 'rounded-b-2xl rounded-l-2xl rounded-tr-lg'
                        : 'rounded-b-2xl rounded-r-2xl rounded-tl-lg'
                      : isCurrentUser
                      ? 'rounded-l-2xl rounded-tr-lg rounded-br-lg'
                      : 'rounded-r-2xl rounded-tl-lg rounded-bl-lg'
                  }`}
                >
                  {msg.reply_to_message && (
                    <div className={`text-xs mb-1 ${
                      isCurrentUser ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      <div className="opacity-75">
                        {msg.reply_to_message.content}
                      </div>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                
                {isLastInGroup && (
                  <div className={`text-[10px] mt-1 ${
                    isCurrentUser ? 'text-right mr-1' : 'ml-1'
                  } text-gray-500`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
                
                <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isCurrentUser ? '-left-6' : '-right-6'
                }`}>
                  <MessageActions
                    onDelete={() => handleDeleteMessage(msg.id)}
                    onReply={() => handleReplyMessage(msg)}
                    onReact={() => {}}
                    isOwnMessage={isCurrentUser}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-0" />
      </div>

      <div className="fixed bottom-4 left-[calc(80px+320px)] right-4 bg-white rounded-full border shadow-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 px-4 py-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="rounded-full flex-shrink-0 hover:bg-gray-100"
          >
            <Paperclip className="h-[18px] w-[18px] text-[#0084ff]" />
          </Button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 py-2 bg-transparent focus:outline-none"
          />
          {!message.trim() ? (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="rounded-full flex-shrink-0 hover:bg-gray-100"
            >
              <Smile className="h-[18px] w-[18px] text-[#0084ff]" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full bg-[#0084ff] hover:bg-[#0084ff]/90 text-white flex-shrink-0 h-9 w-9"
            >
              <Send className="h-[18px] w-[18px]" />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
} 
