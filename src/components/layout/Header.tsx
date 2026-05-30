import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Phone, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCategories } from '@/hooks/useProducts';
import { CartDrawer } from '@/components/CartDrawer';

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
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);


  const navLinks = [
    { href: '/', label: 'Bosh sahifa' },
    { href: '/catalog', label: 'Katalog' },
    { href: '/about', label: 'Portfolio' },
    { href: '/contact', label: 'Aloqa' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-luxe relative ${
        scrolled
          ? 'glass-surface shadow-soft-md py-2'
          : 'bg-background/60 backdrop-blur-md py-4 border-b border-border/20'
      }`}
    >

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-foreground">
              ORSI<span className="text-primary"> HOME</span>
            </span>
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
              <Link to="/contact">Bog'lanish</Link>
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
                          {categories.map((c) => (
                            <Link
                              key={c.id}
                              to={`/catalog?category=${c.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="px-4 py-2 text-sm text-muted-foreground hover:text-primary"
                            >
                              {language === 'ru' ? c.name_ru : c.name_uz}
                            </Link>
                          ))}
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
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setCatalogOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 animate-fade-in">
            <div className="bg-background/95 backdrop-blur-xl border-t border-border/40 shadow-soft-lg">
              <div className="container mx-auto px-4 lg:px-8 py-10">
                <div className="flex items-end justify-between mb-8 pb-4 border-b border-border/40">
                  <div>
                    <p className="text-xs tracking-[0.3em] uppercase text-primary/70 mb-2">
                      {language === 'ru' ? 'Каталог' : 'Katalog'}
                    </p>
                    <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                      {language === 'ru' ? 'Наши товары' : 'Bizning tovarlar'}
                    </h3>
                  </div>
                  <Link
                    to="/catalog"
                    onClick={() => setCatalogOpen(false)}
                    className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors group"
                  >
                    {language === 'ru' ? 'Все товары' : 'Barchasi'}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>

                {categories.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left sidebar list */}
                    <aside className="lg:col-span-3">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-4">
                        {language === 'ru' ? 'Категории' : 'Toifalar'}
                      </p>
                      <ul className="flex flex-col">
                        {categories.map((c) => (
                          <li key={c.id}>
                            <Link
                              to={`/catalog?category=${c.slug}`}
                              onClick={() => setCatalogOpen(false)}
                              className="group flex items-center justify-between py-3 border-b border-border/40 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <span>{language === 'ru' ? c.name_ru : c.name_uz}</span>
                              <ChevronDown className="w-4 h-4 -rotate-90 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </aside>

                    {/* Right image cards */}
                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {categories.slice(0, 3).map((c) => (
                        <Link
                          key={c.id}
                          to={`/catalog?category=${c.slug}`}
                          onClick={() => setCatalogOpen(false)}
                          className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-muted shadow-soft-md hover:shadow-soft-lg transition-all duration-500"
                        >
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={language === 'ru' ? c.name_ru : c.name_uz}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                            <h4 className="font-serif text-2xl md:text-3xl font-bold mb-1 leading-tight">
                              {language === 'ru' ? c.name_ru : c.name_uz}
                            </h4>
                            <p className="text-xs tracking-widest uppercase opacity-80 mb-3">
                              {language === 'ru' ? 'Смотреть коллекцию' : "Kolleksiyani ko'rish"}
                            </p>
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 group-hover:bg-primary group-hover:border-primary transition-all">
                              →
                            </span>
                          </div>
                        </Link>
                      ))}
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
