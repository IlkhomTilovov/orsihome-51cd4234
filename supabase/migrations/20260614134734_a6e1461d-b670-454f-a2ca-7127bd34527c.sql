ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes_ru text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors_ru text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS materials_ru text[] NOT NULL DEFAULT '{}';