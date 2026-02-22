import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { SupplierTable } from '@/components/suppliers/supplier-table'
import { NewSupplierButton } from '@/components/suppliers/new-supplier-button'
import { DEMO_MODE, DEMO_SUPPLIERS } from '@/lib/demo'

export default async function SuppliersPage() {
  let list: typeof DEMO_SUPPLIERS

  if (DEMO_MODE) {
    list = DEMO_SUPPLIERS
  } else {
    const supabase = await createClient()
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name')
    list = (suppliers ?? []) as typeof DEMO_SUPPLIERS
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <Badge variant="secondary">{list.length}</Badge>
        </div>
        <NewSupplierButton />
      </div>

      {list.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            No hay proveedores registrados todavía.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Registrá el primero usando el botón de arriba.
          </p>
        </div>
      ) : (
        <SupplierTable suppliers={list} />
      )}
    </div>
  )
}
