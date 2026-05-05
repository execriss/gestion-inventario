'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { Camera, CameraOff, Keyboard, Loader2, ScanLine } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (barcode: string) => void
  title?: string
  description?: string
}

type Mode = 'camera' | 'hid'

const HID_GAP_MS = 100

export function BarcodeScanner({
  open,
  onOpenChange,
  onScan,
  title = 'Escanear código de barras',
  description = 'Apuntá la cámara al código o usá un lector HID / entrada manual.',
}: BarcodeScannerProps) {
  const [mode, setMode] = useState<Mode>('camera')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualValue, setManualValue] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const hidInputRef = useRef<HTMLInputElement>(null)
  const hidBufferRef = useRef<string>('')
  const hidLastKeyAtRef = useRef<number>(0)
  const handledRef = useRef(false)

  const resetState = useCallback(() => {
    handledRef.current = false
    hidBufferRef.current = ''
    hidLastKeyAtRef.current = 0
    setManualValue('')
    setCameraError(null)
    setCameraReady(false)
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetState()
      onOpenChange(next)
    },
    [onOpenChange, resetState]
  )

  const finishScan = useCallback(
    (barcode: string) => {
      const trimmed = barcode.trim()
      if (!trimmed || handledRef.current) return
      handledRef.current = true
      onScan(trimmed)
      handleOpenChange(false)
    },
    [onScan, handleOpenChange]
  )

  useEffect(() => {
    if (!open || mode !== 'camera') return

    let cancelled = false
    const reader = new BrowserMultiFormatReader()

    const start = async () => {
      try {
        if (!videoRef.current) return
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result, err) => {
            if (cancelled) return
            if (result) {
              finishScan(result.getText())
            }
            if (err && err.name && err.name !== 'NotFoundException') {
              console.warn('[barcode-scanner] decode error:', err)
            }
          }
        )
        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls
        setCameraReady(true)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error
            ? err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Permiso de cámara denegado. Permití el acceso desde el navegador o usá modo HID / Manual.'
              : err.name === 'NotFoundError' || err.name === 'OverconstrainedError'
                ? 'No se encontró ninguna cámara disponible.'
                : err.message || 'No se pudo iniciar la cámara.'
            : 'No se pudo iniciar la cámara.'
        setCameraError(message)
      }
    }

    const timeoutId = window.setTimeout(start, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      controlsRef.current?.stop()
      controlsRef.current = null
      setCameraReady(false)
      setCameraError(null)
    }
  }, [open, mode, finishScan])

  useEffect(() => {
    if (!open || mode !== 'hid') return
    const id = window.setTimeout(() => hidInputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [open, mode])

  const handleHidKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const now = performance.now()
      const gap = now - hidLastKeyAtRef.current
      hidLastKeyAtRef.current = now

      if (event.key === 'Enter') {
        event.preventDefault()
        const buffered = hidBufferRef.current
        const fromInput = event.currentTarget.value
        const candidate = (buffered || fromInput).trim()
        hidBufferRef.current = ''
        if (candidate) {
          finishScan(candidate)
        }
        return
      }

      if (event.key.length === 1) {
        if (gap > HID_GAP_MS) {
          hidBufferRef.current = event.key
        } else {
          hidBufferRef.current += event.key
        }
      }
    },
    [finishScan]
  )

  const handleManualSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      finishScan(manualValue)
    },
    [finishScan, manualValue]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-5 text-cyan-400" aria-hidden />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/5 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              mode === 'camera'
                ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-500/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={mode === 'camera'}
          >
            <Camera className="size-4" aria-hidden />
            Cámara
          </button>
          <button
            type="button"
            onClick={() => setMode('hid')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              mode === 'hid'
                ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-500/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={mode === 'hid'}
          >
            <Keyboard className="size-4" aria-hidden />
            HID / Manual
          </button>
        </div>

        {mode === 'camera' ? (
          <div className="space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/30 bg-black">
              <video
                ref={videoRef}
                className="size-full object-cover"
                playsInline
                muted
                autoPlay
              />

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-6 inset-y-10 rounded-md border border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                  <span className="absolute -left-px -top-px size-5 border-l-2 border-t-2 border-cyan-400" />
                  <span className="absolute -right-px -top-px size-5 border-r-2 border-t-2 border-cyan-400" />
                  <span className="absolute -bottom-px -left-px size-5 border-b-2 border-l-2 border-cyan-400" />
                  <span className="absolute -bottom-px -right-px size-5 border-b-2 border-r-2 border-cyan-400" />
                  {cameraReady && !cameraError && (
                    <span className="absolute inset-x-2 top-0 h-px animate-barcode-scanline bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.9)] motion-reduce:animate-none" />
                  )}
                </div>
              </div>

              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-sm text-cyan-200">
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                  Iniciando cámara...
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center text-sm">
                  <CameraOff className="size-8 text-red-400" aria-hidden />
                  <p className="text-red-200">{cameraError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMode('hid')}
                  >
                    Usar modo HID / Manual
                  </Button>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Mantené el código dentro del recuadro. La detección es automática.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <label
                htmlFor="barcode-hid-input"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-200"
              >
                <ScanLine className="size-4" aria-hidden />
                Esperando lectura del escáner...
              </label>
              <Input
                id="barcode-hid-input"
                ref={hidInputRef}
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyDown={handleHidKeyDown}
                placeholder="Escaneá o ingresá el código y presioná Enter"
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Funciona con escáneres USB/Bluetooth tipo teclado y entrada manual.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Button
                type="submit"
                disabled={!manualValue.trim()}
                className="w-full"
              >
                Confirmar código
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
