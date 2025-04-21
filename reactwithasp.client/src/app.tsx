import { NavigationProgress } from '@/components/navigation-progress'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import AuthLayout from '@/layouts/auth-layout'
import ProtectedLayout from '@/layouts/protected-layout'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'

const HomePage = lazy(() => import('@/pages/home-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))
const SignInPage = lazy(() => import('@/pages/(auth)/signin'))
const SignUpPage = lazy(() => import('@/pages/(auth)/signup'))
const VerifyPage = lazy(() => import('@/pages/(auth)/verify'))
const ChatsPage = lazy(() => import('@/pages/chats-page'))
const RequestsPage = lazy(() => import('@/pages/requests-page'))
const ArchivePage = lazy(() => import('@/pages/archive-page'))

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    const appTitle = 'Relic'

    const pageTitles: Record<string, string> = {
      '/': 'Home',
      '/signin': 'Sign In',
      '/signup': 'Sign Up',
      '/verify': 'Verification',
      '/chats': 'Chats',
      '/requests': 'Requests',
      '/archive': 'Archive',
      '/support': 'Support',
      '/feedback': 'Feedback',
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
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/archive" element={<ArchivePage />} />
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
      <AuthProvider>
        <Toaster closeButton richColors />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
