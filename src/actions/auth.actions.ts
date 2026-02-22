'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export async function loginAction(
  data: unknown
): Promise<{ error: string } | never> {
  try {
    const parsed = loginSchema.safeParse(data)

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      return { error: 'Credenciales inválidas. Verificá tu email y contraseña.' }
    }
  } catch {
    return { error: 'Error inesperado. Intentá de nuevo más tarde.' }
  }

  redirect('/dashboard')
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
