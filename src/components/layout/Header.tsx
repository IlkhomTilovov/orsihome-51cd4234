import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Phone, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCategories, useProducts, useSections } from '@/hooks/useProducts';
import { CartDrawer } from '@/components/CartDrawer';
import { LazyImage } from '@/components/LazyImage';
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

      {/* Full-width Catalog Mega Menu */}
      {catalogOpen && (
        <>
          <div className="absolute left-0 right-0 top-full h-screen z-40 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setCatalogOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 animate-fade-in">
            <div className="container mx-auto px-4 lg:px-8 py-6">
              <div className="bg-background rounded-3xl shadow-soft-lg border border-border/40 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left: sections list -> categories */}
                  <div className="lg:col-span-8 p-8 lg:p-10">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      {language === 'ru' ? 'Товары' : 'Tovarlar'}
                    </h3>
                    {(visibleSections.length > 0 || parentsBySection.noSection.length > 0) ? (
                      <div className="grid grid-cols-12 gap-8">
                        {/* Sections column */}
                        <div className="col-span-12 sm:col-span-4 border-r border-border/40 pr-4">
                          <ul className="space-y-1">
                            {visibleSections.map((section) => {
                              const active = activeSectionId === section.id;
                              return (
                                <li key={section.id}>
                                  <button
                                    type="button"
                                    onClick={() => setActiveSectionId(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                      active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground hover:bg-muted hover:text-primary'
                                    }`}
                                  >
                                    {language === 'ru' ? section.name_ru : section.name_uz}
                                  </button>
                                </li>
                              );
                            })}
                            {parentsBySection.noSection.length > 0 && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setActiveSectionId('__none__')}
                                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeSectionId === '__none__'
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-foreground hover:bg-muted hover:text-primary'
                                  }`}
                                >
                                  {language === 'ru' ? 'Другое' : 'Boshqa'}
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Categories column */}
                        <div className="col-span-12 sm:col-span-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            {activeSectionParents.map((parent) => {
                              const subs = categories.filter((c) => c.parent_id === parent.id);
                              return (
                                <div key={parent.id} className="space-y-1">
                                  <Link
                                    to={`/catalog?category=${parent.slug}`}
                                    onClick={() => setCatalogOpen(false)}
                                    className="block text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                  >
                                    {language === 'ru' ? parent.name_ru : parent.name_uz}
                                  </Link>
                                  {subs.length > 0 && (
                                    <div className="pl-3 border-l border-border/40 flex flex-col gap-1">
                                      {subs.map((sub) => (
                                        <Link
                                          key={sub.id}
                                          to={`/catalog?category=${sub.slug}`}
                                          onClick={() => setCatalogOpen(false)}
                                          className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                                        >
                                          {language === 'ru' ? sub.name_ru : sub.name_uz}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to="/catalog"
                        onClick={() => setCatalogOpen(false)}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {language === 'ru' ? 'Перейти в каталог' : "Katalogga o'tish"}
                      </Link>
                    )}
                  </div>


                  {/* Right: promo card */}
                  {discountedProducts.length > 0 && (() => {
                    const promo = discountedProducts[0];
                    const img = promo.images?.[0];
                    const name = language === 'ru' ? promo.name_ru : promo.name_uz;
                    return (
                      <Link
                        to={`/product/${promo.slug || promo.id}`}
                        onClick={() => setCatalogOpen(false)}
                        className="lg:col-span-4 relative bg-[hsl(var(--accent))] m-4 lg:my-6 lg:mr-6 rounded-2xl overflow-hidden group hover:shadow-soft-md transition-shadow min-h-[200px]"
                      >
                        {img && (
                          <LazyImage
                            src={img}
                            alt={name}
                            wrapperClassName="absolute inset-0 w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
                          <p className="text-sm font-semibold text-white leading-snug">
                            {name}
                          </p>
                          {promo.price != null && (
                            <p className="text-xs text-white/85 mt-1">
                              {Number(promo.price).toLocaleString('ru-RU')} {language === 'ru' ? 'сум' : "so'm"}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}



      {createPortal(
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />,
        document.body
      )}
    </header>
  );
}
