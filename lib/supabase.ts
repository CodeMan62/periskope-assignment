import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>()

// Add this function to clear session
export const clearSupabaseSession = async () => {
  await supabase.auth.signOut()
  // Clear local storage and cookies
  window.localStorage.clear()
  // Reload the page to ensure clean state
  window.location.reload()
}
