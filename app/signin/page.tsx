'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else if (data?.session) {
        router.push('/dashboard/messages')
      }
    } catch (err) {
      console.log("We got this error: ", err)
      setError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png" // Add your logo
            alt="Logo"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">Log in to Periskope</h1>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your official email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue with Email'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-green-600 hover:underline">
            Sign up
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-gray-500">
          By signing up, you agree to Periskope&apos;s{' '}
          <a href="/terms" className="text-gray-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-gray-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
} 
