import { EyeIcon, EyeOffIcon, LogInIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    // <div className="grid min-h-svh md:grid-cols-2">
    //   <div className="bg-muted relative hidden h-screen flex-col p-10 md:flex dark:border-r">
    //     <div className="relative z-20 flex items-center text-lg font-medium">
    //       <Link to={'/'}>
    //         <Logo className="size-9" />
    //       </Link>
    //     </div>
    //     <div className="relative z-20 mt-auto">
    //       <blockquote className="space-y-2">
    //         <p className="text-lg">
    //           "The single biggest problem in communication is the illusion that
    //           it has taken place."
    //         </p>
    //         <div className="text-sm">George Bernard Shaw</div>
    //       </blockquote>
    //     </div>
    //   </div>

    //   <div className="flex flex-col gap-4 p-6 md:p-10 h-screen overflow-y-scroll">
    //     <div className="flex flex-1 items-center justify-center">
    //       <div className="flex w-full max-w-xs flex-col gap-6">
    //         <div className="relative z-20 flex items-center justify-center text-lg font-medium md:hidden">
    //           <Link to={'/'}>
    //             <Logo className="size-9" />
    //           </Link>
    //         </div>
    //         <div className="flex flex-col items-center gap-2 text-center">
    //           <h1 className="text-2xl font-bold">Sign in to Relic</h1>
    //           {/* <p className="text-muted-foreground text-sm text-balance">
    //               Enter your email below to sign in to your account
    //             </p> */}
    //         </div>
    //         <div className="flex flex-col gap-2">
    //           <Button
    //             variant="outline"
    //             className="w-full"
    //             onClick={GoogleSignIn}
    //           >
    //             <img src={GoogleMark} className="size-4" />
    //             Continue with Google
    //           </Button>
    //           <Button
    //             variant="outline"
    //             className="w-full"
    //             onClick={GitHubSignIn}
    //           >
    //             <img src={GithubMark} className="size-4 dark:hidden" />
    //             <img
    //               src={GithubMarkWhite}
    //               className="hidden size-4 dark:block"
    //             />
    //             Continue with GitHub
    //           </Button>
    //         </div>

    //         <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
    //           <span className="bg-background text-muted-foreground relative z-10 px-2">
    //             or
    //           </span>
    //         </div>

    //         <form className="flex flex-col gap-6">
    //           <div className="grid gap-6">
    //             <div className="grid gap-2">
    //               <Label htmlFor="email">Email address</Label>
    //               <Input
    //                 id="email"
    //                 type="email"
    //                 placeholder="Email address"
    //                 required
    //               />
    //             </div>
    //             <div className="grid gap-2">
    //               <div className="flex items-center">
    //                 <Label htmlFor="password">Password</Label>
    //               </div>
    //               <div className="relative">
    //                 <Input
    //                   id="password"
    //                   type={showPassword ? 'text' : 'password'}
    //                   placeholder="Password"
    //                   required
    //                 />
    //                 <Button
    //                   type="button"
    //                   variant="ghost"
    //                   size="sm"
    //                   className="absolute top-0 right-0 h-full px-3"
    //                   onClick={() => setShowPassword(!showPassword)}
    //                 >
    //                   {showPassword ? (
    //                     <EyeIcon className="size-4" />
    //                   ) : (
    //                     <EyeOffIcon className="size-4" />
    //                   )}
    //                   <span className="sr-only">
    //                     {showPassword ? 'Hide password' : 'Show password'}
    //                   </span>
    //                 </Button>
    //               </div>
    //             </div>
    //             <Button type="submit" className="w-full">
    //               Sign In
    //             </Button>
    //           </div>
    //         </form>

    //         <div className="text-center text-sm">
    //           <Link to={'/forgot-password'} className="underline">
    //             Forgot your password?
    //           </Link>
    //         </div>

    //         <div className="text-center text-sm">
    //           Don't have an account?{' '}
    //           <Link to={'/signup'} className="underline">
    //             Sign up for Relic
    //           </Link>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <form>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative z-20 flex items-center text-lg font-medium">
                  <Link to={'/'}>
                    <Logo className="size-9" />
                  </Link>
                </div>
                <h1 className="text-2xl font-bold">Welcome to Relic</h1>
              </div>
              <div className="flex flex-col gap-6">
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
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Password</Label>
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
                  Sign Up
                </Button>
              </div>
            </div>
          </form>

          <div className="text-muted-foreground text-center text-sm text-balance">
            By clicking continue, you agree to our{' '}
            <Link
              to={'/terms-of service'}
              className="hover:text-foreground underline underline-offset-2"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to={'privacy-policy'}
              className="hover:text-foreground underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </div>

          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>

          <div className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <Link
              to={'/signin'}
              className="text-foreground underline underline-offset-2"
            >
              Sign in here.
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
