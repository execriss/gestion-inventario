import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getMyOrgId } from '@/lib/supabase/org'

// ---------- Styles ----------

const colors = {
  headerBg: '#0a1628',
  headerText: '#00d4ff',
  rowEven: '#0d1f35',
  rowOdd: '#0a1628',
  white: '#ffffff',
  mutedText: '#94a3b8',
  border: '#1e293b',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.headerBg,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.white,
  },
  header: {
    marginBottom: 20,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.headerText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.mutedText,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: '#162033',
    borderBottom: `1px solid ${colors.border}`,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row' as const,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottom: `0.5px solid ${colors.border}`,
  },
  headerCell: {
    fontFamily: 'Helvetica-Bold',
    color: colors.headerText,
    fontSize: 8,
  },
  cell: {
    fontSize: 8,
    color: colors.white,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center' as const,
    fontSize: 8,
    color: colors.mutedText,
  },
})

// ---------- Column definitions per report tab ----------

type Column = {
  header: string
  key: string
  width: string
  align?: 'right' | 'left'
  format?: (v: unknown) => string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatNumber(n: unknown): string {
  if (n === null || n === undefined) return '0.00'
  return Number(n).toFixed(2)
}

const movementsColumns: Column[] = [
  { header: 'Fecha', key: 'created_at', width: '14%', format: (v) => formatDate(v as string) },
  { header: 'Tipo', key: 'type', width: '10%', format: (v) => (v === 'ingreso' ? 'Ingreso' : 'Egreso') },
  { header: 'Producto', key: '_product_name', width: '20%' },
  { header: 'SKU', key: '_product_sku', width: '12%' },
  { header: 'Cantidad', key: 'quantity', width: '10%', align: 'right' },
  { header: 'P. Unit.', key: 'unit_price', width: '12%', align: 'right', format: formatNumber },
  { header: 'Total', key: 'total_price', width: '12%', align: 'right', format: formatNumber },
  { header: 'Proveedor', key: '_supplier_name', width: '10%' },
]

const stockColumns: Column[] = [
  { header: 'Categoria', key: 'category_name', width: '25%' },
  { header: 'Productos', key: 'product_count', width: '15%', align: 'right' },
  { header: 'Stock Total', key: 'total_stock', width: '20%', align: 'right' },
  { header: 'Valor Total', key: 'total_value', width: '20%', align: 'right', format: formatNumber },
]

const productsColumns: Column[] = [
  { header: 'Nombre', key: 'name', width: '25%' },
  { header: 'SKU', key: 'sku', width: '15%' },
  { header: 'Stock', key: 'current_stock', width: '12%', align: 'right' },
  { header: 'Stock Min.', key: 'min_stock', width: '12%', align: 'right' },
  { header: 'P. Costo', key: 'cost_price', width: '13%', align: 'right', format: formatNumber },
  { header: 'P. Venta', key: 'sale_price', width: '13%', align: 'right', format: formatNumber },
]

// ---------- PDF Document Component ----------

function ReportDocument({
  title,
  orgName,
  dateStr,
  columns,
  data,
}: {
  title: string
  orgName: string
  dateStr: string
  columns: Column[]
  data: Record<string, unknown>[]
}) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, `INVENTARIO PRO — ${title}`),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `${orgName} | Generado: ${dateStr}`
        )
      ),
      // Table header
      React.createElement(
        View,
        { style: styles.tableHeader },
        ...columns.map((col) =>
          React.createElement(
            Text,
            {
              key: col.key,
              style: {
                ...styles.headerCell,
                width: col.width,
                textAlign: col.align ?? 'left',
              },
            },
            col.header
          )
        )
      ),
      // Table rows
      ...data.slice(0, 50).map((row, i) =>
        React.createElement(
          View,
          {
            key: String(i),
            style: {
              ...styles.tableRow,
              backgroundColor: i % 2 === 0 ? colors.rowEven : colors.rowOdd,
            },
          },
          ...columns.map((col) => {
            const raw = row[col.key]
            const display = col.format ? col.format(raw) : String(raw ?? '')

            return React.createElement(
              Text,
              {
                key: col.key,
                style: {
                  ...styles.cell,
                  width: col.width,
                  textAlign: col.align ?? 'left',
                },
              },
              display
            )
          })
        )
      ),
      // Footer
      React.createElement(
        Text,
        { style: styles.footer, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Pagina ${pageNumber} de ${totalPages}` },
        ''
      )
    )
  )
}

// ---------- Route handler ----------

type TabType = 'movements' | 'stock' | 'products'

const TAB_TITLES: Record<TabType, string> = {
  movements: 'Reporte de Movimientos',
  stock: 'Reporte de Stock por Categoria',
  products: 'Reporte de Productos',
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const tab = (request.nextUrl.searchParams.get('tab') ?? 'movements') as TabType
  if (!['movements', 'stock', 'products'].includes(tab)) {
    return NextResponse.json({ error: 'Tab invalido' }, { status: 400 })
  }

  // Get organization name
  const orgId = await getMyOrgId(supabase)
  let orgName = 'Mi Organizacion'
  if (orgId) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()
    if (org) orgName = org.name
  }

  let data: Record<string, unknown>[] = []
  let columns: Column[] = []
  const title = TAB_TITLES[tab]

  if (tab === 'movements') {
    columns = movementsColumns
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: movements } = await supabase
      .from('inventory_movements')
      .select('*, products(name, sku), suppliers(name)')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    data = (movements ?? []).map((m: Record<string, unknown>) => {
      const products = m.products as { name: string; sku: string | null } | null
      const suppliers = m.suppliers as { name: string } | null
      return {
        ...m,
        _product_name: products?.name ?? '',
        _product_sku: products?.sku ?? '',
        _supplier_name: suppliers?.name ?? '',
      }
    })
  } else if (tab === 'stock') {
    columns = stockColumns
    const { data: stockData } = await supabase
      .from('stock_by_category')
      .select('*')
    data = (stockData ?? []) as unknown as Record<string, unknown>[]
  } else {
    columns = productsColumns
    const { data: productsData } = await supabase
      .from('products')
      .select('name, sku, current_stock, min_stock, cost_price, sale_price')
      .eq('is_active', true)
      .order('name')
      .limit(50)
    data = (productsData ?? []) as unknown as Record<string, unknown>[]
  }

  const dateStr = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const doc = ReportDocument({ title, orgName, dateStr, columns, data })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any)

  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-${tab}-${today}.pdf"`,
    },
  })
}
