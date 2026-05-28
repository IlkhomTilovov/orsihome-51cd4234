
-- Add multilingual keyword columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keyword_uz TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keyword_ru TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants_uz TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants_ru TEXT[] DEFAULT '{}'::text[];

-- Migrate existing data to UZ fields
UPDATE public.products SET keyword_uz = target_keyword WHERE target_keyword IS NOT NULL AND keyword_uz IS NULL;
UPDATE public.products SET variants_uz = keyword_variations WHERE keyword_variations IS NOT NULL AND array_length(keyword_variations, 1) > 0 AND (variants_uz IS NULL OR array_length(variants_uz, 1) IS NULL);
