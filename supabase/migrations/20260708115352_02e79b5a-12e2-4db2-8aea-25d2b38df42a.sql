CREATE TABLE public.sections (
    id uuid primary key default gen_random_uuid(),
    name_uz text not null,
    name_ru text not null,
    slug text not null unique,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT ALL ON public.sections TO service_role;

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sections viewable by public"
ON public.sections
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can manage sections"
ON public.sections
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.categories
    ADD COLUMN section_id uuid null REFERENCES public.sections(id) ON DELETE SET NULL;

CREATE INDEX idx_categories_section_id ON public.categories(section_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sections_updated_at
BEFORE UPDATE ON public.sections
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();