'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check, User } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile } from '@/actions/organizations.actions'
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

const profileSchema = z.object({
  full_name: z.string().min(2, 'Minimo 2 caracteres').max(80),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  defaultName: string
}

export function ProfileForm({ defaultName }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: defaultName,
    },
  })

  function onSubmit(data: ProfileFormData) {
    startTransition(async () => {
      const result = await updateProfile(data)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Perfil actualizado')
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Datos del perfil
        </h2>
        <p className="text-sm text-muted-foreground">
          Tu nombre visible en la plataforma
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="pl-10"
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
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
