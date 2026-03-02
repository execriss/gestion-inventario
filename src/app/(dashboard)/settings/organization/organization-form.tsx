'use client'

import { useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrganization } from '@/actions/organizations.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const orgSchema = z.object({
  name: z.string().min(2, 'Minimo 2 caracteres').max(100),
  logo_url: z.string().url('URL invalida').or(z.literal('')).optional(),
  email_alerts_enabled: z.boolean(),
})

type OrgFormData = z.infer<typeof orgSchema>

interface OrganizationFormProps {
  defaultName: string
  defaultLogoUrl: string
  defaultEmailAlertsEnabled: boolean
  orgId: string
}

export function OrganizationForm({
  defaultName,
  defaultLogoUrl,
  defaultEmailAlertsEnabled,
  orgId,
}: OrganizationFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: defaultName,
      logo_url: defaultLogoUrl,
      email_alerts_enabled: defaultEmailAlertsEnabled,
    },
  })

  function onSubmit(data: OrgFormData) {
    startTransition(async () => {
      const result = await updateOrganization(data)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Organizacion actualizada')
      }
    })
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Datos de la organizacion
        </h2>
        <p className="text-sm text-muted-foreground">
          Nombre y logo de tu negocio
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la organizacion</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2
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

          <Controller
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo (opcional)</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || null}
                    onChange={(url) => field.onChange(url)}
                    orgId={orgId}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Controller
            control={form.control}
            name="email_alerts_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Notificaciones por email
                  </FormLabel>
                  <FormDescription>
                    Recibir alertas cuando el stock baje del minimo
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    aria-label="Activar notificaciones por email"
                  />
                </FormControl>
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
