import GithubMarkWhite from '@/assets/github-mark-white.svg'
import GithubMark from '@/assets/github-mark.svg'
import GoogleMark from '@/assets/google-mark.svg'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import api from '@/services/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError, HttpStatusCode } from 'axios'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import * as z from 'zod'

const formSchema = z.object({
  email: z.string().nonempty({
    message: 'Email address is required.',
  }),
  password: z.string().nonempty({
    message: 'Password is required.',
  }),
})

type FormSchema = z.infer<typeof formSchema>

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })
  const navigate = useNavigate()

  async function onSubmit(data: FormSchema) {
    try {
      // Make sure form data is not empty
      if (!data.email || !data.password) {
        toast.warning('Please fill in all required fields')
        return
      }

      const response = await api.post('/auth/signin', data)

      if (response.status === HttpStatusCode.Ok) {
        navigate(`/verify?token=${response.data.verifyToken}`)
        return
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.warning('Email address or password is incorrect.')
      } else {
        toast.error('An error occurred while signing up.')
      }
    }
  }

  async function GitHubSignIn() {
    toast.info('Coming soon.')
  }

  async function GoogleSignIn() {
    toast.info('Coming soon.')
  }

  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="bg-muted relative hidden h-svh flex-col p-6 md:flex md:p-10 dark:border-r">
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

      <div className="flex h-svh min-h-svh flex-col gap-4 overflow-y-scroll p-6 md:p-10">
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
            <div className="flex flex-col gap-3">
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Email address"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password"
                              disabled={form.formState.isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant={'ghost'}
                            size={'icon'}
                            className="absolute top-0 right-0 h-full px-3 hover:bg-inherit dark:hover:bg-inherit"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Eye className="size-4" />
                            ) : (
                              <EyeOff className="size-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? 'Hide password' : 'Show password'}
                            </span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting && (
                      <LoaderCircle className="animate-spin" />
                    )}
                    Continue
                  </Button>
                </div>
              </form>
            </Form>

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
}
