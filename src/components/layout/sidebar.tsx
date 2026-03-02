'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useTransition } from 'react'
import {
  Box,
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  BarChart3,
  BellRing,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface UserInfo {
  email: string
  fullName: string
  avatarUrl: string | null
  role: string
}

interface SidebarProps {
  user: UserInfo
  lowStockCount?: number
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: '/products',
    icon: Package,
  },
  {
    label: 'Categorias',
    href: '/categories',
    icon: Tag,
  },
  {
    label: 'Proveedores',
    href: '/suppliers',
    icon: Truck,
  },
  { type: 'separator' as const, label: 'Movimientos' },
  {
    label: 'Ingresos',
    href: '/movements/ingreso',
    icon: ArrowDownToLine,
    color: 'text-neon-green',
  },
  {
    label: 'Egresos',
    href: '/movements/egreso',
    icon: ArrowUpFromLine,
    color: 'text-destructive',
  },
  {
    label: 'Historial',
    href: '/movements',
    icon: History,
  },
  { type: 'separator' as const, label: 'Analisis' },
  {
    label: 'Alertas',
    href: '/alerts',
    icon: BellRing,
    color: 'text-amber-400',
  },
  {
    label: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
  { type: 'separator' as const, label: 'Sistema' },
  {
    label: 'Configuracion',
    href: '/settings',
    icon: Settings,
  },
] as const

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function SidebarNav({ onNavigate, lowStockCount = 0 }: { onNavigate?: () => void; lowStockCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, startTransition] = useTransition()

  // Pre-fetch todas las rutas al montar el sidebar para que la primera
  // navegacion sea instantanea (tambien pre-compila en modo desarrollo)
  useEffect(() => {
    NAV_ITEMS.forEach(item => {
      if ('href' in item) router.prefetch(item.href)
    })
  }, [router])

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    e.preventDefault()

    // Si ya estamos en esta ruta, no hacer nada
    if (pathname === href) return

    // Cerrar el sheet mobile si existe
    onNavigate?.()

    // useTransition marca la navegacion como no-urgente, lo que permite
    // que React muestre el loading.tsx skeleton inmediatamente sin congelar
    // la UI del sidebar. El usuario ve feedback visual instantaneo.
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegacion principal">
      {NAV_ITEMS.map((item, index) => {
        if ('type' in item && item.type === 'separator') {
          return (
            <div key={index} className="pb-1 pt-4">
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
            </div>
          )
        }

        if (!('href' in item)) return null

        const Icon = item.icon
        // Si otro item del nav es un sub-path más específico y coincide con
        // el pathname actual, usar match exacto para este item (evita que el
        // padre /movements se active cuando estamos en /movements/ingreso)
        const hasSiblingMatch = NAV_ITEMS.some(
          (other) =>
            'href' in other &&
            other.href !== item.href &&
            pathname.startsWith(other.href) &&
            other.href.startsWith(item.href + '/')
        )
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : hasSiblingMatch
              ? pathname === item.href
              : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'border-l-2 border-primary bg-sidebar-accent text-sidebar-accent-foreground neon-text-cyan'
                : 'border-l-2 border-transparent text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              // Feedback visual durante la navegacion: opacidad reducida en
              // el item activo actual para indicar que se esta cambiando
              isNavigating && isActive && 'opacity-60'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'size-5 shrink-0',
                isActive ? 'text-primary' : ('color' in item && item.color) || ''
              )}
              aria-hidden="true"
            />
            <span className="flex-1">{item.label}</span>
            {item.href === '/alerts' && lowStockCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {lowStockCount > 99 ? '99+' : lowStockCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter({ user }: { user: UserInfo }) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 shrink-0">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-primary/20 text-xs text-primary">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user.fullName}
          </p>
          <p className="truncate text-xs text-muted-foreground capitalize">
            {user.role}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              disabled={isPending}
              aria-label="Cerrar sesion"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Cerrar sesion</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export function Sidebar({ user, lowStockCount }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
        aria-label="Barra lateral"
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <Box className="size-7 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <span className="neon-text-cyan text-lg font-bold tracking-wider">
            INVENTARIO PRO
          </span>
        </div>

        <SidebarNav lowStockCount={lowStockCount} />
        <SidebarFooter user={user} />
      </aside>
    </>
  )
}

// Exportar SidebarNav y SidebarFooter para uso en mobile sheet
export { SidebarNav, SidebarFooter }
