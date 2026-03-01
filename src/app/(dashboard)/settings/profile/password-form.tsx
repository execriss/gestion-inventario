'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword } from '@/actions/organizations.actions'
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

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Minimo 8 caracteres'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Las contrasenas no coinciden',
    path: ['confirm_password'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function PasswordForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  })

  function onSubmit(data: PasswordFormData) {
    startTransition(async () => {
      const result = await updatePassword(data)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Contrasena actualizada')
        form.reset()
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Cambiar contrasena
        </h2>
        <p className="text-sm text-muted-foreground">
          Actualiza tu contrasena de acceso
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contrasena</FormLabel>
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

          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contrasena</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      type="password"
                      placeholder="Repeti la contrasena"
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

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              {isPending ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Check className="mr-2 size-4" aria-hidden="true" />
              )}
              Actualizar contrasena
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
