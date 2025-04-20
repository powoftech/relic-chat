import { useAuth } from '@/components/providers/auth-provider'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    }
  }, [isAuthenticated, navigate])

  return <Outlet />
}
