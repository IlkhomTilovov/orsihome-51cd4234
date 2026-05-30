import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Heart, Headphones, Sofa, Armchair, Bed, UtensilsCrossed, Lamp, Briefcase, Sparkles, Flame, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { ProductCard } from '@/components/ProductCard';
import { useFeaturedProducts, useCategories } from '@/hooks/useProducts';
import { useActiveSets } from '@/hooks/useSets';
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
function ProductsTrack({ items }: { items: any[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const VISIBLE = 2;
  const STEP_MS = 3500;
  const DURATION = 700;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [step, setStep] = useState(0);

  const canLoop = items.length > VISIBLE;
  // Clone the first VISIBLE items at the end for seamless looping
  const renderItems = canLoop ? [...items, ...items.slice(0, VISIBLE)] : items;

  // Measure single-card step (card width + gap)
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      setStep(first.offsetWidth + gap);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items.length]);

  // Autoplay
  useEffect(() => {
    if (!canLoop) return;
    const id = window.setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [canLoop]);

  // After reaching the cloned tail, snap back to start without animation
  useEffect(() => {
    if (!canLoop) return;
    if (index === items.length) {
      const t = window.setTimeout(() => {
        setAnimate(false);
        setIndex(0);
      }, DURATION);
      return () => clearTimeout(t);
    }
  }, [index, items.length, canLoop]);

  // Re-enable animation after the snap-back paints
  useEffect(() => {
    if (!animate) {
      const r = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
      return () => cancelAnimationFrame(r);
    }
  }, [animate]);

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:gap-6 w-full">
        <div className="aspect-[3/4]" aria-hidden="true" />
        <div className="aspect-[3/4]" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-3 lg:gap-6"
        style={{
          transform: `translate3d(-${index * step}px, 0, 0)`,
          transition: animate ? `transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
        }}
      >
        {renderItems.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="shrink-0 basis-[calc((100%-0.75rem)/2)] lg:basis-[calc((100%-1.5rem)/2)]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}



function SetsCarousel({ sets, productsBySet, language, fallbackImage }: {
  sets: ReturnType<typeof useActiveSets>['sets'];
  productsBySet: ReturnType<typeof useActiveSets>['productsBySet'];
  language: 'uz' | 'ru';
  fallbackImage: string;
}) {
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animating, setAnimating] = useState(false);
  const count = sets.length;
  const touchStartX = useRef<number | null>(null);
  const DURATION = 800;
  const INNER_DURATION = 650;
  const PAGE = 2;
  const STEP_MS = 5000;

  // inner products pager state
  const [innerPage, setInnerPage] = useState(0);
  const [innerIncoming, setInnerIncoming] = useState<number | null>(null);
  const [innerAnimating, setInnerAnimating] = useState(false);

  const productsOf = (s: (typeof sets)[number]) => productsBySet[s.id] || [];
  const pageOf = (s: (typeof sets)[number], p: number) =>
    productsOf(s).slice(p * PAGE, p * PAGE + PAGE);

  const go = (next: number) => {
    if (animating) return;
    const n = ((next % count) + count) % count;
    if (n === current) return;
    const dir: 1 | -1 = n > current || (current === count - 1 && n === 0) ? 1 : -1;
    setDirection(dir);
    setIncoming(n);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    window.setTimeout(() => {
      setCurrent(n);
      setIncoming(null);
      setAnimating(false);
      setInnerPage(0);
      setInnerIncoming(null);
      setInnerAnimating(false);
    }, DURATION);
  };

  const goInner = (next: number) => {
    if (innerAnimating || animating) return;
    setInnerIncoming(next);
    requestAnimationFrame(() => requestAnimationFrame(() => setInnerAnimating(true)));
    window.setTimeout(() => {
      setInnerPage(next);
      setInnerIncoming(null);
      setInnerAnimating(false);
    }, INNER_DURATION);
  };

  const set = sets[current];
  const totalInnerPages = set ? Math.max(1, Math.ceil(productsOf(set).length / PAGE)) : 1;

  // unified autoplay: cycle inner pages first, then advance to next set
  useEffect(() => {
    if (count <= 1 && totalInnerPages <= 1) return;
    const t = setInterval(() => {
      if (animating || innerAnimating) return;
      if (innerPage < totalInnerPages - 1) {
        goInner(innerPage + 1);
      } else if (count > 1) {
        go(current + 1);
      }
    }, STEP_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, current, innerPage, totalInnerPages, animating, innerAnimating]);

  if (!set) return null;

  const EmptyCard = ({ hideOnMobile = false }: { hideOnMobile?: boolean }) => (
    <div
      className={`aspect-[3/4] ${hideOnMobile ? 'hidden lg:block' : 'block'}`}
      aria-hidden="true"
    />
  );

  const renderPair = (items: ReturnType<typeof productsOf>) => (
    <div className="grid grid-cols-2 gap-3 lg:gap-6 w-full">
      {items.length > 0 ? (
        <>
          {items.map((p) => (
            <div key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
          {items.length === 1 && <EmptyCard />}
        </>
      ) : (
        <>
          <EmptyCard />
          <EmptyCard />
        </>
      )}
    </div>
  );


  const renderSlide = (s: typeof set, withInner: boolean) => {
    const title = language === 'uz' ? s.title_uz : s.title_ru;
    const all = productsOf(s);
    const innerOn = withInner && all.length > PAGE;
    const curItems = innerOn ? pageOf(s, innerPage) : all.slice(0, PAGE);
    const incItems = innerOn && innerIncoming !== null ? pageOf(s, innerIncoming) : null;
    const showInnerTrack = innerOn && innerIncoming !== null;
    const innerTranslate = !showInnerTrack ? '0%' : (innerAnimating ? '-50%' : '0%');

    return (
      <div className="w-full">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            <span className="inline-block">{title}</span>
            <sup className="text-xl ml-2 text-muted-foreground font-normal">{all.length}</sup>
          </h2>
          <Link
            to={s.href || '/catalog'}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'uz' ? 'Barchasi' : 'Все'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_2fr] gap-4 lg:gap-6">
          <Link
            to={s.href || '/catalog'}
            className="relative aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden group shadow-soft hover:shadow-soft-lg transition-shadow"
          >
            <img
              src={s.image || fallbackImage}
              alt={title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe"
            />
          </Link>
          <div className="relative">
            <ProductsTrack items={productsOf(s)} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      {sets.map((s) => (
        <div key={s.id}>{renderSlide(s, true)}</div>
      ))}
    </div>
  );
}



export default function Index() {
  const { language } = useLanguage();
  useSEO({});

  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(4);
  const { settings } = useSystemSettings();
  const { categories } = useCategories();
  const { data: dbPromoTiles = [] } = usePromoTiles();
  const { sets, productsBySet, loading: setsLoading } = useActiveSets();
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  const cats = categories.length > 0 ? categories.slice(0, 8) : fallbackCategories;

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

  // Toifalar carousel
  const [catPerPage, setCatPerPage] = useState(4);
  const [catPage, setCatPage] = useState(0);
  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(min-width: 1024px)').matches) setCatPerPage(4);
      else if (window.matchMedia('(min-width: 768px)').matches) setCatPerPage(3);
      else setCatPerPage(2);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);
  const catTotalPages = Math.max(1, Math.ceil(cats.length / catPerPage));
  useEffect(() => { if (catPage >= catTotalPages) setCatPage(0); }, [catPerPage, catTotalPages, catPage]);
  const goCat = (dir: number) => setCatPage(p => (p + dir + catTotalPages) % catTotalPages);

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
              <h1 className="font-serif font-bold leading-[0.95] text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
                <EditableText contentKey="hero_title_line1" fallback="SOFA" as="span" className="block" section="hero" />
                <EditableText contentKey="hero_title_line2" fallback="OLIVIA" as="span" className="block" section="hero" />
              </h1>
              <p className="mt-6 text-white/80 text-base lg:text-lg italic font-serif">
                <EditableText contentKey="hero_subtitle" fallback="Design by OrisHome" as="span" section="hero" />
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ============ PROMO TILES (DB-driven, single-row carousel) ============ */}
      <section ref={sec1.ref} className="container mx-auto px-4 lg:px-8 mt-8 lg:mt-12">
        <div className="overflow-x-auto scrollbar-hide -mx-4 lg:mx-0">
          <div className="flex gap-3 px-4 lg:px-0 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:gap-4">
            {dbPromoTiles.map((tile, i) => {
              const Icon = PROMO_ICONS[tile.icon] || PROMO_ICONS.Sparkles;
              const title = language === 'uz' ? tile.title_uz : tile.title_ru;
              return (
                <Link
                  key={tile.id}
                  to={tile.href}
                  className={`group relative shrink-0 snap-start w-[32%] sm:w-[24%] md:w-[18%] lg:w-auto aspect-square rounded-2xl lg:rounded-[1.75rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500 ease-luxe hover:-translate-y-1 ${tile.bg_class}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="absolute inset-0 p-3 lg:p-5 flex flex-col justify-between">
                    <h3 className={`font-sans font-semibold text-xs lg:text-base leading-tight ${tile.text_class}`}>
                      {title}
                    </h3>
                    <Icon
                      className={`w-9 h-9 lg:w-20 lg:h-20 self-end ${tile.text_class} opacity-90 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
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
            <button
              onClick={() => goCat(-1)}
              disabled={catTotalPages <= 1}
              className="w-12 h-12 rounded-full border border-border hover:border-foreground/40 hover:bg-card transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goCat(1)}
              disabled={catTotalPages <= 1}
              className="w-12 h-12 rounded-full border border-border hover:border-foreground/40 hover:bg-card transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden -mx-2 lg:-mx-3">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translate3d(-${catPage * 100}%, 0, 0)` }}
          >
            {cats.map((cat: any, i) => {
              const name = language === 'uz' ? cat.name_uz : cat.name_ru;
              const img = cat.image || defaultServiceImages[cat.slug] || fallbackImages[i % 4];
              const FallbackIcon = cat.icon;
              return (
                <div
                  key={cat.slug || cat.id}
                  className="shrink-0 px-2 lg:px-3"
                  style={{ width: `${100 / catPerPage}%` }}
                >
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    className="group relative block aspect-[4/5] bg-card rounded-[2rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500 ease-luxe hover:-translate-y-1"
                  >
                    <div className="absolute top-6 left-0 right-0 z-10 text-center">
                      <h3 className="font-sans font-medium text-base lg:text-lg text-white px-4 drop-shadow-md">
                        {name}
                      </h3>
                    </div>
                    <div className="absolute inset-0">
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe"
                        />
                      ) : FallbackIcon ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <FallbackIcon className="w-32 h-32 text-primary/70 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.2} />
                        </div>
                      ) : null}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-[5]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {catTotalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: catTotalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCatPage(i)}
                aria-label={`Page ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === catPage ? 'w-8 bg-foreground' : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ SETLAR TO'PLAMI (DB-driven sets, carousel) ============ */}
      {(setsLoading || sets.length > 0) && (
        <section ref={sec3.ref} className="container mx-auto px-4 lg:px-8 mt-16 lg:mt-24">
          {setsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-4 lg:gap-6">
              <div className="aspect-[4/3] lg:aspect-auto rounded-[2rem] bg-card animate-pulse" />
              <div className="aspect-[3/4] rounded-[2rem] bg-card animate-pulse" />
              <div className="aspect-[3/4] rounded-[2rem] bg-card animate-pulse" />
            </div>
          ) : (
            <SetsCarousel
              sets={sets}
              productsBySet={productsBySet}
              language={language}
              fallbackImage={fallbackImages[2]}
            />
          )}
        </section>
      )}




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
