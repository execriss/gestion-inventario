'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
  Users,
} from 'lucide-react'
import { acceptInvitation } from '@/actions/organizations.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

const inviteRegisterSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.email('Email invalido'),
  password: z.string().min(8, 'Minimo 8 caracteres'),
})

type InviteRegisterData = z.infer<typeof inviteRegisterSchema>

interface InviteAcceptFormProps {
  token: string
  orgName: string
  roleLabel: string
  isAuthenticated: boolean
}

export function InviteAcceptForm({
  token,
  orgName,
  roleLabel,
  isAuthenticated,
}: InviteAcceptFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<InviteRegisterData>({
    resolver: zodResolver(inviteRegisterSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
    },
  })

  function handleAcceptAuthenticated() {
    setServerError(null)
    startTransition(async () => {
      const result = await acceptInvitation({ token })
      if ('error' in result) {
        setServerError(result.error)
      } else {
        router.push('/dashboard')
      }
    })
  }

  function onSubmitRegister(data: InviteRegisterData) {
    setServerError(null)
    startTransition(async () => {
      const result = await acceptInvitation({
        token,
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      })
      if ('error' in result) {
        setServerError(result.error)
      } else {
        router.push('/dashboard')
      }
    })
  }

  return (
    <div
      className={cn(
        'glass-card relative z-10 w-full max-w-md rounded-2xl p-8',
        'transition-shadow duration-300 hover:neon-glow-violet'
      )}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="relative">
          <Box
            className="size-12 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 blur-lg"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(circle, oklch(0.67 0.22 285 / 40%) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="text-center">
          <h1 className="neon-text-cyan text-2xl font-bold tracking-wider">
            INVENTARIO PRO
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Te invitaron a unirte
          </p>
        </div>
      </div>

      {/* Invitation info */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-neon-violet/20 bg-neon-violet/5 px-4 py-3">
        <Users
          className="size-5 shrink-0 text-neon-violet"
          aria-hidden="true"
        />
        <p className="text-sm text-foreground">
          Fuiste invitado a{' '}
          <strong className="neon-text-cyan">{orgName}</strong> como{' '}
          <strong className="neon-text-violet">{roleLabel}</strong>
        </p>
      </div>

      {/* Error del servidor */}
      {serverError && (
        <div
          className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {isAuthenticated ? (
        /* Already logged in — just accept */
        <Button
          onClick={handleAcceptAuthenticated}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 font-semibold text-white transition-all hover:from-violet-400 hover:to-purple-500 hover:shadow-lg hover:shadow-violet-500/25"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
              Uniendose...
            </>
          ) : (
            'Aceptar y unirme'
          )}
        </Button>
      ) : (
        /* Not logged in — show register form */
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitRegister)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        type="text"
                        placeholder="Juan Perez"
                        className="pl-10"
                        autoComplete="name"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        autoComplete="email"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrasena</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        type="password"
                        placeholder="Minimo 8 caracteres"
                        className="pl-10"
                        autoComplete="new-password"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 font-semibold text-white transition-all hover:from-violet-400 hover:to-purple-500 hover:shadow-lg hover:shadow-violet-500/25"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta y unirme'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
