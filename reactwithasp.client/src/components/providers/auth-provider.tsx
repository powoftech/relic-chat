import api, { getAccessToken, setAccessToken } from '@/services/api'
import Cookies from 'js-cookie'
import { createContext, useContext, useEffect, useState } from 'react'

export type User = {
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
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refreshUser() {
    setIsLoading(true)
    try {
      if (!Cookies.get('refresh_token')) {
        setUser(null)
        return null
      }

      if (!getAccessToken()) {
        const response = await api.post('/auth/refresh', {
          refreshToken: Cookies.get('refresh_token'),
        })
        const { accessToken, refreshToken } = response.data

        // Store in memory instead of sessionStorage
        setAccessToken(accessToken)

        Cookies.set('refresh_token', refreshToken, {
          expires: 7, // 7 days
          secure: true,
          sameSite: 'Strict',
        })
      }

      const response = await api.get('/auth/me')
      setUser(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    try {
      await api.post('/auth/signout', {
        refreshToken: Cookies.get('refresh_token'),
      })

      // Clear access token from memory
      setAccessToken(null)

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
