import { Link } from 'react-router'

import Logo from '@/components/logo'
import Mark from '@/components/mark'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <header className="mx-auto flex h-fit w-full justify-between p-6 md:p-10">
        <div className="flex items-center justify-start">
          <Link to={'/'} className="flex h-9 w-auto items-center gap-3">
            <Logo className="size-9" />
            <Mark className="h-6 w-auto" />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant={'ghost'} asChild>
            <Link to={'/sign-in'}>Sign in</Link>
          </Button>
          <Button asChild>
            <Link to={'/sign-up'}>Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100svh-5rem-1.5rem)] w-full items-center justify-between p-6 md:h-[calc(100svh-5rem-2.25rem)] md:p-10">
        <div className="flex flex-col justify-center">
          <h1 className="pb-2 text-4xl md:text-5xl">Chats for everyone</h1>
          <div className="text-muted-foreground pb-8 text-xl text-balance md:text-2xl">
            Connect, collaborate, and celebrate from anywhere with Relic
          </div>
        </div>
      </main>
    </div>
  )
}
