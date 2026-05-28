import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Shield, Ruler, Gem, Truck, Star, Paintbrush, Users, ChevronRight, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { useFeaturedProducts, useCategories } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import { useState, useEffect, useRef } from 'react';

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

const iconMap: Record<string, any> = {
  Shield, Ruler, Gem, Truck, Star, Paintbrush, Users,
};

export default function Index() {
  const { language } = useLanguage();
  useSEO({});
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts(8);
  const { settings } = useSystemSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  const whyUsItems = [
    { key: 'whyus_1', icon: 'Shield', titleFallback: '5 yil kafolat', descFallback: 'Barcha mahsulotlarga 5 yillik kafolat' },
    { key: 'whyus_2', icon: 'Paintbrush', titleFallback: 'Individual dizayn', descFallback: 'Sizning didingizga mos dizayn' },
    { key: 'whyus_3', icon: 'Ruler', titleFallback: "O'lchov asosida", descFallback: "Aniq o'lchovlar bo'yicha ishlab chiqarish" },
    { key: 'whyus_4', icon: 'Users', titleFallback: 'Tajribali ustalar', descFallback: '10+ yillik tajribaga ega mutaxassislar' },
    { key: 'whyus_5', icon: 'Gem', titleFallback: 'Premium materiallar', descFallback: 'Faqat yuqori sifatli materiallar' },
    { key: 'whyus_6', icon: 'Truck', titleFallback: 'Tez yetkazib berish', descFallback: "Toshkent bo'ylab bepul yetkazib berish" },
  ];

  const steps = [
    { key: 'step_1', num: '01', titleFallback: "O'lchov olish", descFallback: "Ustamiz siznikiga kelib bepul o'lchov oladi" },
    { key: 'step_2', num: '02', titleFallback: 'Dizayn yaratish', descFallback: '3D dizayn tayyorlab, sizga taqdim etamiz' },
    { key: 'step_3', num: '03', titleFallback: 'Ishlab chiqarish', descFallback: 'Premium materiallarda tayyor qilamiz' },
    { key: 'step_4', num: '04', titleFallback: "O'rnatish", descFallback: "Professional o'rnatish va sozlash" },
  ];

  const testimonials = [
    { key: 'testimonial_1', nameFallback: 'Sardor Karimov', textFallback: "WOODMAX bilan ishlaganim uchun juda mamnunman. Sifat a'lo darajada, dizayn zamonaviy.", roleFallback: 'Mijoz' },
    { key: 'testimonial_2', nameFallback: 'Nilufar Rahimova', textFallback: "Oshxona mebelini buyurtma qildik, natija kutganimizdan ham yaxshi chiqdi. Rahmat!", roleFallback: 'Mijoz' },
    { key: 'testimonial_3', nameFallback: 'Bobur Toshmatov', textFallback: "TV zona va shkaf buyurtma qildim. Professional yondashuv va sifatli ish.", roleFallback: 'Mijoz' },
  ];

  const trustBadges = [
    { key: 'trust_1', icon: Paintbrush, fallback: 'Individual dizayn' },
    { key: 'trust_2', icon: Ruler, fallback: "Bepul o'lchov" },
    { key: 'trust_3', icon: Gem, fallback: 'Premium materiallar' },
    { key: 'trust_4', icon: Truck, fallback: 'Tez yetkazib berish' },
  ];

  const sectionServices = useInView();
  const sectionWhyUs = useInView();
  const sectionProcess = useInView();
  const sectionProducts = useInView();
  const sectionTestimonials = useInView();
  const sectionCta = useInView();

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative flex items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="absolute inset-0 z-0">
          <EditableImage
            contentKey="hero_background_image"
            fallbackSrc="/images/hero-default.jpg"
            alt="Premium mebel showroom"
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
            section="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 z-20 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <div className="max-w-2xl">
            <div className="inline-block mb-6 px-4 py-1.5 border border-primary/40 rounded-sm">
              <EditableText
                contentKey="hero_badge"
                fallback="Premium mebel"
                as="span"
                className="text-primary text-xs font-medium tracking-[0.3em] uppercase"
                section="hero"
              />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              <EditableText
                contentKey="hero_title"
                fallback="Premium Mebel Dizayni"
                as="span"
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
                section="hero"
              />
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
              <EditableText
                contentKey="hero_subtitle"
                fallback="Zamonaviy, sifatli va individual buyurtma asosida ishlab chiqariladi"
                as="span"
                className="text-lg md:text-xl"
                section="hero"
              />
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 tracking-wider text-sm uppercase h-14">
                <Link to="/contact">
                  <EditableText contentKey="hero_cta_primary" fallback="Buyurtma berish" as="span" section="hero" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-transparent hover:text-white hover:border-white/30 rounded-sm px-8 tracking-wider text-sm uppercase h-14 transition-none">
                <Link to="/about">
                  <EditableText contentKey="hero_cta_secondary" fallback="Portfolio ko'rish" as="span" section="hero" />
                </Link>
              </Button>
            </div>

            {/* Trust badges - editable */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map((badge) => (
                <div key={badge.key} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm px-4 py-3">
                  <badge.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <EditableText
                    contentKey={badge.key}
                    fallback={badge.fallback}
                    as="span"
                    className="text-white/80 text-xs font-medium"
                    section="hero"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES - editable */}
      <section ref={sectionServices.ref} className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionServices.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="services_label" fallback="Xizmatlar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="services" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="services_title" fallback="Biz nimalar qilamiz" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="services" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : categories.length > 0 ? (
              categories.map((cat, i) => {
                const name = language === 'uz' ? cat.name_uz : cat.name_ru;
                const fallbackImage = defaultServiceImages[cat.slug] || serviceWardrobe;
                return (
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    key={cat.id}
                    className={`group relative aspect-[3/4] rounded-sm overflow-hidden cursor-pointer transition-all duration-700 ${sectionServices.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <img
                      src={cat.image || fallbackImage}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="font-serif text-xl font-semibold text-white mb-1">
                        {name}
                      </h3>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                {language === 'uz' ? 'Hozircha toifalar yo\'q' : 'Категорий пока нет'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* WHY US - editable */}
      <section ref={sectionWhyUs.ref} className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="whyus_label" fallback="Afzalliklar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="whyus" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="whyus_title" fallback="Nega aynan biz" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="whyus" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyUsItems.map((item, i) => {
              const IconComp = iconMap[item.icon] || Shield;
              return (
                <div
                  key={item.key}
                  className={`text-center p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 group relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-primary/10 hover:-translate-y-1 ${sectionWhyUs.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <IconComp className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      <EditableText contentKey={`${item.key}_title`} fallback={item.titleFallback} as="span" className="font-serif text-lg font-semibold" section="whyus" />
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      <EditableText contentKey={`${item.key}_desc`} fallback={item.descFallback} as="span" className="text-sm" section="whyus" />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS - editable */}
      <section ref={sectionProcess.ref} className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionProcess.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="process_label" fallback="Jarayon" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="process" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="process_title" fallback="Qanday ishlaymiz" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="process" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.key}
                className={`relative text-center transition-all duration-700 ${sectionProcess.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <span className="font-serif text-6xl font-bold text-primary/20">{step.num}</span>
                <h3 className="font-serif text-lg font-semibold text-foreground mt-2 mb-2">
                  <EditableText contentKey={`${step.key}_title`} fallback={step.titleFallback} as="span" className="font-serif text-lg font-semibold" section="process" />
                </h3>
                <p className="text-muted-foreground text-sm">
                  <EditableText contentKey={`${step.key}_desc`} fallback={step.descFallback} as="span" className="text-sm" section="process" />
                </p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-8 -right-4 w-8 h-8 text-primary/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section ref={sectionProducts.ref} className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4 transition-all duration-700 ${sectionProducts.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <EditableText contentKey="products_label" fallback="Katalog" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="products" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2">
                <EditableText contentKey="featured_title" fallback="Tanlangan mahsulotlar" as="span" className="font-serif text-3xl md:text-4xl font-bold" section="products" />
              </h2>
            </div>
            <Button asChild variant="outline" className="gap-2 rounded-sm border-border hover:border-primary text-sm tracking-wider uppercase">
              <Link to="/catalog">Barchasini ko'rish <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">
              Hozircha tanlangan mahsulotlar yo'q
            </p>
          )}
        </div>
      </section>

      {/* TESTIMONIALS - editable */}
      <section ref={sectionTestimonials.ref} className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${sectionTestimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EditableText contentKey="testimonials_label" fallback="Fikrlar" as="span" className="text-primary text-xs tracking-[0.3em] uppercase font-medium" section="testimonials" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              <EditableText contentKey="testimonials_title" fallback="Mijozlarimiz nima deydi" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="testimonials" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <div
                key={item.key}
                className={`p-8 border border-border rounded-sm transition-all duration-700 ${sectionTestimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  "<EditableText contentKey={`${item.key}_text`} fallback={item.textFallback} as="span" className="text-sm" section="testimonials" />"
                </p>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    <EditableText contentKey={`${item.key}_name`} fallback={item.nameFallback} as="span" className="font-medium text-sm" section="testimonials" />
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <EditableText contentKey={`${item.key}_role`} fallback={item.roleFallback} as="span" className="text-xs" section="testimonials" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - editable */}
      <section ref={sectionCta.ref} className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[url('/images/hero-default.jpg')] bg-cover bg-center opacity-10" />
        <div className={`container mx-auto px-4 lg:px-8 relative z-10 text-center transition-all duration-700 ${sectionCta.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            <EditableText contentKey="cta_title" fallback="Hoziroq buyurtma bering" as="span" className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold" section="cta" />
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            <EditableText contentKey="cta_subtitle" fallback="Bepul konsultatsiya va o'lchov uchun biz bilan bog'laning" as="span" className="text-lg" section="cta" />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-sm px-8 tracking-wider text-sm uppercase h-14">
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`}>
                <Phone className="w-4 h-4 mr-2" />
                {contactPhone}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm px-8 tracking-wider text-sm uppercase h-14 bg-transparent">
              <a href={settings?.social_telegram || '#'} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}


