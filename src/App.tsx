import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CartProvider } from "@/hooks/useCart";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { EditModeProvider } from "@/hooks/useEditMode";
import { SiteContentProvider } from "@/hooks/useSiteContent";
import { SystemSettingsProvider } from "@/hooks/useSystemSettings";
import { ThemeLoader } from "@/components/ThemeLoader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { EditModeToggle } from "@/components/EditModeToggle";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";

// Eager: home page (LCP critical)
import Index from "./pages/Index";

// Lazy: all other public routes
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy: admin pages (only loaded for admins)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminAuth = lazy(() => import("./pages/admin/Auth"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const ProductsNew = lazy(() => import("./pages/admin/ProductsNew"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const SiteContent = lazy(() => import("./pages/admin/SiteContent"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const Admins = lazy(() => import("./pages/admin/Admins"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));
const Themes = lazy(() => import("./pages/admin/Themes"));
const CheckoutFormSettings = lazy(() => import("./pages/admin/CheckoutFormSettings"));
const PromoTilesAdmin = lazy(() => import("./pages/admin/PromoTiles"));

const PromoTilesAdmin = lazy(() => import("./pages/admin/PromoTiles"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 daqiqa cache — sahifa o'tganda qayta yuklamaydi
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ThemeLoader>
        <SystemSettingsProvider>
          <LanguageProvider>
            <CartProvider>
              <AuthProvider>
                <SiteContentProvider>
                  <EditModeProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ScrollToTop />
                      <Suspense fallback={<RouteFallback />}>
                      <Routes>
                        {/* Admin Auth */}
                        <Route path="/admin/auth" element={<AdminAuth />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={
                            <ProtectedRoute module="dashboard">
                              <Dashboard />
                            </ProtectedRoute>
                          } />
                          <Route path="orders" element={
                            <ProtectedRoute module="orders">
                              <Orders />
                            </ProtectedRoute>
                          } />
                          <Route path="categories" element={
                            <ProtectedRoute module="categories">
                              <Categories />
                            </ProtectedRoute>
                          } />
                          <Route path="products" element={
                            <ProtectedRoute module="products">
                              <ProductsNew />
                            </ProtectedRoute>
                          } />
                          <Route path="customers" element={
                            <ProtectedRoute module="customers">
                              <Customers />
                            </ProtectedRoute>
                          } />
                          <Route path="content" element={
                            <ProtectedRoute module="siteContent">
                              <SiteContent />
                            </ProtectedRoute>
                          } />
                          <Route path="messages" element={
                            <ProtectedRoute module="customers">
                              <Messages />
                            </ProtectedRoute>
                          } />
                          <Route path="admins" element={
                            <ProtectedRoute module="admins">
                              <Admins />
                            </ProtectedRoute>
                          } />
                          <Route path="themes" element={
                            <ProtectedRoute module="themes">
                              <Themes />
                            </ProtectedRoute>
                          } />
                          <Route path="settings" element={
                            <ProtectedRoute module="telegram">
                              <Settings />
                          <Route path="checkout-form" element={
                            <ProtectedRoute module="siteContent">
                              <CheckoutFormSettings />
                            </ProtectedRoute>
                          } />
                          <Route path="promo-tiles" element={
                            <ProtectedRoute module="siteContent">
                              <PromoTilesAdmin />
                            </ProtectedRoute>
                          } />

                            </ProtectedRoute>
                          } />
                          <Route path="system" element={
                            <ProtectedRoute module="systemSettings">
                              <SystemSettings />
                            </ProtectedRoute>
                          } />
                        </Route>
                      
                      {/* Public Routes */}
                      <Route path="*" element={
                        <div className="flex flex-col min-h-screen">
                          <Header />
                          <main className="flex-1">
                            <Suspense fallback={<RouteFallback />}>
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/catalog" element={<Catalog />} />
                                <Route path="/product/:id" element={<ProductDetails />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/faq" element={<FAQ />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/thank-you" element={<ThankYou />} />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Suspense>
                          </main>
                          <Footer />
                          
                          <EditModeToggle />
                          <EditorPanel />
                        </div>
                        } />
                      </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </TooltipProvider>
                  </EditModeProvider>
                </SiteContentProvider>
              </AuthProvider>
            </CartProvider>
          </LanguageProvider>
        </SystemSettingsProvider>
      </ThemeLoader>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
