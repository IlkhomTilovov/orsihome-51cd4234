CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL DEFAULT '',
  address_uz TEXT NOT NULL,
  address_ru TEXT NOT NULL DEFAULT '',
  phone TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.branches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active branches"
  ON public.branches FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert branches"
  ON public.branches FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update branches"
  ON public.branches FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete branches"
  ON public.branches FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.branches (name_uz, name_ru, address_uz, address_ru, phone, latitude, longitude, order_index)
VALUES ('Asosiy filial', 'Главный филиал', 'Samarqand sh. Beruniy ko''chasi 86', 'г. Самарканд, ул. Беруни 86', '+998 55 706 20 00', 39.6547500, 66.9757200, 0);