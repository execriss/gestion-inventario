import Link from 'next/link'
import { Box, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid-bg relative flex min-h-screen items-center justify-center px-4">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.73 0.19 196 / 8%) 0%, transparent 70%)',
        }}
      />

      <div className="glass-card relative z-10 mx-auto max-w-md rounded-2xl p-10 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Box
            className="size-10 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* 404 number */}
        <h1 className="neon-text-cyan text-8xl font-black tracking-tighter sm:text-9xl">
          404
        </h1>

        {/* Message */}
        <p className="mt-4 text-lg font-semibold text-foreground">
          Página no encontrada
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida a otra ubicación.
        </p>

        {/* CTA */}
        <Button
          asChild
          className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
        >
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
