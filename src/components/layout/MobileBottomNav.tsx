import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Home, ShoppingBag, Phone, Menu, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

type NavItem = {
  to: string;
  label: string;
  icon?: LucideIcon;
  image?: string;
  isCart?: boolean;
};

const items: NavItem[] = [
  { to: '/', icon: Home, label: 'Asosiy' },
  { to: '/catalog', icon: Search, label: 'Katalog' },
  { to: '/cart', icon: ShoppingBag, label: 'Savat', isCart: true },
  { to: '/contact', icon: Phone, label: 'Aloqa' },
  { to: '/about', icon: Menu, label: 'Menyu' },
];

export function MobileBottomNav() {
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <div
      className="md:hidden fixed left-0 right-0 bottom-0 z-50 px-4 pb-3 pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <nav className="pointer-events-auto mx-auto max-w-md rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] ring-1 ring-black/5 px-2 py-2 flex items-center justify-between">
        {items.map(({ to, icon: Icon, image, label, isCart }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'relative flex items-center justify-center h-11 rounded-full transition-all',
                active
                  ? 'bg-neutral-900 text-white px-4 gap-2'
                  : 'text-neutral-700 w-11'
              )}
            >
              <div className="relative flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className={cn(
                      'h-5 w-5 object-contain transition-all',
                      active && 'invert'
                    )}
                  />
                ) : (
                  Icon && <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                )}
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-neutral-900 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              {active && <span className="text-xs font-medium whitespace-nowrap">{label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
