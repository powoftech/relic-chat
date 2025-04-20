import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import * as z from 'zod'

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
import { AxiosError, HttpStatusCode } from 'axios'
import { toast } from 'sonner'

const formSchema = z.object({
  email: z.string().email({ message: 'Email address is invalid.' }),
  userName: z
    .string()
    .min(2, { message: 'Username is too short.' })
    .max(30, { message: 'Username is too long.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    })
    .regex(/.*[a-zA-Z].*/, {
      message: 'Username must contain at least one letter.',
    }),
  displayName: z.string().min(2, { message: 'Display name is too short.' }),
  password: z.string().min(8, { message: 'Password is too short.' }),
})

type FormSchema = z.infer<typeof formSchema>

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: FormSchema) {
    try {
      const response = await api.post('/auth/signup', data)

      if (response.status === HttpStatusCode.Ok) {
        navigate(`/verify?token=${response.data.verifyToken}`)
        return
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.warning(error.response?.data.message)
      } else {
        toast.error('An error occurred while signing up.')
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative z-20 flex items-center text-lg font-medium">
              <Link to={'/'}>
                <Logo className="size-9" />
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Welcome to Relic</h1>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6">
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
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Username"
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
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Display name"
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
                              <EyeIcon className="size-4" />
                            ) : (
                              <EyeOffIcon className="size-4" />
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
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                  >
                    {form.formState.isSubmitting && (
                      <LoaderCircleIcon className="animate-spin" />
                    )}
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          <div className="text-muted-foreground text-center text-sm text-balance">
            By clicking continue, you agree to our{' '}
            <Link
              to={'/terms-of-service'}
              className="hover:text-foreground underline underline-offset-2"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to={'/privacy-policy'}
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
              Sign in here
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  )
}
