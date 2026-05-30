import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { LazyImage } from '@/components/LazyImage';
import type { Product } from '@/hooks/useProducts';

// Support both database and static data types
interface ProductCardProps {
  product: Product | {
    id: string;
    name_uz: string;
    name_ru: string;
    price: number;
    originalPrice?: number;
    images: string[];
    rating?: number;
    reviewCount?: number;
    slug?: string | null;
    original_price?: number | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const name = language === 'uz' ? product.name_uz : product.name_ru;
  const formatPrice = (price: number) => price.toLocaleString('uz-UZ');

  const price = product.price || 0;
  const originalPrice = 'originalPrice' in product ? product.originalPrice : product.original_price;
  const images = product.images || [];
  const productUrl = 'slug' in product && product.slug
    ? `/product/${product.slug}`
    : `/product/${product.id}`;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / (originalPrice as number)) * 100) : 0;
  

  return (
    <article className="group relative bg-card rounded-3xl overflow-hidden border border-border/40 shadow-soft hover:shadow-soft-lg hover:border-border transition-shadow duration-300">
      <Link to={productUrl} className="block relative aspect-square overflow-hidden bg-muted/30">
        {/* Primary image */}
        <LazyImage
          src={images[0] || '/placeholder.svg'}
          alt={name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          wrapperClassName="w-full h-full absolute inset-0"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-soft-sm">
            −{discountPct}%
          </span>
        )}

        {/* Quick view button — desktop only, lighter animation */}
        <div className="hidden md:flex absolute bottom-3 left-3 right-3 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium tracking-wider uppercase px-4 py-2 rounded-full shadow-soft-md">
            <Eye className="w-3.5 h-3.5" />
            {language === 'uz' ? "Ko'rish" : 'Просмотр'}
          </span>
        </div>
      </Link>


      <div className="p-3 md:p-5">
        <Link to={productUrl} className="block">
          <h3 className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
        </Link>

        {price > 0 && (
          <div className="mt-1.5 flex flex-col leading-tight">
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(originalPrice as number)} {t.products.currency}
              </span>
            )}
            <span className="font-sans font-bold text-base md:text-lg text-foreground tracking-tight tabular-nums">
              {formatPrice(price)} {t.products.currency}
            </span>
          </div>
        )}

        <Button
          variant={inCart ? 'secondary' : 'outline'}
          aria-label={inCart ? (language === 'uz' ? 'Savatda' : 'В корзине') : (language === 'uz' ? "Sotib olish" : 'Купить')}
          className="mt-2.5 w-full rounded-full h-10 shadow-soft-sm hover:shadow-soft-md transition-all duration-300"
          onClick={(e) => {
            e.preventDefault();
            if (!inCart) {
              const cartProduct = {
                id: product.id,
                name_uz: product.name_uz,
                name_ru: product.name_ru,
                price,
                images,
              };
              addItem(cartProduct as any);
            }
          }}
        >
          {inCart ? (language === 'uz' ? 'Savatda' : 'В корзине') : (language === 'uz' ? "Sotib olish" : 'Купить')}
        </Button>
      </div>
    </article>
  );
}
