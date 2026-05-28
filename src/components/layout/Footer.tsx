import { Link } from 'react-router-dom';
import { Phone, Send, Instagram, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { EditableText } from '@/components/EditableText';
import { EditableLink } from '@/components/EditableLink';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function Footer() {
  const { language } = useLanguage();
  const { settings, getAddress, getWorkingHours } = useSystemSettings();

  const { data: categories } = useQuery({
    queryKey: ['footer-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name_uz, name_ru, slug')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      return data || [];
    },
  });

  const contactPhone = settings?.contact_phone || '+998 90 123 45 67';
  const address = getAddress(language);
  const workingHours = getWorkingHours(language);

  const navLinks = [
    { to: '/', label: 'Bosh sahifa' },
    { to: '/catalog', label: 'Katalog' },
    { to: '/about', label: 'Portfolio' },
    { to: '/contact', label: 'Aloqa' },
  ];

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-wider text-foreground">
                ORSI<span className="text-primary"> HOME</span>
              </span>
            </Link>
            <EditableText
              contentKey="footer_description"
              fallback="Zamonaviy, sifatli va individual buyurtma asosida ishlab chiqariladigan premium mebellar."
              as="p"
              className="text-muted-foreground text-sm leading-relaxed max-w-xs"
              multiline
              section="footer"
            />
            <div className="flex gap-3">
              <EditableLink
                contentKey="footer_social_telegram"
                fallback={settings?.social_telegram || '#'}
                className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground"
                section="footer"
              >
                <Send className="w-4 h-4" />
              </EditableLink>
              <EditableLink
                contentKey="footer_social_instagram"
                fallback={settings?.social_instagram || '#'}
                className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground"
                section="footer"
              >
                <Instagram className="w-4 h-4" />
              </EditableLink>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <EditableText
              contentKey="footer_nav_title"
              fallback="Sahifalar"
              as="h4"
              className="font-serif text-lg font-semibold text-foreground mb-6 tracking-wide"
              section="footer"
            />
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services - editable */}
          <div>
            <EditableText
              contentKey="footer_services_title"
              fallback="Xizmatlar"
              as="h4"
              className="font-serif text-lg font-semibold text-foreground mb-6 tracking-wide"
              section="footer"
            />
            <ul className="space-y-3">
              {categories && categories.length > 0 ? (
                <>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/catalog?category=${cat.slug}`}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors duration-300"
                      >
                        {language === 'ru' ? cat.name_ru : cat.name_uz}
                      </Link>
                    </li>
                  ))}
                </>
              ) : (
                <li className="text-muted-foreground text-sm">—</li>
              )}
            </ul>
          </div>

          {/* Contact - editable */}
          <div>
            <EditableText
              contentKey="footer_contact_title"
              fallback="Bog'lanish"
              as="h4"
              className="font-serif text-lg font-semibold text-foreground mb-6 tracking-wide"
              section="footer"
            />
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-1 text-primary" />
                <EditableText
                  contentKey="footer_address"
                  fallback={address || "Toshkent sh., Chilonzor tumani"}
                  as="span"
                  className="text-muted-foreground text-sm leading-relaxed"
                  multiline
                  section="footer"
                />
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <EditableText
                  contentKey="footer_phone"
                  fallback={contactPhone}
                  as="span"
                  className="text-muted-foreground text-sm"
                  section="footer"
                />
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 flex-shrink-0 mt-1 text-primary" />
                <EditableText
                  contentKey="footer_working_hours"
                  fallback={workingHours || "Dush–Shan: 09:00–18:00"}
                  as="span"
                  className="text-muted-foreground text-sm leading-relaxed"
                  multiline
                  section="footer"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-xs text-muted-foreground tracking-wider">
            © {new Date().getFullYear()}{' '}
            <EditableText contentKey="footer_copyright" fallback="OrisHome. Barcha huquqlar himoyalangan." as="span" className="text-xs" section="footer" />
          </p>
        </div>
      </div>
    </footer>
  );
}
