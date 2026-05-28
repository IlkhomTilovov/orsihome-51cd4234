import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Heart, Headphones, Sofa, Armchair, Bed, UtensilsCrossed, Lamp, Briefcase, Sparkles, Flame, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { useFeaturedProducts, useCategories } from '@/hooks/useProducts';
import { usePromoTiles } from '@/hooks/usePromoTiles';
import { PROMO_ICONS } from '@/lib/promoIcons';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import { useState, useRef, useEffect } from 'react';


import serviceWardrobe from '@/assets/service-wardrobe.jpg';
import serviceKitchen from '@/assets/service-kitchen.jpg';
import serviceTvzone from '@/assets/service-tvzone.jpg';
import serviceBedroom from '@/assets/service-bedroom.jpg';

const defaultServiceImages: Record<string, string> = {
  'shkaflar': serviceWardrobe,
  'oshxona-mebellari': serviceKitchen,
  'tv-zonalar': serviceTvzone,
  'yotoqxona-mebellari': serviceBedroom,
};

const fallbackImages = [serviceBedroom, serviceWardrobe, serviceKitchen, serviceTvzone];

// Promo tiles (Woodline-style colorful cards)
const promoTiles = [
  {
    key: 'tile_hit',
    titleUz: 'Hit sotuv', titleRu: 'Хит продаж',
    icon: Zap,
    bg: 'bg-gradient-to-br from-[hsl(150_30%_92%)] to-[hsl(150_25%_85%)]',
    iconColor: 'text-primary',
    href: '/catalog?sort=popular',
  },
  {
    key: 'tile_popular',
    titleUz: 'Mashhur mahsulot', titleRu: 'Популярный товар',
    icon: Star,
    bg: 'bg-gradient-to-br from-[hsl(35_45%_92%)] to-[hsl(35_38%_82%)]',
    iconColor: 'text-[hsl(33_50%_45%)]',
    href: '/catalog?featured=1',
  },
  {
    key: 'tile_discount',
    titleUz: 'Extra Chegirma', titleRu: 'Extra Скидка',
    icon: Flame,
    bg: 'bg-gradient-to-br from-[hsl(15_60%_90%)] to-[hsl(10_55%_82%)]',
    iconColor: 'text-[hsl(10_60%_45%)]',
    href: '/catalog?discounted=1',
  },
  {
    key: 'tile_office',
    titleUz: 'Ofis mebellari', titleRu: 'Мебель для офиса',
    icon: Briefcase,
    bg: 'bg-gradient-to-br from-primary to-[hsl(150_35%_25%)]',
    iconColor: 'text-secondary',
    textLight: true,
    href: '/catalog?category=office',
  },
  {
    key: 'tile_living',
    titleUz: 'Mehmonxona uchun', titleRu: 'Мебель для гостиной',
    icon: Sofa,
    bg: 'bg-gradient-to-br from-[hsl(150_40%_22%)] to-[hsl(150_45%_15%)]',
    iconColor: 'text-secondary',
    textLight: true,
    href: '/catalog?category=living',
  },
  {
    key: 'tile_universal',
    titleUz: 'Universal yechim', titleRu: 'Универсальное решение',
    icon: Sparkles,
    bg: 'bg-gradient-to-br from-[hsl(35_38%_85%)] to-[hsl(33_36%_70%)]',
    iconColor: 'text-primary',
    href: '/catalog',
  },
];

// Fallback categories when DB is empty
const fallbackCategories = [
  { slug: 'divanlar', name_uz: 'Divanlar', name_ru: 'Диваны', icon: Sofa },
  { slug: 'stullar', name_uz: 'Stullar', name_ru: 'Стулья', icon: Armchair },
  { slug: 'krovat', name_uz: 'Krovat va matras', name_ru: 'Кровати и матрасы', icon: Bed },
  { slug: 'stollar', name_uz: 'Stollar', name_ru: 'Столы', icon: UtensilsCrossed },
  { slug: 'shkaf', name_uz: 'Shkaf va tumba', name_ru: 'Шкафы и тумбы', icon: Lamp },
  { slug: 'ofis', name_uz: 'Ofis mebeli', name_ru: 'Офисная мебель', icon: Briefcase },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

export default function Index() {
  const { language } = useLanguage();
  useSEO({});
export default function Index() {
  const { language } = useLanguage();
  useSEO({});
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(4);
  const { settings } = useSystemSettings();
  const { categories } = useCategories();
  const { data: dbPromoTiles = [] } = usePromoTiles();
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  const inspirations = [
    { key: 'insp_1', fallback: fallbackImages[0] },
    { key: 'insp_2', fallback: fallbackImages[1] },
    { key: 'insp_3', fallback: fallbackImages[2] },
    { key: 'insp_4', fallback: fallbackImages[3] },
  ];

  const sec1 = useInView();
  const sec2 = useInView();
  const sec3 = useInView();
  const sec4 = useInView();

  return (
    <div className="min-h-screen bg-background">
      {/* ============ HERO (Apple-style: huge type + product + side promo) ============ */}
      <section className="container mx-auto px-4 lg:px-8 pt-6 lg:pt-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Main hero card */}
          <div className="relative bg-card rounded-[2rem] overflow-hidden shadow-soft min-h-[460px] lg:min-h-[620px]">
            {/* Full-bleed background image */}
            <EditableImage
              contentKey="hero_product_image"
              fallbackSrc={fallbackImages[0]}
              alt="OrisHome premium furniture"
              className="absolute inset-0 w-full h-full object-cover"
              wrapperClassName="absolute inset-0 w-full h-full"
              section="hero"
            />

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />

            {/* Text content overlay */}
            <div className="relative h-full flex flex-col justify-center p-8 lg:p-14 max-w-2xl z-10">
              <div className="flex items-center gap-3 mb-6 text-white/70">
                <span className="font-serif text-2xl">1</span>
                <span className="w-8 h-px bg-white/40" />
                <span className="font-serif text-2xl">3</span>
              </div>
              <h1 className="font-serif font-bold leading-[0.95] text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
                <EditableText contentKey="hero_title_line1" fallback="SOFA" as="span" className="block" section="hero" />
                <EditableText contentKey="hero_title_line2" fallback="OLIVIA" as="span" className="block" section="hero" />
              </h1>
              <p className="mt-6 text-white/80 text-base lg:text-lg italic font-serif">
                <EditableText contentKey="hero_subtitle" fallback="Design by OrisHome" as="span" section="hero" />
              </p>

            </div>

            {/* Thumbnail strip */}
            <div className="absolute bottom-6 left-8 lg:left-14 flex gap-3 z-20">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    i === 0 ? 'border-white scale-105' : 'border-white/40 hover:border-white/80'
                  } shadow-soft-sm`}
                  aria-label={`Slide ${i + 1}`}
                >
                  <img src={fallbackImages[i]} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* ============ PROMO TILES (6 colorful cards) ============ */}
      <section ref={sec1.ref} className="container mx-auto px-4 lg:px-8 mt-8 lg:mt-12">
      {/* ============ PROMO TILES (DB-driven) ============ */}
      <section ref={sec1.ref} className="container mx-auto px-4 lg:px-8 mt-8 lg:mt-12">
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-700 ${sec1.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          {dbPromoTiles.map((tile, i) => {
            const Icon = PROMO_ICONS[tile.icon] || PROMO_ICONS.Sparkles;
            const title = language === 'uz' ? tile.title_uz : tile.title_ru;
            return (
              <Link
                key={tile.id}
                to={tile.href}
                className={`group relative aspect-square rounded-[1.75rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500 ease-luxe hover:-translate-y-1 ${tile.bg_class}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <h3 className={`font-sans font-semibold text-sm lg:text-base leading-tight ${tile.text_class}`}>
                    {title}
                  </h3>
                  <Icon
                    className={`w-16 h-16 lg:w-20 lg:h-20 self-end ${tile.text_class} opacity-90 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section ref={sec2.ref} className="container mx-auto px-4 lg:px-8 mt-16 lg:mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {language === 'uz' ? 'Toifalar' : 'Категория'}
              <sup className="text-xl ml-2 text-muted-foreground font-normal">{cats.length}</sup>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="w-12 h-12 rounded-full border border-border hover:border-foreground/40 hover:bg-card transition-colors flex items-center justify-center" aria-label="Previous">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-12 h-12 rounded-full border border-border hover:border-foreground/40 hover:bg-card transition-colors flex items-center justify-center" aria-label="Next">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 transition-all duration-700 ${sec2.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          {cats.slice(0, 4).map((cat: any, i) => {
            const name = language === 'uz' ? cat.name_uz : cat.name_ru;
            const img = cat.image || defaultServiceImages[cat.slug] || fallbackImages[i % 4];
            const FallbackIcon = cat.icon;
            return (
              <Link
                key={cat.slug || cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="group relative aspect-[4/5] bg-card rounded-[2rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500 ease-luxe hover:-translate-y-1"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="absolute top-6 left-0 right-0 z-10 text-center">
                  <h3 className="font-sans font-medium text-base lg:text-lg text-foreground px-4">
                    {name}
                  </h3>
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-8 pt-16">
                  {cat.image || defaultServiceImages[cat.slug] ? (
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-luxe"
                    />
                  ) : FallbackIcon ? (
                    <FallbackIcon className="w-32 h-32 text-primary/70 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.2} />
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Second row */}
        {cats.length > 4 && (
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-6 transition-all duration-700 ${sec2.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
            {cats.slice(4, 8).map((cat: any, i) => {
              const name = language === 'uz' ? cat.name_uz : cat.name_ru;
              const img = cat.image || defaultServiceImages[cat.slug] || fallbackImages[(i + 2) % 4];
              const FallbackIcon = cat.icon;
              return (
                <Link
                  key={cat.slug || cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="group relative aspect-[4/5] bg-card rounded-[2rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500 ease-luxe hover:-translate-y-1"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="absolute top-6 left-0 right-0 z-10 text-center">
                    <h3 className="font-sans font-medium text-base lg:text-lg text-foreground px-4">
                      {name}
                    </h3>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-8 pt-16">
                    {cat.image || defaultServiceImages[cat.slug] ? (
                      <img
                        src={img}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-luxe"
                      />
                    ) : FallbackIcon ? (
                      <FallbackIcon className="w-32 h-32 text-primary/70 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.2} />
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ FEATURED / SET (interior + product cards) ============ */}
      <section ref={sec3.ref} className="container mx-auto px-4 lg:px-8 mt-16 lg:mt-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            {language === 'uz' ? 'Setlar to\'plami' : 'Набор сетов'}
            <sup className="text-xl ml-2 text-muted-foreground font-normal">2</sup>
          </h2>
          <div className="hidden md:flex items-center gap-3">
            <button className="w-12 h-12 rounded-full border border-border hover:border-foreground/40 hover:bg-card transition-colors flex items-center justify-center" aria-label="Previous">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-12 h-12 rounded-full border border-border hover:border-foreground/40 hover:bg-card transition-colors flex items-center justify-center" aria-label="Next">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-4 lg:gap-6 transition-all duration-700 ${sec3.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          {/* Big interior */}
          <Link to="/catalog?featured=1" className="relative aspect-[4/3] lg:aspect-auto rounded-[2rem] overflow-hidden group shadow-soft hover:shadow-soft-lg transition-shadow">
            <EditableImage
              contentKey="set_main_image"
              fallbackSrc={fallbackImages[2]}
              alt="Interior set"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe"
              wrapperClassName="absolute inset-0"
              section="featured"
            />
          </Link>

          {/* 2 product cards */}
          {productsLoading ? (
            <>
              <div className="aspect-[3/4] rounded-[2rem] bg-card animate-pulse" />
              <div className="aspect-[3/4] rounded-[2rem] bg-card animate-pulse" />
            </>
          ) : featuredProducts.length >= 2 ? (
            featuredProducts.slice(0, 2).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            // Fallback static cards
            [0, 1].map((i) => (
              <div key={i} className="relative bg-card rounded-[2rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow group">
                <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                  −{i === 0 ? '45' : '35'}%
                </div>
                <button className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-card/90 backdrop-blur flex items-center justify-center hover:bg-card transition-colors" aria-label="Wishlist">
                  <Heart className="w-4 h-4 text-foreground/70" />
                </button>
                <div className="aspect-square overflow-hidden bg-muted/30">
                  <img src={fallbackImages[(i + 3) % 4]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-5 pb-6">
                  <h3 className="font-sans text-base text-foreground mb-2">
                    {i === 0 ? (language === 'uz' ? 'Oliviya Pro' : 'Оливия Про') : (language === 'uz' ? 'Parus' : 'Парус')}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xs text-muted-foreground line-through">{i === 0 ? '12 700 000' : '2 600 000'} {language === 'uz' ? "so'm" : 'сум'}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="font-serif font-bold text-xl text-primary">{i === 0 ? '6 985 000' : '1 690 000'} {language === 'uz' ? "so'm" : 'сум'}</span>
                  </div>
                  <Button variant="outline" className="w-full rounded-full h-11 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    {language === 'uz' ? 'Sotib olish' : 'Купить'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS GRID (only if we have more) ============ */}
      {featuredProducts.length > 2 && (
        <section className="container mx-auto px-4 lg:px-8 mt-16 lg:mt-24">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {language === 'uz' ? 'Tanlangan' : 'Избранное'}
            </h2>
            <Button asChild variant="ghost" className="rounded-full text-sm gap-2">
              <Link to="/catalog">
                {language === 'uz' ? "Hammasi" : 'Все'} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ============ INSPIRATION ("Вместе с OrisHome" instagram-style) ============ */}
      <section ref={sec4.ref} className="container mx-auto px-4 lg:px-8 mt-16 lg:mt-24 pb-20 lg:pb-28">
        <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-8">
          <EditableText
            contentKey="inspiration_title"
            fallback={language === 'uz' ? 'OrisHome bilan birga' : 'Вместе с OrisHome'}
            as="span"
            section="inspiration"
          />
        </h2>

        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 transition-all duration-700 ${sec4.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          {inspirations.map((insp, i) => (
            <a
              key={insp.key}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <EditableImage
                contentKey={insp.key}
                fallbackSrc={insp.fallback}
                alt="OrisHome interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe"
                wrapperClassName="absolute inset-0"
                section="inspiration"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 text-white/90 text-sm font-medium tracking-wide">
                @orishome
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
