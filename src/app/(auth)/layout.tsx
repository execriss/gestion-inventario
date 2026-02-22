export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="grid-bg relative flex min-h-svh items-center justify-center p-4">
      {/* Gradiente radial neon cyan sutil en el centro */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at center, oklch(0.73 0.19 196 / 8%) 0%, transparent 60%)',
        }}
      />
      {children}
    </main>
  )
}
