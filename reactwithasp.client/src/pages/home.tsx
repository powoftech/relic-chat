import { KeyboardIcon, PlusIcon } from 'lucide-react'
import { Link } from 'react-router'

import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <header className="mx-auto flex h-fit w-full justify-between p-6 md:p-10">
        <div className="flex items-center justify-start">
          <Link to={'/'}>
            <Logo className="size-9" />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant={'ghost'} className="" asChild>
            <Link to={'/signup'}>Sign up</Link>
          </Button>
          <Button className="" asChild>
            <Link to={'/signin'}>Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100vh-4rem)] p-6 md:p-10">
        <div className="mb-24 flex max-w-4xl flex-col justify-center">
          <h1 className="pb-2 text-4xl md:text-5xl">Chats for everyone</h1>

          <div className="text-muted-foreground pb-8 text-xl text-balance md:text-2xl">
            Connect, collaborate, and celebrate from anywhere with Relic
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <Button className="md:w-fit">
              <PlusIcon />
              New chat
            </Button>

            <div className="flex gap-2">
              <div className="relative w-full md:min-w-80">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <KeyboardIcon className="text-muted-foreground size-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter a code or link"
                  className="pl-9"
                />
              </div>

              <Button variant={'ghost'} className="">
                Join
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
