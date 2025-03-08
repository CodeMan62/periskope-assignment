'use client'

import Custom404 from '@/components/ui/404-page'

export default function NotFound() {
  return (
    <Custom404
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      buttonText="Go to Home"
    />
  )
} 
