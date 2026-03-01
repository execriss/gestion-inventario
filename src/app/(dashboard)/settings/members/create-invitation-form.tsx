'use client'

import { useState, useTransition, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Copy, Check, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { createInvitation } from '@/actions/invitations.actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const inviteSchema = z.object({
  role: z.enum(['admin', 'operator', 'viewer']),
  label: z.string().max(100).optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

export function CreateInvitationForm() {
  const [isPending, startTransition] = useTransition()
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'operator',
      label: '',
    },
  })

  function onSubmit(data: InviteFormData) {
    startTransition(async () => {
      const result = await createInvitation({
        ...data,
        max_uses: 1,
      })
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setGeneratedUrl(result.url)
        toast.success('Link de invitacion generado')
      }
    })
  }

  async function handleCopy() {
    if (!generatedUrl) return
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      toast.success('Link copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the input text
      urlInputRef.current?.select()
      toast.info('Selecciona y copia el link manualmente')
    }
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Plus className="size-5 text-neon-green" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">
          Crear nueva invitacion
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                      <SelectItem value="viewer">Observador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiqueta (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: Para el turno tarde"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
              <Link2 className="mr-2 size-4" aria-hidden="true" />
            )}
            Generar link
          </Button>
        </form>
      </Form>

      {/* Generated URL */}
      {generatedUrl && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-3">
          <Input
            ref={urlInputRef}
            readOnly
            value={generatedUrl}
            className="flex-1 bg-transparent text-sm"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0 text-primary hover:text-primary/80"
            onClick={handleCopy}
            aria-label="Copiar al portapapeles"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
