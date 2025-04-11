import { createContext, useContext, useState } from 'react'

import LoadingScreen from '@/components/screens/loading-screen'

type LoadingProviderProps = {
  children: React.ReactNode
}

type LoadingProviderState = {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const initialState: LoadingProviderState = {
  isLoading: false,
  setIsLoading: () => null,
}

const LoadingProviderContext = createContext<LoadingProviderState>(initialState)

export function LoadingProvider({ children, ...props }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const value = {
    isLoading,
    setIsLoading: (isLoading: boolean) => setIsLoading(isLoading),
  }

  return (
    <LoadingProviderContext.Provider {...props} value={value}>
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingProviderContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingProviderContext)

  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }

  return context
}
