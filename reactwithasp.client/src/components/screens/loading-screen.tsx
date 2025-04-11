import { useEffect, useState } from 'react'

import Logo from '@/components/logo'
import { cn } from '@/lib/utils'

export default function LoadingScreen() {
  const [isUnmounting, setIsUnmounting] = useState(false)

  useEffect(() => {
    return () => {
      setIsUnmounting(true)
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed top-0 right-0 left-0 z-50 flex min-h-svh shrink-0 touch-manipulation overflow-hidden opacity-100 transition-all duration-200 ease-in select-none',
        isUnmounting && 'opacity-0',
      )}
    >
      <Logo
        className={cn(
          'absolute top-[50svh] left-[50svw] size-24 -translate-1/2 scale-100 transition-all duration-200 ease-in',
          isUnmounting && 'scale-200',
        )}
      />
    </div>
  )
}
