import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

import { ThemeProvider } from '@/components/providers/theme-provider'
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
        <Toaster />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
