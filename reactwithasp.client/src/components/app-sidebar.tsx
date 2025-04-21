import Logo from '@/components/logo'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { useAuth } from '@/components/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Archive,
  ChevronsUpDown,
  LifeBuoy,
  LogOut,
  MessageCircle,
  MessageCircleMore,
  Send,
  Settings,
  Sparkles,
  Text,
} from 'lucide-react'
import { Link } from 'react-router'

const data = {
  navMain: [
    {
      title: 'Chats',
      url: '/chats',
      icon: MessageCircle,
    },
    {
      title: 'Requests',
      url: '/requests',
      icon: MessageCircleMore,
    },
    {
      title: 'Archive',
      url: '/archive',
      icon: Archive,
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '/support',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '/feedback',
      icon: Send,
    },
  ],
}

export default function AppSidebar({
  props,
}: {
  props?: React.ComponentProps<typeof Sidebar>
}) {
  const isMobile = useIsMobile()
  const { user, signOut } = useAuth()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size={'lg'} asChild>
              <Link to={'/'}>
                <div className="bg-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Logo className="fill-background size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Relic</span>
                  <span className="truncate text-xs">Personal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg select-none">
                    <AvatarImage
                      src={user?.profilePictureUrl}
                      alt={user?.userName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.userName
                        ? user.userName.substring(0, 1).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.displayName}
                    </span>
                    <span className="truncate text-xs">{user?.userName}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg select-none">
                      <AvatarImage
                        src={user?.profilePictureUrl}
                        alt={user?.userName}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.userName
                          ? user.userName.substring(0, 1).toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.displayName}
                      </span>
                      <span className="truncate text-xs">{user?.userName}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings />
                    Preferences
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to={'/terms-of-service'} className="cursor-pointer">
                      <Text />
                      Terms of Service
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={'/privacy-policy'}>
                      <Text />
                      Privacy Policy
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
