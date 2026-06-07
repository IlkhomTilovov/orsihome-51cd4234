import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroProduct {
  id: string;
  slug: string | null;
  name_uz: string;
  name_ru: string;
  description_uz: string | null;
  description_ru: string | null;
  images: string[] | null;
  hero_title_uz: string | null;
  hero_title_ru: string | null;
  hero_subtitle_uz: string | null;
  hero_subtitle_ru: string | null;
}

export function useHeroProducts() {
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name_uz, name_ru, description_uz, description_ru, images, hero_title_uz, hero_title_ru, hero_subtitle_uz, hero_subtitle_ru')
        .eq('is_active', true)
        .eq('is_featured', true)
        .eq('show_in_hero', true)
        .order('hero_priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(8);
      if (!mounted) return;
      if (error) console.error('useHeroProducts:', error);
      setProducts((data as HeroProduct[]) || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { products, loading };
}
