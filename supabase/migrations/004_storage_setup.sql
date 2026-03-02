-- ============================================================================
-- 004_storage_setup.sql
-- Bucket de Storage para logos de organizaciones + políticas de seguridad
-- ============================================================================

-- Crear bucket público para logos de organizaciones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-logos',
  'org-logos',
  true,
  2097152, -- 2MB en bytes
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: admins de la org pueden subir su logo
-- El path debe ser: {org_id}/logo.{ext}
CREATE POLICY "Admins can upload org logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'org-logos' AND
  (storage.foldername(name))[1] = (SELECT public.get_my_org_id())::text AND
  (SELECT public.get_my_org_role()) = 'admin'
);

-- Policy: admins de la org pueden actualizar su logo
CREATE POLICY "Admins can update org logo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'org-logos' AND
  (storage.foldername(name))[1] = (SELECT public.get_my_org_id())::text AND
  (SELECT public.get_my_org_role()) = 'admin'
);

-- Policy: admins pueden eliminar el logo de su org
CREATE POLICY "Admins can delete org logo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'org-logos' AND
  (storage.foldername(name))[1] = (SELECT public.get_my_org_id())::text AND
  (SELECT public.get_my_org_role()) = 'admin'
);

-- Policy: lectura pública (los logos son públicos)
CREATE POLICY "Public can read org logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'org-logos');
