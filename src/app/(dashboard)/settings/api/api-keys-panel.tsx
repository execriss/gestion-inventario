'use client'

import { useState, useTransition } from 'react'
import {
  KeyRound,
  Plus,
  Trash2,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { createApiKey, revokeApiKey, type ApiKey } from '@/actions/api-keys.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ── Helpers ──────────────────────────────────────────────────────────

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'hace unos segundos'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days}d`
  const months = Math.floor(days / 30)
  return `hace ${months} mes${months > 1 ? 'es' : ''}`
}

const API_DOCS_URL = 'https://inventario-api.exegestion.com'

// ── Props ────────────────────────────────────────────────────────────

interface ApiKeysPanelProps {
  initialKeys: ApiKey[]
  isPro: boolean
  isAdmin: boolean
}

// ── Component ────────────────────────────────────────────────────────

export function ApiKeysPanel({ initialKeys, isPro, isAdmin }: ApiKeysPanelProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [label, setLabel] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ── Upgrade gate ─────────────────────────────────────────────────

  if (!isPro) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/15">
            <ShieldAlert className="size-7 text-amber-500" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              La API REST requiere Plan Pro
            </h2>
            <p className="text-sm text-muted-foreground">
              Actualizá tu plan para acceder a la API REST y generar keys de
              acceso programático a tu inventario.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/settings/upgrade">Ver planes</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Admin gate ───────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <ShieldAlert className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Solo los administradores pueden gestionar API keys.
          </p>
        </div>
      </div>
    )
  }

  // ── Handlers ─────────────────────────────────────────────────────

  function handleCreate() {
    startTransition(async () => {
      const result = await createApiKey(label.trim() || undefined)

      if ('error' in result) {
        toast.error(result.error)
        return
      }

      setKeys((prev) => [result.key, ...prev])
      setLabel('')
      setNewKey(result.full_key)
      setShowKey(true)
      setCopied(false)
    })
  }

  function handleRevoke(id: string) {
    if (!confirm('¿Seguro que querés revocar esta API key? Esta acción no se puede deshacer.')) {
      return
    }

    startTransition(async () => {
      const result = await revokeApiKey(id)

      if ('error' in result) {
        toast.error(result.error)
        return
      }

      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k,
        ),
      )
      toast.success('API key revocada')
    })
  }

  async function handleCopy() {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Derived ──────────────────────────────────────────────────────

  const activeCount = keys.filter((k) => !k.revoked_at).length

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header + Form */}
      <div className="glass-card rounded-xl p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <KeyRound className="size-5 text-neon-cyan" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
          <Badge variant="outline" className="ml-1">
            {activeCount} activa{activeCount !== 1 ? 's' : ''}
          </Badge>
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Documentación
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>

        {/* Create form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCreate()
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Nombre descriptivo (ej: Integración ERP)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending} className="shrink-0">
            {isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="mr-1.5 size-4" aria-hidden="true" />
            )}
            Nueva key
          </Button>
        </form>
      </div>

      {/* New key reveal panel */}
      {newKey !== null && (
        <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-neon-cyan">
              ¡Copiá tu API key ahora! No la vas a poder ver de nuevo.
            </p>
            <button
              type="button"
              onClick={() => setNewKey(null)}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <code
              className={cn(
                'flex-1 select-all break-all rounded-lg border border-border/50 bg-background/50 px-3 py-2 font-mono text-sm',
                !showKey && 'tracking-widest text-muted-foreground',
              )}
            >
              {showKey ? newKey : '••••••••••••••••••••••••••••••••'}
            </code>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? 'Ocultar key' : 'Mostrar key'}
            >
              {showKey ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              aria-label="Copiar al portapapeles"
            >
              {copied ? (
                <Check className="size-4 text-emerald-400" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="glass-card rounded-xl p-6">
        {keys.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hay API keys creadas todavía.
          </p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => {
              const isRevoked = !!key.revoked_at
              return (
                <div
                  key={key.id}
                  className={cn(
                    'flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-background/30 px-4 py-3',
                    isRevoked && 'opacity-50',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium text-foreground">
                        {key.key_prefix}...••••••••
                      </code>
                      {isRevoked && (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 bg-destructive/15 text-destructive text-xs"
                        >
                          Revocada
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {key.label && <span>{key.label}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" aria-hidden="true" />
                        {key.last_used_at
                          ? `Usado: ${timeAgo(key.last_used_at)}`
                          : 'Nunca usado'}
                      </span>
                    </div>
                  </div>

                  {!isRevoked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(key.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2
                          className="mr-1.5 size-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                      )}
                      Revocar
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="rounded-lg border border-border/30 bg-background/20 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Las keys tienen acceso completo a tu inventario. Guardalas en un lugar
          seguro y no las compartas.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Base URL:{' '}
          <code className="rounded bg-background/50 px-1 py-0.5 font-mono text-neon-cyan">
            {API_DOCS_URL}
          </code>{' '}
          — Documentación completa en el link de arriba.
        </p>
      </div>
    </div>
  )
}
