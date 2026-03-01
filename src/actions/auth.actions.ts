'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Schemas ────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
  email:     z.email('Email inválido'),
  password:  z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  org_name:  z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres').max(100),
})

// ── Helpers ────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// ── Actions ────────────────────────────────────────────────────

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
      email:    parsed.data.email,
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

/**
 * Registro de nuevo usuario + creación de organización.
 * El primer usuario queda como admin de la organización.
 * Usa el cliente admin (service_role) para evitar restricciones de RLS
 * al insertar la organización y el miembro en la misma transacción.
 */
export async function registerAction(
  data: unknown
): Promise<{ error: string } | never> {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { full_name, email, password, org_name } = parsed.data

  try {
    // 1. Crear el usuario en Supabase Auth
    const supabase = await createClient()
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })

    if (signUpError) {
      if (signUpError.message?.toLowerCase().includes('already registered')) {
        return { error: 'Ya existe una cuenta con ese email.' }
      }
      return { error: 'Error al crear la cuenta. Intentá de nuevo.' }
    }

    const userId = authData.user?.id
    if (!userId) {
      return { error: 'Error al obtener el usuario. Intentá de nuevo.' }
    }

    // 2. Crear organización + miembro usando service_role
    //    (el usuario recién creado aún no tiene org_id en su sesión)
    const admin = createAdminClient()

    const slug = toSlug(org_name)

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({ name: org_name, slug })
      .select('id')
      .single()

    if (orgError) {
      // Slug duplicado — agregar sufijo aleatorio
      if (orgError.code === '23505') {
        const uniqueSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
        const { data: org2, error: org2Error } = await admin
          .from('organizations')
          .insert({ name: org_name, slug: uniqueSlug })
          .select('id')
          .single()

        if (org2Error || !org2) {
          return { error: 'Error al crear la organización.' }
        }

        await admin.from('organization_members').insert({
          organization_id: org2.id,
          user_id:         userId,
          role:            'admin',
        })
      } else {
        return { error: 'Error al crear la organización.' }
      }
    } else if (org) {
      const { error: memberError } = await admin
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id:         userId,
          role:            'admin',
        })

      if (memberError) {
        return { error: 'Error al configurar los permisos.' }
      }
    }
  } catch {
    return { error: 'Error inesperado al registrarse.' }
  }

  redirect('/dashboard')
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Limpiar cookie de cache de organizacion (usada por proxy.ts)
  const cookieStore = await cookies()
  cookieStore.delete('has_org')

  redirect('/login')
}
