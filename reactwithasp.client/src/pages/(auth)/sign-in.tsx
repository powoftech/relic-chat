import { EyeIcon, EyeOffIcon, LogInIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import GithubMarkWhite from '@/assets/github-mark-white.svg'
import GithubMark from '@/assets/github-mark.svg'
import GoogleMark from '@/assets/google-mark.svg'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="bg-muted relative hidden h-screen flex-col p-6 md:flex md:p-10 dark:border-r">
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link to={'/'}>
            <Logo className="size-9" />
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "The single biggest problem in communication is the illusion that
              it has taken place."
            </p>
            <div className="text-sm">George Bernard Shaw</div>
          </blockquote>
        </div>
      </div>

      <div className="flex h-screen flex-col gap-4 overflow-y-scroll p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full flex-col gap-6 md:max-w-xs">
            <div className="flex flex-col gap-2">
              <div className="relative z-20 flex items-center justify-center text-lg font-medium md:hidden">
                <Link to={'/'}>
                  <Logo className="size-9" />
                </Link>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Sign in to Relic</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={GoogleSignIn}
              >
                <img src={GoogleMark} className="size-4" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={GitHubSignIn}
              >
                <img src={GithubMark} className="size-4 dark:hidden" />
                <img
                  src={GithubMarkWhite}
                  className="hidden size-4 dark:block"
                />
                Continue with GitHub
              </Button>
            </div>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                or
              </span>
            </div>

            <form className="flex flex-col gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeIcon className="size-4" />
                      ) : (
                        <EyeOffIcon className="size-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <LogInIcon />
                  Sign In
                </Button>
              </div>
            </form>

            <div className="text-center text-sm">
              <Link
                to={'/forgot-password'}
                className="underline underline-offset-2"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-muted-foreground text-center text-sm">
              Don't have an account?{' '}
              <Link
                to={'/signup'}
                className="text-foreground underline underline-offset-2"
              >
                Sign up for Relic
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  async function GitHubSignIn() {
    toast('Coming soon.')
  }

  async function GoogleSignIn() {
    toast('Coming soon.')
  }
}
