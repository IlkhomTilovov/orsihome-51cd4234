import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroProducts, type HeroProduct } from '@/hooks/useHeroProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { LazyImage } from '@/components/LazyImage';

const AUTOPLAY_MS = 6000;
const FADE_MS = 1200;

interface Props {
  fallbackImage: string;
}

export function HeroSlider({ fallbackImage }: Props) {
  const { products, loading } = useHeroProducts();
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);

  const slides: HeroProduct[] = products.length > 0 ? products : [];

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  // Loading skeleton (no FOOC)
  if (loading) {
    return (
      <section className="relative w-full h-[calc(100vh-5rem)] min-h-[560px] bg-card animate-pulse" />
    );
  }

  // Empty state — minimal premium fallback (no fake data text)
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[calc(100vh-5rem)] min-h-[560px] overflow-hidden bg-card">
        <img src={fallbackImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </section>
    );
  }

  const active = slides[index];
  const title =
    (language === 'uz' ? active.hero_title_uz : active.hero_title_ru) ||
    (language === 'uz' ? active.name_uz : active.name_ru);
  const subtitle =
    (language === 'uz' ? active.hero_subtitle_uz : active.hero_subtitle_ru) ||
    (language === 'uz' ? 'Premium Kolleksiya' : 'Премиум Коллекция');
  const description = language === 'uz' ? active.description_uz : active.description_ru;
  const image = active.images?.[0] || fallbackImage;

  return (
    <section className="relative w-full h-[calc(100vh-5rem)] min-h-[560px] overflow-hidden bg-background">
      {/* Layered slides for fade transition */}
      <div className="absolute inset-0">
        {slides.map((s, i) => {
          const img = s.images?.[0] || fallbackImage;
          const isActive = i === index;
          return (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity"
              style={{
                opacity: isActive ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              {/* Desktop layout */}
              <div className="hidden lg:grid grid-cols-2 h-full">
                <div className="relative h-full bg-gradient-to-br from-background to-card" />
                <div className="relative h-full overflow-hidden bg-card">
                  <img
                    src={img}
                    alt={language === 'uz' ? s.name_uz : s.name_ru}
                    className="absolute inset-0 w-full h-full object-contain p-6 lg:p-12"
                    style={{
                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                      transition: `transform 8000ms ease-out`,
                    }}
                  />
                </div>
              </div>
              {/* Mobile layout: text top, image bottom */}
              <div className="lg:hidden grid grid-rows-2 h-full">
                <div className="bg-background" />
                <div className="relative overflow-hidden bg-card">
                  <img
                    src={img}
                    alt={language === 'uz' ? s.name_uz : s.name_ru}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                    style={{
                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                      transition: `transform 8000ms ease-out`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium gradient — no harsh dark overlay */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 lg:hidden bg-gradient-to-b from-background/90 via-background/20 to-transparent" />

      {/* Text content */}
      <div className="relative h-full container mx-auto px-6 lg:px-12">
        <div className="h-full grid lg:grid-cols-2 grid-rows-2 lg:grid-rows-1">
          <div className="flex flex-col justify-center max-w-xl pt-8 lg:pt-0 z-10">
            <p
              key={`sub-${active.id}`}
              className="font-sans uppercase tracking-[0.3em] text-xs lg:text-sm text-primary mb-4 lg:mb-6 animate-fade-in"
            >
              {subtitle}
            </p>
            <h1
              key={`title-${active.id}`}
              className="font-serif font-light leading-[0.92] tracking-tight text-foreground animate-fade-in"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8.75rem)' }}
            >
              {title}
            </h1>
            {description && (
              <p
                key={`desc-${active.id}`}
                className="hidden lg:block mt-8 text-muted-foreground text-base lg:text-lg max-w-md leading-relaxed animate-fade-in"
              >
                {description}
              </p>
            )}
            <div className="mt-8 lg:mt-10 flex flex-wrap gap-3 lg:gap-4 animate-fade-in">
              <Button asChild size="lg" className="rounded-none px-8 h-12 lg:h-14 text-sm tracking-wider uppercase">
                <Link to="/catalog">
                  {language === 'uz' ? "Katalogni ko'rish" : 'Смотреть каталог'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-none px-8 h-12 lg:h-14 text-sm tracking-wider uppercase border-foreground/30"
              >
                <Link to={active.slug ? `/product/${active.slug}` : '/catalog'}>
                  {language === 'uz' ? 'Buyurtma berish' : 'Заказать'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 lg:bottom-10 left-0 right-0 z-20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-4 lg:gap-6">
              <span className="font-serif text-foreground text-xl lg:text-2xl tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 max-w-xs flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="group relative h-px flex-1 bg-foreground/20 overflow-hidden"
                  >
                    <span
                      className="absolute inset-0 bg-foreground origin-left"
                      style={{
                        transform: i === index ? 'scaleX(1)' : i < index ? 'scaleX(1)' : 'scaleX(0)',
                        transition: i === index ? `transform ${AUTOPLAY_MS}ms linear` : 'transform 400ms ease',
                      }}
                    />
                  </button>
                ))}
              </div>
              <span className="font-serif text-muted-foreground text-xl lg:text-2xl tabular-nums">
                {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
