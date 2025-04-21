import { useAuth } from '@/components/providers/auth-provider'
import { Navigate, Outlet } from 'react-router'

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={'/'} replace />
  }

  return <Outlet />
}
