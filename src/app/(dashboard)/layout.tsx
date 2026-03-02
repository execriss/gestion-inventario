import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { DEMO_MODE, DEMO_USER, DEMO_LOW_STOCK } from '@/lib/demo'
import { getAuthUser, getLayoutUserInfo } from '@/lib/supabase/cached'

/**
 * Dashboard layout optimized for fast navigation:
 *
 * 1. Uses React.cache() via getAuthUser/getLayoutUserInfo to deduplicate
 *    Supabase calls within a single request (proxy.ts already called getUser).
 *
 * 2. The layout shell (sidebar + header) uses cached data that's already
 *    fetched by proxy.ts, so it doesn't add extra latency.
 *
 * 3. Children (page content) render independently — each page has its own
 *    loading.tsx for instant skeleton feedback during navigation.
 *
 * 4. Next.js caches layout renders between navigations within the same
 *    layout group, so sidebar/header don't re-render on every page change.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // MODO DEMO: usar usuario y datos ficticios
  if (DEMO_MODE) {
    return (
      <div className="flex min-h-svh">
        <Sidebar user={DEMO_USER} lowStockCount={DEMO_LOW_STOCK.length} />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Header user={DEMO_USER} lowStockCount={DEMO_LOW_STOCK.length} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    )
  }

  // React.cache() ensures this doesn't duplicate the proxy.ts getUser() call
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  // Cached within the request — if any child server component also calls
  // getLayoutUserInfo(), the query won't execute again
  const layoutData = await getLayoutUserInfo()

  if (!layoutData) {
    redirect('/login')
  }

  const { userInfo, lowStockCount } = layoutData

  return (
    <div className="flex min-h-svh">
      <Sidebar user={userInfo} lowStockCount={lowStockCount} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header user={userInfo} lowStockCount={lowStockCount} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
