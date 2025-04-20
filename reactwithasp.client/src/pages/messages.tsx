import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'

export default function MessagesPage() {
  const { signOut } = useAuth()

  return (
    <div>
      <h1>Messages</h1>
      <p>This is the messages page.</p>

      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  )
}
