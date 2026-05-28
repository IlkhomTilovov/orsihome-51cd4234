CREATE TABLE public.promo_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_uz text NOT NULL,
  title_ru text NOT NULL,
  icon text NOT NULL DEFAULT 'Sparkles',
  bg_class text NOT NULL DEFAULT 'bg-secondary',
  text_class text NOT NULL DEFAULT 'text-foreground',
  href text NOT NULL DEFAULT '/catalog',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_tiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_tiles TO authenticated;
GRANT ALL ON public.promo_tiles TO service_role;

ALTER TABLE public.promo_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo tiles"
  ON public.promo_tiles FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can manage promo tiles"
  ON public.promo_tiles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER update_promo_tiles_updated_at
  BEFORE UPDATE ON public.promo_tiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.promo_tiles (title_uz, title_ru, icon, bg_class, text_class, href, sort_order) VALUES
  ('Hit sotuv', 'Хит продаж', 'Zap', 'bg-[#D4EDE0]', 'text-foreground', '/catalog?filter=hit', 1),
  ('Mashhur mahsulot', 'Популярные', 'Star', 'bg-[#F0E0CC]', 'text-foreground', '/catalog?filter=popular', 2),
  ('Extra Chegirma', 'Экстра скидка', 'Flame', 'bg-[#F5D5D0]', 'text-foreground', '/catalog?filter=sale', 3),
  ('Ofis mebellari', 'Офисная мебель', 'Briefcase', 'bg-[#1F3A2E]', 'text-white', '/catalog?category=office', 4),
  ('Mehmonxona uchun', 'Для гостиной', 'Sofa', 'bg-[#1F3A2E]', 'text-white', '/catalog?category=living', 5),
  ('Universal yechim', 'Универсальное', 'Sparkles', 'bg-[#E8D4B8]', 'text-foreground', '/catalog', 6);