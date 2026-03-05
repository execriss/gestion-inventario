'use client'

import { useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Menu,
  Bell,
  Box,
  LogOut,
  Loader2,
  ChevronRight,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth.actions'
import { SidebarNav, SidebarFooter } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, getInitials } from '@/lib/utils'
import { type UserInfo } from '@/components/layout/sidebar'

interface HeaderProps {
  user: UserInfo
  lowStockCount: number
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Productos',
  '/categories': 'Categorías',
  '/suppliers': 'Proveedores',
  '/movements': 'Historial',
  '/movements/ingreso': 'Ingresos',
  '/movements/egreso': 'Egresos',
  '/alerts': 'Alertas',
  '/reports': 'Reportes',
  '/settings': 'Configuración',
  '/settings/profile': 'Perfil',
  '/settings/organization': 'Organización',
  '/settings/members': 'Equipo',
}

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = []

  // Always start with Dashboard
  if (pathname !== '/dashboard') {
    crumbs.push({ label: 'Dashboard', href: '/dashboard' })
  }

  // Try to match the full path first, then the first segment
  if (ROUTE_LABELS[pathname]) {
    crumbs.push({ label: ROUTE_LABELS[pathname], href: pathname })
  } else {
    // For nested paths like /products/[id]
    const segments = pathname.split('/').filter(Boolean)
    let currentPath = ''
    for (const segment of segments) {
      currentPath += `/${segment}`
      if (ROUTE_LABELS[currentPath]) {
        crumbs.push({ label: ROUTE_LABELS[currentPath], href: currentPath })
      }
    }
  }

  return crumbs
}

export function Header({ user, lowStockCount }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const breadcrumbs = getBreadcrumbs(pathname)

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <div key={crumb.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Acciones rápidas */}
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            asChild
            size="sm"
            className="bg-neon-green/15 text-neon-green hover:bg-neon-green/25 border border-neon-green/30"
          >
            <Link href="/movements/ingreso">
              <ArrowDownToLine className="mr-1.5 size-4" aria-hidden="true" />
              Nuevo Ingreso
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/30"
          >
            <Link href="/movements/egreso">
              <ArrowUpFromLine className="mr-1.5 size-4" aria-hidden="true" />
              Nuevo Egreso
            </Link>
          </Button>
        </div>

        {/* Alertas de stock bajo */}
        {lowStockCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/alerts"
                className={cn(
                  'relative inline-flex items-center rounded-lg p-2',
                  'text-muted-foreground transition-colors hover:text-foreground'
                )}
                aria-label={`${lowStockCount} producto${lowStockCount !== 1 ? 's' : ''} con stock bajo`}
              >
                <Bell className="size-5" aria-hidden="true" />
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
                >
                  {lowStockCount > 99 ? '99+' : lowStockCount}
                </Badge>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              {lowStockCount} producto{lowStockCount !== 1 ? 's' : ''} con stock
              bajo
            </TooltipContent>
          </Tooltip>
        )}

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-9 rounded-full"
              aria-label="Menú de usuario"
            >
              <Avatar className="size-9">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback className="bg-primary/20 text-xs text-primary">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-destructive focus:text-destructive"
            >
              {isPending ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <LogOut className="mr-2 size-4" aria-hidden="true" />
              )}
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          {/* Header del sidebar mobile */}
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <Box
              className="size-7 text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="neon-text-cyan text-lg font-bold tracking-wider">
              INVENTARIO PRO
            </span>
          </div>

          <SidebarNav onNavigate={() => setMobileOpen(false)} lowStockCount={lowStockCount} />
          <SidebarFooter user={user} />
        </SheetContent>
      </Sheet>
    </>
  )
}
