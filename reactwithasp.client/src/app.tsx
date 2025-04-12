import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

import { ThemeProvider } from '@/components/providers/theme-provider'
import LoadingScreen from '@/components/screens/loading-screen'
import { Toaster } from '@/components/ui/sonner'
import AuthLayout from '@/layouts/auth'

const Home = lazy(() => import('@/pages/home'))
const NotFound = lazy(() => import('@/pages/not-found'))
const SignIn = lazy(() => import('@/pages/(auth)/sign-in'))
const SignUp = lazy(() => import('@/pages/(auth)/sign-up'))

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* <NavigationProgress /> */}
        <Suspense fallback={<LoadingScreen />}>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<AuthLayout />}>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
