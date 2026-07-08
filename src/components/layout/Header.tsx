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
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});





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

      {/* Catalog Sidebar Drawer (left) */}
      <Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
        <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-lg flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              {language === 'ru' ? 'Каталог' : 'Katalog'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-3">
            <Link
              to="/catalog"
              onClick={() => setCatalogOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 mb-2 text-sm font-semibold text-neutral-900"
            >
              <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-neutral-100">
                <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </span>
              {language === 'ru' ? 'Все товары' : 'Barcha tovarlar'}
            </Link>

            {[
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
            ]
              .filter((sec) => sec.parents.length > 0)
              .map((section) => (
                <div key={section.id} className="mt-4">
                  <p className="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {section.name}
                  </p>
                  <ul className="space-y-0.5">
                    {section.parents.map((parent) => {
                      const subs = categories.filter((c) => c.parent_id === parent.id);
                      const isExpanded = expandedParents[parent.id] ?? false;
                      const hasSubs = subs.length > 0;
                      return (
                        <li key={parent.id}>
                          <div className="group flex items-stretch rounded-xl overflow-hidden hover:bg-neutral-50">
                            <Link
                              to={`/catalog?category=${parent.slug}`}
                              onClick={() => setCatalogOpen(false)}
                              className="flex-1 flex items-center gap-3 px-3 py-2.5 min-w-0"
                            >
                              {parent.image ? (
                                <img
                                  src={parent.image}
                                  alt=""
                                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                                />
                              ) : (
                                <span className="w-9 h-9 rounded-lg bg-neutral-100 shrink-0" />
                              )}
                              <span className="text-sm font-medium text-neutral-900 truncate">
                                {language === 'ru' ? parent.name_ru : parent.name_uz}
                              </span>
                            </Link>
                            {hasSubs && (
                              <button
                                onClick={() =>
                                  setExpandedParents((prev) => ({ ...prev, [parent.id]: !isExpanded }))
                                }
                                className="px-3 flex items-center text-neutral-400 hover:text-neutral-900"
                                aria-label="toggle"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                            )}
                          </div>
                          {hasSubs && isExpanded && (
                            <ul className="ml-12 mt-0.5 mb-1 border-l border-neutral-200 pl-3">
                              {subs.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    to={`/catalog?category=${sub.slug}`}
                                    onClick={() => setCatalogOpen(false)}
                                    className="block text-[13px] px-2 py-1.5 rounded-md text-neutral-600 hover:text-neutral-900 transition-colors"
                                  >
                                    {language === 'ru' ? sub.name_ru : sub.name_uz}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
          </div>
        </SheetContent>
      </Sheet>






      {createPortal(
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />,
        document.body
      )}
    </header>
  );
}
