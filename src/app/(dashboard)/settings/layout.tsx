'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserCircle, Building2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTINGS_NAV = [
  { label: 'Perfil', href: '/settings/profile', icon: UserCircle },
  { label: 'Organizacion', href: '/settings/organization', icon: Building2 },
  { label: 'Equipo', href: '/settings/members', icon: Users },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tu perfil, organizacion y equipo
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar nav */}
        <nav
          className="flex gap-1 lg:w-56 lg:shrink-0 lg:flex-col"
          aria-label="Secciones de configuracion"
        >
          {SETTINGS_NAV.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary neon-text-cyan'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
