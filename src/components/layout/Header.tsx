import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Phone, ChevronDown, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCategories, useSections } from '@/hooks/useProducts';
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
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Group parent categories by section
  const parentsBySection = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_id);
    const grouped: Record<string, typeof parents> = {};
    const noSection: typeof parents = [];
    parents.forEach((p) => {
      if (p.section_id) {
        grouped[p.section_id] = grouped[p.section_id] || [];
        grouped[p.section_id].push(p);
      } else {
        noSection.push(p);
      }
    });
    return { grouped, noSection };
  }, [categories]);

  // Sections that actually have parent categories
  const visibleSections = useMemo(
    () => sections.filter((s) => (parentsBySection.grouped[s.id] || []).length > 0),
    [sections, parentsBySection]
  );

  // No auto-selection: categories shown only after a section is clicked

  const activeSectionParents = activeSectionId === '__none__'
    ? parentsBySection.noSection
    : (activeSectionId ? parentsBySection.grouped[activeSectionId] || [] : []);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const { products: previewProducts, loading: previewLoading } = useProducts(
    1,
    { categoryId: activeCategoryId || undefined },
    6
  );
  // Promo card uchun faqat chegirmadagi mahsulotlar
  const { products: discountedProducts } = useProducts(
    1,
    { discounted: true },
    1
  );



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
                      onClick={() => {
                        setCatalogOpen(v => !v);
                        setActiveSectionId(null);
                      }}
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

      {/* Catalog Mega Menu — Linear style, white */}
      {catalogOpen && (() => {
        const sectionIcons = [Sofa, Armchair, Lamp, Package, Box, Layers];
        const allSectionEntries = [
          ...visibleSections.map((s, i) => ({
            id: s.id,
            name: language === 'ru' ? s.name_ru : s.name_uz,
            Icon: sectionIcons[i % sectionIcons.length],
            count: (parentsBySection.grouped[s.id] || []).length,
          })),
          ...(parentsBySection.noSection.length > 0
            ? [{
                id: '__none__',
                name: language === 'ru' ? 'Другое' : 'Boshqa',
                Icon: Package,
                count: parentsBySection.noSection.length,
              }]
            : []),
        ];
        const promo1 = discountedProducts[0];
        const promo2 = previewProducts.find((p) => p.id !== promo1?.id) || previewProducts[0];
        return (
          <>
            <div
              className="fixed left-0 right-0 top-0 bottom-0 z-40 bg-neutral-950/40 backdrop-blur-md animate-fade-in"
              onClick={() => setCatalogOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-50 animate-fade-in">
              <div className="container mx-auto px-4 lg:px-8 py-4">
                <div
                  className="mx-auto max-w-5xl bg-white rounded-[20px] overflow-hidden ring-1 ring-black/[0.06]"
                  style={{ boxShadow: '0 30px 80px -20px rgba(15,15,15,0.25), 0 12px 32px -12px rgba(15,15,15,0.15)' }}
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      {language === 'ru' ? 'Каталог' : 'Katalog'}
                    </p>
                    <Link
                      to="/catalog"
                      onClick={() => setCatalogOpen(false)}
                      className="group inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {language === 'ru' ? 'Все товары' : 'Barcha tovarlar'}
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left: sections list */}
                    <div className="lg:col-span-5 p-4">
                      <ul className="space-y-0.5">
                        {allSectionEntries.map(({ id, name, Icon, count }) => {
                          const active = activeSectionId === id;
                          return (
                            <li key={id}>
                              <button
                                type="button"
                                onClick={() => setActiveSectionId(id)}
                                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                                  active
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-900 hover:bg-neutral-100'
                                }`}
                              >
                                <span
                                  className={`inline-flex w-9 h-9 items-center justify-center rounded-lg shrink-0 transition-colors ${
                                    active
                                      ? 'bg-white/10 text-white'
                                      : 'bg-neutral-100 text-neutral-700 group-hover:bg-white'
                                  }`}
                                >
                                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13.5px] font-semibold leading-tight">{name}</p>
                                  <p
                                    className={`text-[11.5px] mt-0.5 ${
                                      active ? 'text-white/60' : 'text-neutral-500'
                                    }`}
                                  >
                                    {count} {language === 'ru' ? 'категорий' : 'kategoriya'}
                                  </p>
                                </div>
                                <ChevronRight
                                  className={`w-4 h-4 transition-all ${
                                    active
                                      ? 'text-white/70 translate-x-0.5'
                                      : 'text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Right: categories or promo cards */}
                    <div className="lg:col-span-7 bg-neutral-50 p-6 border-l border-neutral-100 min-h-[280px]">
                      {activeSectionId && activeSectionParents.length > 0 ? (
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                              {language === 'ru' ? 'Категории' : 'Kategoriyalar'}
                            </p>
                            <span className="text-[10.5px] text-neutral-400">
                              {activeSectionParents.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                            {activeSectionParents.map((parent) => {
                              const subs = categories.filter((c) => c.parent_id === parent.id);
                              return (
                                <Link
                                  key={parent.id}
                                  to={`/catalog?category=${parent.slug}`}
                                  onClick={() => setCatalogOpen(false)}
                                  className="group relative flex items-start gap-3 px-3.5 py-3 rounded-xl bg-white ring-1 ring-black/[0.05] hover:ring-neutral-900/20 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold text-neutral-900 leading-tight">
                                      {language === 'ru' ? parent.name_ru : parent.name_uz}
                                    </p>
                                    {subs.length > 0 ? (
                                      <p className="mt-1 text-[11.5px] text-neutral-500 line-clamp-1">
                                        {subs
                                          .slice(0, 3)
                                          .map((s) => (language === 'ru' ? s.name_ru : s.name_uz))
                                          .join(' · ')}
                                        {subs.length > 3 && ` +${subs.length - 3}`}
                                      </p>
                                    ) : (
                                      <p className="mt-1 text-[11.5px] text-neutral-400">
                                        {language === 'ru' ? 'Смотреть товары' : "Tovarlarni ko'rish"}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (

                        <div className="h-full flex flex-col">
                          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-4">
                            {language === 'ru' ? 'Рекомендуем' : 'Tavsiya etamiz'}
                          </p>
                          <div className="grid grid-cols-2 gap-3 flex-1">
                            {[promo1, promo2].filter(Boolean).slice(0, 2).map((p, i) => {
                              const img = p!.images?.[0];
                              const name = language === 'ru' ? p!.name_ru : p!.name_uz;
                              return (
                                <Link
                                  key={p!.id + i}
                                  to={`/product/${p!.slug || p!.id}`}
                                  onClick={() => setCatalogOpen(false)}
                                  className="relative rounded-xl overflow-hidden bg-white ring-1 ring-black/5 group hover:ring-black/10 transition-all min-h-[180px]"
                                >
                                  {img && (
                                    <LazyImage
                                      src={img}
                                      alt={name}
                                      wrapperClassName="absolute inset-0 w-full h-full"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                  {i === 0 && promo1 && (
                                    <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold uppercase tracking-wider text-neutral-900">
                                      {language === 'ru' ? 'Скидка' : 'Chegirma'}
                                    </span>
                                  )}
                                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                                    <p className="text-[13px] font-semibold text-white leading-snug line-clamp-2">
                                      {name}
                                    </p>
                                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-white/85">
                                      {language === 'ru' ? 'Смотреть' : "Ko'rish"}
                                      <ArrowUpRight className="w-3 h-3" />
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                            {!promo1 && (
                              <p className="col-span-2 text-sm text-neutral-500 self-center text-center">
                                {language === 'ru' ? 'Выберите раздел' : "Bo'limni tanlang"}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}





      {createPortal(
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />,
        document.body
      )}
    </header>
  );
}
