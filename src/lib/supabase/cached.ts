import { cache } from 'react'
import { createClient } from './server'

/**
 * Cached Supabase helpers using React.cache() for per-request deduplication.
 *
 * React.cache() ensures that within a single server request, each function
 * executes its query only once, even if called from multiple server components
 * (e.g., layout.tsx + page.tsx both calling getAuthUser).
 *
 * This eliminates the duplicate getUser() call between proxy.ts and layout.tsx.
 */

/** Cached auth user — deduplicated within a single request */
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/** Cached user profile data for the layout shell */
export const getLayoutUserInfo = cache(async () => {
  const supabase = await createClient()

  const user = await getAuthUser()
  if (!user) return null

  // Parallel fetch: profile + lowStockCount + role (async-parallel rule)
  const [profileResult, lowStockResult, roleResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('low_stock_products')
      .select('id', { count: 'exact', head: true }),
    supabase.rpc('get_my_org_role'),
  ])

  const profile = profileResult.data
  const lowStockCount = lowStockResult.count ?? 0

  return {
    userInfo: {
      email: user.email ?? '',
      fullName: profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
      avatarUrl: profile?.avatar_url ?? null,
      role: (roleResult.data ?? 'viewer') as 'admin' | 'operator' | 'viewer',
    },
    lowStockCount,
  }
})
