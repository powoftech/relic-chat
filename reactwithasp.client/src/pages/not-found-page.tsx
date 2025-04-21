import { Link } from 'react-router'

import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <>
      <div className="flex min-h-svh w-full flex-col">
        <div className="m-auto flex h-full w-full max-w-sm flex-col items-center justify-center">
          <Logo className="size-9" />

          <span className="mt-4 text-lg font-bold">
            Sorry, this page isn't available
          </span>

          <span className="text-muted-foreground mt-3 text-center text-balance">
            The link you followed may be broken, or the page may have been
            removed.
          </span>

          <Button asChild className="mt-4">
            <Link to={'/'}>Back</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
