ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_in_hero BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hero_priority INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hero_title_uz TEXT,
  ADD COLUMN IF NOT EXISTS hero_title_ru TEXT,
  ADD COLUMN IF NOT EXISTS hero_subtitle_uz TEXT,
  ADD COLUMN IF NOT EXISTS hero_subtitle_ru TEXT;

CREATE INDEX IF NOT EXISTS idx_products_hero ON public.products (show_in_hero, hero_priority) WHERE show_in_hero = true;