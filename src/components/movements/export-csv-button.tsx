'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportCsvButtonProps {
  href: string
}

export function ExportCsvButton({ href }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = ''
    anchor.click()
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {loading ? 'Exportando...' : 'Excel'}
    </Button>
  )
}
