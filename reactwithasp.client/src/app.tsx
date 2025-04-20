import { NavigationProgress } from '@/components/navigation-progress'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import AuthLayout from '@/layouts/auth'
import ProtectedLayout from '@/layouts/protected'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'

const HomePage = lazy(() => import('@/pages/home'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))
const SignInPage = lazy(() => import('@/pages/(auth)/signin'))
const SignUpPage = lazy(() => import('@/pages/(auth)/signup'))
const VerifyPage = lazy(() => import('@/pages/(auth)/verify'))
const MessagesPage = lazy(() => import('@/pages/messages'))

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    const appTitle = 'Relic'

    const pageTitles: Record<string, string> = {
      '/': 'Home',
      '/signin': 'Sign In',
      '/signup': 'Sign Up',
      '/verify': 'Verification',
      '/messages': 'Messages',
      '*': 'Page Not Found',
    }

    const path = location.pathname
    document.title = `${pageTitles[path] || pageTitles['*']} | ${appTitle}`
  }, [location])

  return (
    <>
      <NavigationProgress />
      <Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify" element={<VerifyPage />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/messages" element={<MessagesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
