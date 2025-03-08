import Image from 'next/image'
import { Button } from './button'
import { useRouter } from 'next/navigation'

interface Custom404Props {
  title: string
  description: string
  buttonText?: string
}

export default function Custom404({ title, description, buttonText = 'Go back' }: Custom404Props) {
  const router = useRouter()

  return (
    <div className="h-[calc(100vh-4rem)] pt-16 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/404.svg"
            alt="404 Illustration"
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        <Button 
          onClick={() => router.back()}
          variant="outline"
          className="px-6"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
} 
