'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, AlertCircle, Loader2, Mail, Lock } from 'lucide-react'
import { loginAction } from '@/actions/auth.actions'
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

const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: LoginFormData) {
    setServerError(null)
    startTransition(async () => {
      const result = await loginAction(data)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <div
      className={cn(
        'glass-card relative z-10 w-full max-w-md rounded-2xl p-8',
        'transition-shadow duration-300 hover:neon-glow-cyan'
      )}
    >
      {/* Logo */}
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
                'radial-gradient(circle, oklch(0.73 0.19 196 / 40%) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="text-center">
          <h1 className="neon-text-cyan text-2xl font-bold tracking-wider">
            INVENTARIO PRO
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistema de gestión de inventario
          </p>
        </div>
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

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      autoComplete="current-password"
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
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
