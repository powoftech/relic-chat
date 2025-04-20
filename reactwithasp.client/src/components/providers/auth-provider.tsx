import api from '@/services/api'
import Cookies from 'js-cookie'
import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: string
  userName: string
  displayName: string
  email: string
  profilePictureUrl: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser(null)
      // Don't redirect here - let the layout components handle the redirection
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await api.post('/auth/signout', {
        refreshToken: Cookies.get('refresh_token'),
      })
      sessionStorage.removeItem('access_token')
      Cookies.remove('refresh_token')
      setUser(null)
      window.location.href = '/signin'
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
