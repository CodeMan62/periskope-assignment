export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Insert: {
          user1_id: string
          user2_id: string
          created_at?: string
          last_message?: string | null
          last_message_at?: string | null
        }
      }
    }
  }
} 
