
-- 1. Drop overly permissive product-images storage policies
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- 2. Tighten public contact_messages INSERT (replace WITH CHECK true)
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 100
  AND length(btrim(message)) BETWEEN 1 AND 2000
  AND length(btrim(phone)) BETWEEN 5 AND 30
  AND (email IS NULL OR length(email) <= 255)
);

-- 3. Revoke EXECUTE on SECURITY DEFINER / trigger functions from public roles.
-- has_role is referenced inside RLS policies; policy evaluation runs as the
-- table owner so revoking from anon/authenticated does not break RLS.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.ensure_single_active_theme() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trigger_sitemap_regeneration() FROM anon, authenticated, public;
