import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Cliente Supabase con service_role key.
 * Bypasa RLS — usar solo en Server Actions y Route Handlers,
 * nunca exponer al cliente.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken:  false,
        persistSession:    false,
        detectSessionInUrl: false,
      },
    }
  )
}
