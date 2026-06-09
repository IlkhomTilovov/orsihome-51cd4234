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
import heroSofaMobile from '@/assets/hero-sofa-mobile.png.asset.json';

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

  // inner products pager: sliding by 1 (window of 2 visible, wraps around)
  const [innerStart, setInnerStart] = useState(0);
  const [innerAnimating, setInnerAnimating] = useState(false);
  // Pause autoplay briefly after user interaction so clicks aren't fought by the timer
  const [pausedUntil, setPausedUntil] = useState(0);
  const pauseAutoplay = (ms = 6000) => setPausedUntil(Date.now() + ms);

  useEffect(() => {
    sets.forEach((item) => {
      const src = item.image || fallbackImage;
      if (!src) return;
      const image = new Image();
      image.src = src;
    });
  }, [sets, fallbackImage]);

  useEffect(() => {
    const productImages = new Set<string>();
    Object.values(productsBySet).forEach((products) => {
      products.forEach((product) => {
        const src = product.images?.[0];
        if (src) productImages.add(src);
      });
    });

    productImages.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [productsBySet]);

  const productsOf = (s: (typeof sets)[number]) => productsBySet[s.id] || [];

  const go = (next: number) => {
    if (animating) return;
    const n = ((next % count) + count) % count;
    if (n === current) return;
    const dir: 1 | -1 = n > current || (current === count - 1 && n === 0) ? 1 : -1;
    setDirection(dir);
    // Reset inner window immediately so the incoming set starts at item 0
    // (otherwise products would visually "jump" after the crossfade completes)
    setInnerStart(0);
    setInnerAnimating(false);
    setIncoming(n);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    window.setTimeout(() => {
      setCurrent(n);
      setIncoming(null);
      setAnimating(false);
    }, DURATION);
  };

  const goInnerNext = () => {
    if (innerAnimating || animating) return;
    requestAnimationFrame(() => requestAnimationFrame(() => setInnerAnimating(true)));
    window.setTimeout(() => {
      setInnerStart((s) => s + 1);
      setInnerAnimating(false);
    }, INNER_DURATION);
  };

  const set = sets[current];
  const productsLen = set ? productsOf(set).length : 0;
  const canInnerSlide = productsLen > PAGE;

  // unified autoplay: slide inner by 1 each tick; advance to next set after full loop
  useEffect(() => {
    if (count <= 1 && !canInnerSlide) return;
    const t = setInterval(() => {
      if (animating || innerAnimating) return;
      if (Date.now() < pausedUntil) return;
      if (canInnerSlide) {
        // after innerStart wraps fully (productsLen steps), advance set
        if (count > 1 && productsLen > 0 && innerStart > 0 && innerStart % productsLen === 0) {
          go(current + 1);
        } else {
          goInnerNext();
        }
      } else if (count > 1) {
        go(current + 1);
      }
    }, STEP_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, current, innerStart, canInnerSlide, productsLen, animating, innerAnimating, pausedUntil]);


  if (!set) return null;

  const EmptyCard = ({ hideOnMobile = false }: { hideOnMobile?: boolean }) => (
    <div
      className={`aspect-[3/4] ${hideOnMobile ? 'hidden lg:block' : 'block'}`}
      aria-hidden="true"
    />
  );

  const renderPair = (items: ReturnType<typeof productsOf>) => (
    <div className="grid grid-cols-2 gap-3 lg:gap-6 w-full my-0 mx-0 px-0 py-[5px]">
      {items.length > 0 ? (
        <>
          {items.map((p, i) => (
            <div key={(p?.id || 'e') + '-' + i} className="h-full">
              <ProductCard product={p} eager />
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
    // Build sliding window: render 3 cards (current pair + next-after) so we can slide left by 1 card
    const at = (i: number) => all[((i % all.length) + all.length) % all.length];
    const startIdx = innerOn ? innerStart : 0;
    const curItems = innerOn
      ? [at(startIdx), at(startIdx + 1)]
      : all.slice(0, PAGE);
    const tailItem = innerOn ? at(startIdx + 2) : null;
    const showInnerTrack = innerOn;
    // track width = 200% (two pairs), translate -50% slides one card forward (overlapping pair)
    const innerTranslate = !showInnerTrack ? '0%' : (innerAnimating ? '-50%' : '0%');

    return (
      <div className="w-full">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            <span className="inline-block">{title}</span>
            
          </h2>
          <Link
            to={`/catalog?set=${s.id}`}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'uz' ? 'Barchasi' : 'Все'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_2fr] gap-2 lg:gap-6 bg-background isolate">
          <Link
            to={`/catalog?set=${s.id}`}
            className="relative aspect-[16/10] lg:aspect-auto rounded-[2rem] overflow-hidden bg-card group"
          >
            <img
              src={s.image || fallbackImage}
              alt={title}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe"
            />

          </Link>
          <div className="relative overflow-hidden bg-background">
            <div
              className="flex"
              style={{
                width: showInnerTrack ? '200%' : '100%',
                transform: `translate3d(${innerTranslate}, 0, 0)`,
                transition: innerAnimating
                  ? `transform ${INNER_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
                  : 'none',
              }}
            >
              <div className="shrink-0" style={{ width: showInnerTrack ? '50%' : '100%' }}>
                {renderPair(curItems)}
              </div>
              {showInnerTrack && tailItem && (
                <div className="shrink-0" style={{ width: '50%' }}>
                  {renderPair([curItems[1], tailItem])}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // Outer: forward (→) track = [current, incoming], translate 0% → -50%
  //        backward (←) track = [incoming, current], translate -50% → 0%
  // Outer transition: crossfade (no horizontal bleed of neighboring sets)
  const showTrack = incoming !== null;
  const incomingSet = incoming !== null ? sets[incoming] : null;

  return (
    <div className="relative">
      <div
        className="relative py-4"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) { pauseAutoplay(); go(current + (dx < 0 ? 1 : -1)); }
          touchStartX.current = null;
        }}
      >
        <div className="relative">
          {/* Current set */}
          <div
            style={{
              opacity: 1,
            }}
          >
            {renderSlide(set, !showTrack)}
          </div>
          {/* Incoming set (absolute overlay, fades in) */}
          {showTrack && incomingSet && (
            <div
              className="absolute inset-0 bg-background"
              style={{
                opacity: animating ? 1 : 0,
                transition: `opacity ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {renderSlide(incomingSet, false)}
            </div>
          )}
        </div>
      </div>


      {count > 1 && (
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={() => { pauseAutoplay(); go(current - 1); }}
            className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-card hover:border-primary/40 transition-all hover:-translate-x-0.5"
            aria-label="Previous"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                onClick={() => { pauseAutoplay(); go(i); }}
                className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground/40'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => { pauseAutoplay(); go(current + 1); }}
            className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:bg-card hover:border-primary/40 transition-all hover:translate-x-0.5"
            aria-label="Next"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

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

  // Toifalar carousel — one-at-a-time autoplay with seamless infinite loop
  const [catPerPage, setCatPerPage] = useState(4);
  const [catIndex, setCatIndex] = useState(0);
  const [catAnimate, setCatAnimate] = useState(true);
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
  // Reset to 0 if data shrinks
  useEffect(() => { if (catIndex > cats.length) setCatIndex(0); }, [cats.length, catIndex]);
  // Build a looped list: original + clone of first `catPerPage` so we can slide past the end seamlessly
  const catsLooped = cats.length > 0 ? [...cats, ...cats.slice(0, catPerPage)] : cats;
  const catTotalPages = Math.max(1, Math.ceil(cats.length / catPerPage));
  const goCat = (dir: number) => {
    if (cats.length === 0) return;
    setCatAnimate(true);
    setCatIndex((p) => p + dir);
  };
  // Autoplay: advance by 1 every 5s
  useEffect(() => {
    if (cats.length <= catPerPage) return;
    const t = setInterval(() => {
      setCatAnimate(true);
      setCatIndex((p) => p + 1);
    }, 5000);
    return () => clearInterval(t);
  }, [cats.length, catPerPage]);
  // When we cross past the end (into the cloned tail), snap back without animation
  useEffect(() => {
    if (cats.length === 0) return;
    if (catIndex >= cats.length) {
      const t = setTimeout(() => {
        setCatAnimate(false);
        setCatIndex((p) => p - cats.length);
      }, 700); // match transition duration
      return () => clearTimeout(t);
    }
    if (catIndex < 0) {
      const t = setTimeout(() => {
        setCatAnimate(false);
        setCatIndex((p) => p + cats.length);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [catIndex, cats.length]);
  // Re-enable animation on next frame after a snap
  useEffect(() => {
    if (!catAnimate) {
      const r = requestAnimationFrame(() => setCatAnimate(true));
      return () => cancelAnimationFrame(r);
    }
  }, [catAnimate]);


  return (
    <div className="min-h-screen bg-background">
      {/* ============ HERO (Apple-style: huge type + product + side promo) ============ */}
      <section className="container mx-auto px-4 lg:px-8 pt-6 lg:pt-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Main hero card */}
          <div className="relative bg-card rounded-[2rem] overflow-hidden shadow-soft h-[260px] sm:h-[360px] lg:h-auto lg:min-h-[620px]">
            {/* Full-bleed background image (admin-managed) */}
            <EditableImage
              contentKey="hero_product_image"
              fallbackSrc={fallbackImages[0]}
              alt="OrisHome premium furniture"
              className="absolute inset-0 w-full h-full object-cover object-center"
              wrapperClassName="absolute inset-0 w-full h-full"
              section="hero"
            />


            {/* Light blur overlay for readability */}
            <div className="absolute inset-0 bg-[#f9f9f6]/[0.32] pointer-events-none" />


            {/* Text content overlay - hidden on mobile */}
            <div className="relative h-full hidden sm:flex flex-col justify-center p-8 lg:p-14 max-w-2xl z-10">
              <h1 className="font-serif font-bold leading-[0.95] text-foreground text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
                <EditableText contentKey="hero_title_line1" fallback="SOFA" as="span" className="block" section="hero" />
              </h1>
              <p className="mt-6 text-foreground/70 text-base lg:text-lg font-sans">
                <EditableText contentKey="hero_subtitle" fallback="Design by OrisHome" as="span" section="hero" />
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ============ PROMO TILES (DB-driven, single-row carousel) ============ */}
      <section ref={sec1.ref} className="container mx-auto px-4 lg:px-8 mt-8 lg:mt-12">
        <div className="overflow-x-auto scrollbar-hide -mx-4 lg:mx-0">
          <div className="flex gap-3 lg:gap-4 px-4 lg:px-0 snap-x snap-mandatory">
            {dbPromoTiles.map((tile, i) => {
              const Icon = PROMO_ICONS[tile.icon] || PROMO_ICONS.Sparkles;
              const title = language === 'uz' ? tile.title_uz : tile.title_ru;
              return (
                <Link
                  key={tile.id}
                  to={`/catalog?promo=${tile.id}`}
                  className={`group relative shrink-0 snap-start w-[32%] sm:w-[24%] md:w-[18%] lg:w-[14%] aspect-square rounded-2xl lg:rounded-[1.75rem] overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-500 ease-luxe hover:-translate-y-1 ${tile.bg_class}`}
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
            className="flex"
            style={{
              transform: `translate3d(-${(catIndex * 100) / catPerPage}%, 0, 0)`,
              transition: catAnimate ? 'transform 700ms cubic-bezier(0.22,1,0.36,1)' : 'none',
            }}
          >
            {catsLooped.map((cat: any, i) => {
              const name = language === 'uz' ? cat.name_uz : cat.name_ru;
              const img = cat.image || defaultServiceImages[cat.slug] || fallbackImages[i % 4];
              const FallbackIcon = cat.icon;
              return (
                <div
                  key={(cat.slug || cat.id) + '-' + i}
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

        {cats.length > catPerPage && (
          <div className="flex justify-center gap-2 mt-6">
            {cats.map((_, i) => {
              const active = ((catIndex % cats.length) + cats.length) % cats.length === i;
              return (
                <button
                  key={i}
                  onClick={() => { setCatAnimate(true); setCatIndex(i); }}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active ? 'w-8 bg-foreground' : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
                  }`}
                />
              );
            })}
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

    </div>
  );
}
