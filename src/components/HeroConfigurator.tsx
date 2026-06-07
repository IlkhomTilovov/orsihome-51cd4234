import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useActiveSets } from '@/hooks/useSets';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';

interface HeroConfiguratorProps {
  fallbackImage: string;
}

export function HeroConfigurator({ fallbackImage }: HeroConfiguratorProps) {
  const { language } = useLanguage();
  const { sets, productsBySet, loading } = useActiveSets();
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    if (sets.length > 0) {
      return sets.map((s) => {
        const products = productsBySet[s.id] || [];
        const product = products[0];
        return {
          id: s.id,
          title: language === 'uz' ? s.title_uz : s.title_ru,
          collection: language === 'uz' ? 'Luxury Collection' : 'Люкс коллекция',
          roomImage: s.image || fallbackImage,
          productImage: product?.images?.[0] || s.image || fallbackImage,
          productName: product
            ? (language === 'uz' ? (product as any).name_uz : (product as any).name_ru)
            : (language === 'uz' ? s.title_uz : s.title_ru),
          price: product?.price ?? null,
          href: s.href || `/catalog?set=${s.id}`,
        };
      });
    }
    // Fallback single item
    return [{
      id: 'default',
      title: 'SIERRA',
      collection: language === 'uz' ? 'Luxury Sofa Collection' : 'Люкс коллекция диванов',
      roomImage: fallbackImage,
      productImage: fallbackImage,
      productName: 'Sierra',
      price: null,
      href: '/catalog',
    }];
  }, [sets, productsBySet, language, fallbackImage]);

  const current = items[Math.min(active, items.length - 1)];

  if (loading) {
    return (
      <div className="w-full mx-auto" style={{ maxWidth: 1600 }}>
        <div className="h-[600px] lg:h-[850px] bg-muted/30 animate-pulse rounded-none" />
      </div>
    );
  }

  return (
    <section className="bg-white w-full">
      <div className="mx-auto px-6 lg:px-12" style={{ maxWidth: 1600 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-8 lg:gap-0 min-h-[600px] lg:h-[750px] items-center">
          {/* LEFT — Editorial copy */}
          <div className="relative z-20 py-8 lg:py-0 lg:pr-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id + '-text'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="uppercase text-[#666]"
                  style={{ fontSize: 14, letterSpacing: '2px' }}
                >
                  {current.collection}
                </p>
                <h1
                  className="font-display font-bold text-foreground mt-6"
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: 'clamp(64px, 8vw, 96px)',
                    lineHeight: 0.9,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {(current.title || '').toUpperCase()}
                </h1>
                <div className="mt-8 w-12 h-px bg-[hsl(var(--primary))]" />
                <p className="mt-8 text-[15px] leading-relaxed text-[#555] max-w-md">
                  {language === 'uz'
                    ? "Minimalist dizayn va zamonaviy uslubning mukammal uyg'unligi. Sizning makoningizga nafislik va qulaylik olib keladi."
                    : 'Идеальное сочетание минималистичного дизайна и современного стиля. Утончённость и уют для вашего пространства.'}
                </p>

                {current.price != null && (
                  <div className="mt-10">
                    <div
                      className="font-display text-foreground"
                      style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: 36,
                        fontWeight: 400,
                      }}
                    >
                      {new Intl.NumberFormat('ru-RU').format(current.price)} {language === 'uz' ? "so'm" : 'сум'}
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[2px] text-[#888]">
                      {language === 'uz' ? "Narx to'plam uchun ko'rsatilgan" : 'Цена указана за комплект'}
                    </p>
                  </div>
                )}

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    className="rounded-none h-12 px-7 text-xs uppercase tracking-[2px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-none"
                  >
                    <Link to={current.href}>
                      {language === 'uz' ? "Katalogni ko'rish" : 'Смотреть каталог'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-none h-12 px-7 text-xs uppercase tracking-[2px] border-foreground/30 text-foreground hover:bg-foreground/5 shadow-none"
                  >
                    <Link to="/checkout">
                      {language === 'uz' ? 'Buyurtma berish' : 'Заказать'}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — Showroom + floating product */}
          <div className="relative h-[420px] sm:h-[520px] lg:h-[750px] -mx-6 lg:mx-0">
            <div className="relative w-full h-full overflow-hidden">
              {/* Lifestyle room image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id + '-room'}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={current.roomImage}
                    alt={current.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      WebkitMaskImage:
                        'radial-gradient(120% 100% at 75% 45%, #000 35%, transparent 90%)',
                      maskImage:
                        'radial-gradient(120% 100% at 75% 45%, #000 35%, transparent 90%)',
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Soft white fade — left edge, bottom edge */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, #fff 0%, rgba(255,255,255,0.7) 18%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 55%, rgba(255,255,255,0.7) 85%, #fff 100%)',
                }}
              />

              {/* Floating "furniture" image — overlapping center */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={current.id + '-product'}
                  src={current.productImage}
                  alt={current.productName}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute object-contain pointer-events-none select-none"
                  style={{
                    left: '-8%',
                    right: '5%',
                    bottom: '6%',
                    top: '28%',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '95%',
                    margin: 'auto',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, #000 65%, transparent 100%)',
                    maskImage:
                      'linear-gradient(to bottom, #000 65%, transparent 100%)',
                    filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.08))',
                  }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CONFIGURATOR SELECTOR */}
        {items.length > 1 && (
          <div className="border-t border-[#eee] mt-6 lg:mt-0 pt-8 pb-10">
            <div className="flex items-center gap-8">
              <div className="hidden lg:block shrink-0 w-[180px]">
                <div
                  className="text-[#999]"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 28 }}
                >
                  {String(active + 1).padStart(2, '0')}
                </div>
                <div className="mt-2 uppercase tracking-[2px] text-xs text-foreground font-medium">
                  {current.title}
                </div>
                <div className="mt-1 text-xs text-[#888]">
                  {language === 'uz' ? "Tanlangan to'plam" : 'Выбранный комплект'}
                </div>
                <div className="mt-4 w-10 h-px bg-[hsl(var(--primary))]" />
              </div>

              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-stretch gap-4 min-w-min">
                  {items.map((it, i) => {
                    const selected = i === active;
                    return (
                      <button
                        key={it.id}
                        onClick={() => setActive(i)}
                        className={`group relative shrink-0 text-left transition-all duration-300 ${
                          selected ? '' : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{ width: 200 }}
                      >
                        <div
                          className={`relative aspect-[4/3] overflow-hidden transition-all duration-300 ${
                            selected
                              ? 'border border-[hsl(var(--primary))] bg-[#fafaf7]'
                              : 'border border-transparent bg-transparent hover:bg-[#fafaf7]'
                          }`}
                        >
                          <img
                            src={it.productImage}
                            alt={it.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3">
                          <div className="text-sm font-medium tracking-wide text-foreground uppercase">
                            {it.title}
                          </div>
                          <div className="text-xs text-[#888] mt-0.5">
                            {it.collection}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setActive((a) => Math.max(0, a - 1))}
                  disabled={active === 0}
                  className="w-11 h-11 rounded-full border border-[#ddd] flex items-center justify-center text-foreground hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={() => setActive((a) => Math.min(items.length - 1, a + 1))}
                  disabled={active === items.length - 1}
                  className="w-11 h-11 rounded-full border border-[#ddd] flex items-center justify-center text-foreground hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
