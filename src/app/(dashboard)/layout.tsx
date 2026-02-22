import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { DEMO_MODE, DEMO_USER, DEMO_LOW_STOCK } from '@/lib/demo'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // MODO DEMO: usar usuario y datos ficticios
  if (DEMO_MODE) {
    return (
      <div className="flex min-h-svh">
        <Sidebar user={DEMO_USER} />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Header user={DEMO_USER} lowStockCount={DEMO_LOW_STOCK.length} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, lowStockResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('low_stock_products')
      .select('id', { count: 'exact', head: true }),
  ])

  const profile = profileResult.data
  const lowStockCount = lowStockResult.count ?? 0

  const userInfo = {
    email: user.email ?? '',
    fullName: profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
    avatarUrl: profile?.avatar_url ?? null,
    role: profile?.role ?? 'viewer',
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar user={userInfo} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header user={userInfo} lowStockCount={lowStockCount} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
