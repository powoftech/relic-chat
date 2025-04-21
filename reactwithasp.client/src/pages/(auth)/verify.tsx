import Logo from '@/components/logo'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { sleep } from '@/lib/utils'
import api, { setAccessToken } from '@/services/api'
import { AxiosError, HttpStatusCode } from 'axios'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import * as jose from 'jose'
import { JWTInvalid } from 'jose/errors'
import Cookies from 'js-cookie'
import { MoveLeftIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

export default function VerifyPage() {
  const [email, setEmail] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(location.search)
      const tokenParam = urlParams.get('token')

      if (tokenParam === null) {
        navigate('/signin')
        return
      }

      setVerifyToken(tokenParam)
      const payload = jose.decodeJwt(tokenParam)
      const normalizedEmail = payload.sub?.toLowerCase()

      if (normalizedEmail === undefined) {
        navigate('/signin')
        return
      }

      setEmail(normalizedEmail)
    } catch (error) {
      if (!(error instanceof JWTInvalid)) {
        console.error(error)
      }
      navigate('/signin')
      return
    }
  }, [navigate])

  async function onSubmit(otp: string) {
    if (!otp || otp.length !== 6 || !verifyToken) return

    setIsSubmitting(true)
    try {
      const response = await api.post(`/auth/verify?token=${verifyToken}`, {
        otp,
      })

      if (response.status === HttpStatusCode.Ok) {
        const { accessToken, refreshToken } = response.data

        // Store in memory instead of sessionStorage
        setAccessToken(accessToken)

        Cookies.set('refresh_token', refreshToken, {
          expires: 7, // 7 days
          secure: true,
          sameSite: 'Strict',
        })

        toast.success('You will be redirected to homepage soon.')
        await refreshUser()
        await sleep(1000)
        return <Navigate to={'/'} replace />
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.warning('This code has been used or expired.')
      } else {
        console.error(error)
        toast.error('An error occurred during verification.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex h-fit w-full justify-between p-6 md:p-10">
        <div className="flex items-center justify-start">
          <Link to={'/'} className="flex h-9 w-auto items-center gap-3">
            <Logo className="size-9" />
          </Link>
        </div>
      </div>

      <div className="mx-auto flex h-[calc(100svh-5rem-1.5rem)] w-full items-center justify-center p-6 md:h-[calc(100svh-5rem-2.25rem)] md:p-10">
        <div className="flex max-w-md flex-col items-center justify-center gap-5">
          <h1 className="text-2xl font-bold">Verification</h1>
          <p className="text-muted-foreground text-center text-sm text-balance">
            We have sent a code to <b>{email}</b>. Please check your inbox and
            enter it below.
          </p>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            onComplete={onSubmit}
            disabled={isSubmitting}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            variant="link"
            onClick={() => {
              // Back to last history else redirect to sign in
              if (window.history.state?.idx > 0) navigate(-1)
              else navigate('/signin')
            }}
          >
            <MoveLeftIcon />
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
