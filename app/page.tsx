import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Home() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      redirect('/signin')
    }

    redirect('/dashboard/messages')
  } catch (error) {
    console.error('Error in Home page:', error)
    redirect('/signin')
  }
}
