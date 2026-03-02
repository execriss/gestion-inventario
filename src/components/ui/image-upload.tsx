'use client'

import { useCallback, useRef, useState } from 'react'
import NextImage from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

interface ImageUploadProps {
  value: string | null
  onChange: (url: string) => void
  orgId: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  orgId,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('El archivo no puede superar los 2MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen')
        return
      }

      setIsUploading(true)

      try {
        const supabase = createClient()
        const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
        const path = `${orgId}/logo.${extension}`

        const { error } = await supabase.storage
          .from('org-logos')
          .upload(path, file, { upsert: true })

        if (error) {
          toast.error(`Error al subir: ${error.message}`)
          return
        }

        const { data: publicUrl } = supabase.storage
          .from('org-logos')
          .getPublicUrl(path)

        // Append timestamp to bust browser cache after upsert
        const urlWithCacheBust = `${publicUrl.publicUrl}?t=${Date.now()}`
        onChange(urlWithCacheBust)
        toast.success('Logo subido correctamente')
      } catch {
        toast.error('Error inesperado al subir el logo')
      } finally {
        setIsUploading(false)
      }
    },
    [orgId, onChange]
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // Reset input so re-uploading the same file triggers onChange
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled && !isUploading) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <div className="relative size-32 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
            <NextImage
              src={value}
              alt="Logo de la organización"
              fill
              sizes="128px"
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled || isUploading}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/80 disabled:opacity-50"
            aria-label="Eliminar logo"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          'border-border/50 bg-muted/10 hover:border-cyan-500/50 hover:bg-muted/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isDragging && 'border-cyan-500 bg-cyan-500/10',
          (disabled || isUploading) && 'pointer-events-none opacity-50'
        )}
        aria-label="Subir logo de la organización"
      >
        {isUploading ? (
          <>
            <Loader2
              className="size-8 animate-spin text-cyan-400"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">Subiendo...</p>
          </>
        ) : (
          <>
            <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground/80">
                Clic para subir
              </p>
              <p className="text-xs text-muted-foreground">
                o arrastra aqui - PNG, JPG, GIF, WebP (max 2MB)
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
