import { cn } from '@/lib/utils'

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('fill-foreground', className)}
    >
      <path d="M0 221.125h512v68.267H0z" />
      <path d="M222.609 512V0h68.267v512z" />
      <path d="m17.342 353.494 443.405-256 34.134 59.121-443.405 256z" />
      <path d="m158.138 16.739 256 443.405-59.121 34.134-256-443.405z" />
    </svg>
  )
}
