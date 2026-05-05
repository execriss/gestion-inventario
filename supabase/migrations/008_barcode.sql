-- Agregar campo barcode a products (separado del SKU interno)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Índice único por organización (igual que SKU, permite NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode
  ON public.products(organization_id, barcode)
  WHERE barcode IS NOT NULL;
