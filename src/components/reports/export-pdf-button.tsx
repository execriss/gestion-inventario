'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TAB_MAP: Record<string, string> = {
  movimientos: 'movements',
  stock: 'stock',
  productos: 'products',
}

export function ExportPdfButton() {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    // Find the currently active tab by checking the DOM for the active trigger
    const activeTab = document.querySelector<HTMLElement>(
      '[role="tab"][data-state="active"]'
    )
    const tabValue = activeTab?.getAttribute('value') ?? 'movimientos'
    const apiTab = TAB_MAP[tabValue] ?? 'movements'

    setLoading(true)

    // Use window.open so the browser handles the download natively
    window.open(`/api/export/report?tab=${apiTab}`, '_blank')

    // Reset loading state after a short delay
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      <FileText className="size-4" />
      {loading ? 'Generando...' : 'Exportar PDF'}
    </Button>
  )
}
