import AppSidebar from '@/components/app-sidebar'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Link, Navigate, Outlet, useLocation } from 'react-router'

const protectedRoutes = [
  {
    title: 'Chats',
    url: '/chats',
  },
  {
    title: 'Requests',
    url: '/requests',
  },
  {
    title: 'Archive',
    url: '/archive',
  },
  {
    title: 'Support',
    url: '/support',
  },
  {
    title: 'Feedback',
    url: '/feedback',
  },
]

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={'/signin'} replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="">
                  <BreadcrumbLink asChild>
                    <Link to="/">
                      {protectedRoutes.find((route) =>
                        location.pathname.startsWith(route.url),
                      )?.title || 'Home'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
