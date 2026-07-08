import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, X, LayoutGrid, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { useProducts, useCategories, useProductFilterOptions, useSections, ProductFilters } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useSEO } from '@/hooks/useSEO';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { CatalogFilterSidebar, SidebarFilters } from '@/components/CatalogFilterSidebar';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 24;

export default function Catalog() {
  const { language, t } = useLanguage();
  const { settings } = useSystemSettings();
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const initialCategoryParam = searchParams.get('category') || 'all';
  const promoTileId = searchParams.get('promo') || '';
  const setId = searchParams.get('set') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [setProductIds, setSetProductIds] = useState<string[] | null>(null);
  const [setTitle, setSetTitle] = useState<{ uz: string; ru: string } | null>(null);
  const [setImage, setSetImage] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);

  const { options: filterOptions } = useProductFilterOptions();
  const { categories } = useCategories();
  const { sections } = useSections();

  // Resolve slug to category ID for filtering - only return UUID or 'all'
  const resolvedCategoryId = useMemo(() => {
    if (initialCategoryParam === 'all') return 'all';
    const found = categories.find(c => c.slug === initialCategoryParam || c.id === initialCategoryParam);
    return found ? found.id : null; // null means still resolving
  }, [initialCategoryParam, categories]);

  const [priceTouched, setPriceTouched] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilters>({
    categoryId: 'all',
    priceMin: 0,
    priceMax: filterOptions.maxPrice,
    materials: [],
    colors: [],
    furLengths: [],
    applications: [],
    inStock: false,
    discounted: false,
  });

  // Sync price max with filter options until the user explicitly changes it
  useEffect(() => {
    if (!priceTouched) {
      setSidebarFilters(prev => ({ ...prev, priceMax: filterOptions.maxPrice }));
    }
  }, [filterOptions.maxPrice, priceTouched]);

  // Update category filter when URL slug changes (e.g., footer navigation)
  useEffect(() => {
    if (resolvedCategoryId !== null && resolvedCategoryId !== sidebarFilters.categoryId) {
      setSidebarFilters(prev => ({ ...prev, categoryId: resolvedCategoryId }));
      setCurrentPage(1);
    }
  }, [resolvedCategoryId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch set product_ids when ?set= is in URL
  useEffect(() => {
    // Reset stale set data immediately when setId changes
    setSetProductIds(null);
    setSetTitle(null);
    setSetImage(null);
    if (!setId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('sets')
        .select('product_ids, title_uz, title_ru, image')
        .eq('id', setId)
        .maybeSingle();
      if (cancelled) return;
      setSetProductIds((data?.product_ids as string[]) || []);
      setSetTitle(data ? { uz: data.title_uz, ru: data.title_ru } : null);
      setSetImage((data?.image as string) || null);
      setCurrentPage(1);
    })();
    return () => { cancelled = true; };
  }, [setId]);

  // Map sidebar filters to DB query filters
  const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  
  const filters: ProductFilters = useMemo(() => {
    const f: ProductFilters = { isActive: true };

    // When viewing a set, show ALL products in that set — ignore other filters
    if (setProductIds) {
      f.productIds = setProductIds;
      if (debouncedSearch) f.search = debouncedSearch;
      return f;
    }

    if (debouncedSearch) f.search = debouncedSearch;
    // Only pass category if it's a valid UUID. If the selected category has
    // subcategories, include all descendants so parent view shows every product.
    if (sidebarFilters.categoryId !== 'all' && isUUID(sidebarFilters.categoryId)) {
      const selectedId = sidebarFilters.categoryId;
      const childIds = categories.filter(c => c.parent_id === selectedId).map(c => c.id);
      if (childIds.length > 0) {
        f.categoryIds = [selectedId, ...childIds];
      } else {
        f.categoryId = selectedId;
      }
    }
    if (priceTouched && sidebarFilters.priceMin > 0) f.priceMin = sidebarFilters.priceMin;
    if (priceTouched && sidebarFilters.priceMax < filterOptions.maxPrice) f.priceMax = sidebarFilters.priceMax;
    if (sidebarFilters.materials.length > 0) f.materials = sidebarFilters.materials;
    if (sidebarFilters.colors.length > 0) f.colors = sidebarFilters.colors;
    if (sidebarFilters.furLengths.length > 0) f.furLengths = sidebarFilters.furLengths;
    if (sidebarFilters.inStock) f.inStock = true;
    if (sidebarFilters.discounted) f.discounted = true;
    if (promoTileId) f.promoTileId = promoTileId;

    return f;
  }, [debouncedSearch, sidebarFilters, filterOptions.maxPrice, promoTileId, setProductIds, priceTouched, categories]);


  const { products, totalCount, totalPages, loading: productsLoading } = useProducts(currentPage, filters, PAGE_SIZE);

  // Show the catalog sections overview when no filters/search/set are active and sections exist.
  const showSectionsOverview =
    !setTitle && !promoTileId && !debouncedSearch && sidebarFilters.categoryId === 'all' && sections.length > 0;

  // Treat as loading while the URL category slug hasn't synced into local filters yet
  // to avoid showing stale products from the previous category.
  const categorySyncing =
    resolvedCategoryId === null || resolvedCategoryId !== sidebarFilters.categoryId;
  const loading = productsLoading || categorySyncing;

  const selectedCategory = categories?.find(c => c.slug === sidebarFilters.categoryId || c.id === sidebarFilters.categoryId);
  const categoryName = selectedCategory
    ? (language === 'uz' ? selectedCategory.name_uz : selectedCategory.name_ru)
    : null;

  useSEO({
    title: categoryName || t.catalog.title,
    description: selectedCategory
      ? (language === 'uz' ? selectedCategory.meta_description_uz : selectedCategory.meta_description_ru) || categoryName || undefined
      : undefined,
    keywords: selectedCategory?.meta_keywords || undefined,
    canonical: currentPage > 1 ? '/catalog' : undefined,
  });

  useEffect(() => {
    // Wait until the initial category slug has been resolved before
    // overwriting the URL — otherwise we wipe out ?category=... on mount.
    if (resolvedCategoryId === null) return;
    // Avoid race: skip until local state has caught up with the resolved URL slug.
    if (resolvedCategoryId !== sidebarFilters.categoryId) return;

    const params = new URLSearchParams();

    // When a set is active, only keep the set param (drop stale filters)
    if (setId) {
      params.set('set', setId);
      if (currentPage > 1) params.set('page', currentPage.toString());
      setSearchParams(params, { replace: true });
      return;
    }

    if (sidebarFilters.categoryId !== 'all') {
      // Write slug to URL for better readability
      const cat = categories.find(c => c.id === sidebarFilters.categoryId);
      params.set('category', cat?.slug || sidebarFilters.categoryId);
    }
    if (priceTouched && sidebarFilters.priceMin > 0) params.set('min_price', sidebarFilters.priceMin.toString());
    if (priceTouched && sidebarFilters.priceMax < filterOptions.maxPrice) params.set('max_price', sidebarFilters.priceMax.toString());
    if (sidebarFilters.materials.length > 0) params.set('material', sidebarFilters.materials.join(','));
    if (sidebarFilters.colors.length > 0) params.set('color', sidebarFilters.colors.join(','));
    if (sidebarFilters.furLengths.length > 0) params.set('fur_length', sidebarFilters.furLengths.join(','));
    if (sidebarFilters.applications.length > 0) params.set('application', sidebarFilters.applications.join(','));
    if (sidebarFilters.inStock) params.set('in_stock', '1');
    if (sidebarFilters.discounted) params.set('discount', '1');
    if (promoTileId) params.set('promo', promoTileId);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [sidebarFilters, currentPage, setSearchParams, filterOptions.maxPrice, resolvedCategoryId, promoTileId, setId, priceTouched]);



  const handleApplyFilters = useCallback((newFilters: SidebarFilters) => {
    setSidebarFilters(newFilters);
    setPriceTouched(true);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div id="hero" className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {setTitle && setImage ? (
          <div className="mb-8 relative rounded-[2rem] overflow-hidden aspect-[21/8] md:aspect-[21/7]">
            <img src={setImage} alt={language === 'uz' ? setTitle.uz : setTitle.ru} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
              <p className="text-white/80 text-sm md:text-base mb-2">
                {language === 'uz' ? 'Setlar to\'plami' : 'Набор сетов'}
              </p>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-white">
                {language === 'uz' ? setTitle.uz : setTitle.ru}
              </h1>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              {categoryName || t.catalog.title}
            </h1>
            {(() => {
              // Show subcategory chips: children of currently selected top-level category,
              // or all top-level parents when viewing "all" categories.
              const selectedId = sidebarFilters.categoryId;
              const currentCat = categories.find(c => c.id === selectedId);
              // If a subcategory is selected, show its siblings under the same parent.
              const parentId = currentCat?.parent_id || (currentCat ? currentCat.id : null);
              const chips = parentId
                ? categories.filter(c => c.parent_id === parentId)
                : [];
              if (chips.length === 0) return null;
              const parentCat = categories.find(c => c.id === parentId);
              return (
                <div className="flex flex-wrap gap-2 mt-2">
                  {parentCat && (
                    <Button
                      size="sm"
                      variant={selectedId === parentCat.id ? 'default' : 'outline'}
                      className="rounded-full"
                      onClick={() => setSearchParams(prev => {
                        const p = new URLSearchParams(prev);
                        p.set('category', parentCat.slug);
                        p.delete('page');
                        return p;
                      })}
                    >
                      {language === 'uz' ? 'Barchasi' : 'Все'}
                    </Button>
                  )}
                  {chips.map(sub => (
                    <Button
                      key={sub.id}
                      size="sm"
                      variant={selectedId === sub.id ? 'default' : 'outline'}
                      className="rounded-full"
                      onClick={() => setSearchParams(prev => {
                        const p = new URLSearchParams(prev);
                        p.set('category', sub.slug);
                        p.delete('page');
                        return p;
                      })}
                    >
                      {language === 'uz' ? sub.name_uz : sub.name_ru}
                    </Button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t.catalog.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </div>



        <div className="flex gap-8">
          <div className="flex-1">
            {/* Products always render — sections overview removed per request */}
            <>

                <p className="text-sm text-muted-foreground mb-4">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}
                    </span>
                  ) : (
                    <>
                      {t.catalog.showing} {products.length} {t.catalog.of} {totalCount} {t.catalog.products}
                    </>
                  )}
                </p>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-warm animate-pulse">
                        <div className="aspect-[4/3] bg-muted" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {getPaginationNumbers().map((page, idx) =>
                          page === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">{t.catalog.noProducts}</p>
                    <Button
                      variant="link"
                      onClick={() => handleApplyFilters({
                        categoryId: 'all', priceMin: 0, priceMax: filterOptions.maxPrice,
                        materials: [], colors: [], furLengths: [],
                        applications: [], inStock: false, discounted: false,
                      })}
                    >
                      {t.catalog.clearFilters}
                    </Button>
                  </div>
                )}
              </>

          </div>
        </div>
      </div>
    </div>
  );
}
