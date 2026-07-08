import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Phone, ChevronDown, ChevronRight, LayoutGrid, Tag, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCategories, useSections, type Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { CartDrawer } from '@/components/CartDrawer';
import logoAsset from '@/assets/orsi-logo.svg.asset.json';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const location = useLocation();
  const { settings } = useSystemSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { categories } = useCategories();
  const { sections } = useSections();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!catalogOpen) {
      setActiveSectionId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: promo }, { data: fresh }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .not('original_price', 'is', null)
          .gt('original_price', 0)
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4),
      ]);
      if (cancelled) return;
      const filteredPromo = (promo || []).filter(
        (p: any) => p.original_price && p.price && p.original_price > p.price
      );
      setPromoProducts(filteredPromo as Product[]);
      setNewProducts((fresh as Product[]) || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogOpen]);





  const navLinks = [
    { href: '/', label: language === 'ru' ? 'Главная' : 'Bosh sahifa' },
    { href: '/catalog', label: language === 'ru' ? 'Каталог' : 'Katalog' },
    { href: '/about', label: language === 'ru' ? 'Портфолио' : 'Biz xaqimizda' },
    { href: '/contact', label: language === 'ru' ? 'Контакты' : 'Aloqa' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const contactPhone = settings?.contact_phone || '';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-luxe relative ${
        catalogOpen
          ? 'bg-background shadow-soft-md py-2 border-b border-border/30'
          : scrolled
          ? 'glass-surface shadow-soft-md py-2'
          : 'bg-background/60 backdrop-blur-md py-4 border-b border-border/20'
      }`}
    >

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoAsset.url}
              alt="ORSI HOME"
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => {
              if (link.href === '/catalog') {
                return (
                  <div key={link.href} className="relative">
                    <button
                      type="button"
                      onClick={() => setCatalogOpen(v => !v)}
                      className={`flex items-center gap-1 text-sm font-medium tracking-widest uppercase transition-colors duration-300 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
                        isActive(link.href) || catalogOpen
                          ? 'text-primary after:w-full'
                          : 'text-muted-foreground after:w-0 hover:after:w-full'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catalogOpen ? 'rotate-180' : ''}`} />
                    </button>

                  </div>


                );
              }
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
                    isActive(link.href)
                      ? 'text-primary after:w-full'
                      : 'text-muted-foreground after:w-0 hover:after:w-full'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Language */}
            <div className="flex items-center border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setLanguage('uz')}
                className={`px-2.5 py-1 text-xs font-medium tracking-wider transition-all duration-300 ${
                  language === 'uz' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2.5 py-1 text-xs font-medium tracking-wider transition-all duration-300 ${
                  language === 'ru' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                RU
              </button>
            </div>

            {/* Phone - desktop */}
            <a 
              href={`tel:${contactPhone.replace(/\s/g, '')}`} 
              className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{contactPhone}</span>
            </a>

            {/* CTA Button - desktop */}
            <Button asChild className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm tracking-wider text-xs uppercase px-6">
              <Link to="/contact">{language === 'ru' ? 'Связаться' : "Bog'lanish"}</Link>
            </Button>

            {/* Cart */}
            <button onClick={() => setCartOpen(prev => !prev)} className="relative">
              <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary" asChild>
                <span>
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </span>
              </Button>
            </button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <nav className="lg:hidden py-6 border-t border-border/30 mt-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                if (link.href === '/catalog') {
                  return (
                    <div key={link.href}>
                      <button
                        onClick={() => setMobileCatalogOpen(v => !v)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium tracking-widest uppercase transition-colors ${
                          isActive(link.href) ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileCatalogOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileCatalogOpen && (
                        <div className="pl-6 pb-2 flex flex-col gap-1 border-l border-border/30 ml-4">
                          <Link
                            to="/catalog"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-primary"
                          >
                            {language === 'ru' ? 'Все товары' : 'Barcha tovarlar'}
                          </Link>
                          {sections.map((section) => {
                            const sectionParents = categories.filter(
                              (c) => !c.parent_id && c.section_id === section.id
                            );
                            if (sectionParents.length === 0) return null;
                            return (
                              <div key={section.id}>
                                <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  {language === 'ru' ? section.name_ru : section.name_uz}
                                </p>
                                {sectionParents.map((parent) => {
                                  const subs = categories.filter((c) => c.parent_id === parent.id);
                                  return (
                                    <div key={parent.id}>
                                      <Link
                                        to={`/catalog?category=${parent.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary block"
                                      >
                                        {language === 'ru' ? parent.name_ru : parent.name_uz}
                                      </Link>
                                      {subs.map((sub) => (
                                        <Link
                                          key={sub.id}
                                          to={`/catalog?category=${sub.slug}`}
                                          onClick={() => setIsOpen(false)}
                                          className="pl-8 pr-4 py-2 text-sm text-muted-foreground hover:text-primary block"
                                        >
                                          — {language === 'ru' ? sub.name_ru : sub.name_uz}
                                        </Link>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                          {categories.filter((c) => !c.parent_id && !c.section_id).length > 0 && (
                            <div>
                              <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {language === 'ru' ? 'Другое' : 'Boshqa'}
                              </p>
                              {categories.filter((c) => !c.parent_id && !c.section_id).map((parent) => {
                                const subs = categories.filter((c) => c.parent_id === parent.id);
                                return (
                                  <div key={parent.id}>
                                    <Link
                                      to={`/catalog?category=${parent.slug}`}
                                      onClick={() => setIsOpen(false)}
                                      className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary block"
                                    >
                                      {language === 'ru' ? parent.name_ru : parent.name_uz}
                                    </Link>
                                    {subs.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={`/catalog?category=${sub.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="pl-8 pr-4 py-2 text-sm text-muted-foreground hover:text-primary block"
                                      >
                                        — {language === 'ru' ? sub.name_ru : sub.name_uz}
                                      </Link>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 text-sm font-medium tracking-widest uppercase transition-colors ${
                      isActive(link.href) ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" /> {contactPhone}
              </a>
            </div>
          </nav>
        )}
      </div>

      {/* Floating Mega Menu */}
      {catalogOpen && createPortal(
        (() => {
          const displaySections = [
            ...sections.map((s) => ({
              id: s.id,
              name: language === 'ru' ? s.name_ru : s.name_uz,
              parents: categories.filter((c) => !c.parent_id && c.section_id === s.id),
            })),
            {
              id: '__none__',
              name: language === 'ru' ? 'Другое' : 'Boshqa',
              parents: categories.filter((c) => !c.parent_id && !c.section_id),
            },
          ].filter((s) => s.parents.length > 0);

          const activeSection = displaySections.find((s) => s.id === activeSectionId);

          const formatPrice = (v: number | null) =>
            v == null ? '' : new Intl.NumberFormat('ru-RU').format(v) + " so'm";

          const ProductMini = ({ p }: { p: Product }) => (
            <Link
              to={`/product/${p.slug}`}
              onClick={() => setCatalogOpen(false)}
              className="group flex gap-3 p-2 rounded-xl hover:bg-white transition-colors"
            >
              <div className="w-[68px] h-[68px] rounded-xl bg-neutral-100 overflow-hidden shrink-0 ring-1 ring-black/5">
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name_uz}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className="text-[13px] font-medium text-neutral-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {language === 'ru' ? p.name_ru : p.name_uz}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold text-neutral-900">{formatPrice(p.price)}</span>
                  {p.original_price && p.price && p.original_price > p.price && (
                    <span className="text-[11px] line-through text-neutral-400">
                      {formatPrice(p.original_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );

          return (
            <>
              <div
                className="fixed inset-0 bg-neutral-950/50 backdrop-blur-md z-[60] animate-fade-in"
                onClick={() => setCatalogOpen(false)}
              />
              <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[70] w-[95%] h-[95%] bg-white rounded-[28px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5 overflow-hidden flex animate-fade-in">
                {/* Dark left sidebar */}
                <aside
                  className="w-[280px] shrink-0 bg-neutral-950 text-neutral-100 flex flex-col"
                  onMouseLeave={() => setActiveSectionId(null)}
                >
                  <div className="px-6 pt-6 pb-4 flex items-center gap-2.5">
                    <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-white/10">
                      <LayoutGrid className="w-4 h-4" />
                    </span>
                    <div className="text-[15px] font-semibold tracking-wide">
                      {language === 'ru' ? 'Каталог' : 'Katalog'}
                    </div>
                  </div>

                  <div className="px-4">
                    <Link
                      to="/catalog"
                      onClick={() => setCatalogOpen(false)}
                      onMouseEnter={() => setActiveSectionId(null)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                        activeSectionId === null
                          ? 'bg-white/10 text-white'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-[17px] h-[17px]" strokeWidth={1.75} />
                      <span>{language === 'ru' ? 'Все товары' : 'Barcha tovarlar'}</span>
                    </Link>
                  </div>

                  <div className="mx-6 my-4 h-px bg-white/10" />

                  <div className="px-4 pb-2">
                    <p className="px-3 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      {language === 'ru' ? 'Разделы' : "Bo'limlar"}
                    </p>
                  </div>

                  <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
                    {displaySections.map((section) => {
                      const isActive = activeSectionId === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onMouseEnter={() => setActiveSectionId(section.id)}
                          onClick={() => setActiveSectionId(section.id)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-[13.5px] font-medium transition-all ${
                            isActive
                              ? 'bg-white text-neutral-950 shadow-sm'
                              : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{section.name}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-50'}`} />
                        </button>
                      );
                    })}
                  </nav>

                  <div className="px-6 py-4 border-t border-white/10 text-[11px] text-neutral-500">
                    ORSI HOME · {language === 'ru' ? 'Мебель' : 'Mebel'}
                  </div>
                </aside>

                {/* Right content */}
                <div className="flex-1 flex flex-col bg-neutral-50/60 min-w-0">
                  <div className="flex items-center justify-between px-7 py-4 bg-white border-b border-neutral-200/70">
                    <div className="flex items-center gap-2 text-[13px] text-neutral-500">
                      <span className="font-medium text-neutral-900">
                        {activeSection
                          ? activeSection.name
                          : language === 'ru' ? 'Рекомендуем' : 'Tavsiya etamiz'}
                      </span>
                      {activeSection && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>{activeSection.parents.length} {language === 'ru' ? 'категорий' : 'kategoriya'}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setCatalogOpen(false)}
                      className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                      aria-label="close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {activeSection ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {activeSection.parents.map((parent) => {
                          const subs = categories.filter((c) => c.parent_id === parent.id);
                          return (
                            <div
                              key={parent.id}
                              className="bg-white rounded-2xl p-4 ring-1 ring-black/5 hover:ring-primary/30 hover:shadow-sm transition-all"
                            >
                              <Link
                                to={`/catalog?category=${parent.slug}`}
                                onClick={() => setCatalogOpen(false)}
                                className="flex items-center gap-3 mb-3 group"
                              >
                                {parent.image ? (
                                  <img
                                    src={parent.image}
                                    alt=""
                                    className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
                                  />
                                ) : (
                                  <span className="w-11 h-11 rounded-xl bg-neutral-100 shrink-0" />
                                )}
                                <span className="text-[14px] font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
                                  {language === 'ru' ? parent.name_ru : parent.name_uz}
                                </span>
                              </Link>
                              {subs.length > 0 && (
                                <ul className="space-y-0.5">
                                  {subs.slice(0, 5).map((sub) => (
                                    <li key={sub.id}>
                                      <Link
                                        to={`/catalog?category=${sub.slug}`}
                                        onClick={() => setCatalogOpen(false)}
                                        className="block text-[12.5px] py-1 text-neutral-500 hover:text-primary transition-colors"
                                      >
                                        · {language === 'ru' ? sub.name_ru : sub.name_uz}
                                      </Link>
                                    </li>
                                  ))}
                                  {subs.length > 5 && (
                                    <li>
                                      <Link
                                        to={`/catalog?category=${parent.slug}`}
                                        onClick={() => setCatalogOpen(false)}
                                        className="block text-[12px] py-1 text-primary font-medium"
                                      >
                                        +{subs.length - 5} {language === 'ru' ? 'ещё' : "yana"}
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <section className="bg-white rounded-2xl p-5 ring-1 ring-black/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex w-8 h-8 rounded-lg bg-primary/10 text-primary items-center justify-center">
                                <Tag className="w-4 h-4" />
                              </span>
                              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
                                {language === 'ru' ? 'Со скидкой' : 'Chegirmada'}
                              </h3>
                            </div>
                            <Link
                              to="/catalog?discounted=1"
                              onClick={() => setCatalogOpen(false)}
                              className="text-[11.5px] font-medium text-neutral-500 hover:text-primary flex items-center gap-1"
                            >
                              {language === 'ru' ? 'Все' : 'Barchasi'}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="flex flex-col gap-1">
                            {promoProducts.length === 0 ? (
                              <p className="text-sm text-neutral-400 px-2 py-8 text-center">
                                {language === 'ru' ? 'Пока нет товаров' : "Hozircha mahsulot yo'q"}
                              </p>
                            ) : (
                              promoProducts.map((p) => <ProductMini key={p.id} p={p} />)
                            )}
                          </div>
                        </section>
                        <section className="bg-white rounded-2xl p-5 ring-1 ring-black/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex w-8 h-8 rounded-lg bg-primary/10 text-primary items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                              </span>
                              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
                                {language === 'ru' ? 'Новинки' : 'Yangi kelganlar'}
                              </h3>
                            </div>
                            <Link
                              to="/catalog"
                              onClick={() => setCatalogOpen(false)}
                              className="text-[11.5px] font-medium text-neutral-500 hover:text-primary flex items-center gap-1"
                            >
                              {language === 'ru' ? 'Все' : 'Barchasi'}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="flex flex-col gap-1">
                            {newProducts.length === 0 ? (
                              <p className="text-sm text-neutral-400 px-2 py-8 text-center">
                                {language === 'ru' ? 'Пока нет товаров' : "Hozircha mahsulot yo'q"}
                              </p>
                            ) : (
                              newProducts.map((p) => <ProductMini key={p.id} p={p} />)
                            )}
                          </div>
                        </section>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })(),
        document.body
      )}






      {createPortal(
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />,
        document.body
      )}
    </header>
  );
}
