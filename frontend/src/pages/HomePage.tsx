import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import api from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { BrandLogo } from '@/components/BrandLogo';
import type { Product, Brand } from '@/types';
import { Button } from '@/components/ui';
import catalogData from '@/data/catalog.json';

export function HomePage() {
  const allProds = (catalogData.products as unknown as Product[]) || [];
  const allBrands = (catalogData.brands as unknown as Brand[]) || [];

  const [featured, setFeatured] = useState<Product[]>(() =>
    allProds.filter((p) => Boolean(p.is_featured)).slice(0, 4)
  );
  const [bestsellers, setBestsellers] = useState<Product[]>(() =>
    allProds.filter((p) => Boolean(p.is_bestseller)).slice(0, 8)
  );
  const [brands, setBrands] = useState<Brand[]>(() => allBrands);
  const [loading, setLoading] = useState(false);
  const [activeSpotlight, setActiveSpotlight] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const spotlightDevices = [
    {
      id: 'iphone-16-pro-max',
      name: 'iPhone 16 Pro Max',
      brand: 'Apple',
      tag: 'Titanium Grade 5',
      specs: 'A18 Pro (3nm) • 48MP Fusion • 5x Optical Zoom',
      price: '$1,199.00',
      oldPrice: '$1,299.00',
      image: '/images/products/iphone-16-pro-max.png',
      link: '/products/iphone-16-pro-max',
    },
    {
      id: 'samsung-galaxy-s25-ultra',
      name: 'Galaxy S25 Ultra',
      brand: 'Samsung',
      tag: 'Snapdragon 8 Elite',
      specs: '200MP Quad Tele • Dynamic AMOLED 2X • S-Pen',
      price: '$1,299.00',
      oldPrice: '$1,399.00',
      image: '/images/products/samsung-galaxy-s25-ultra.png',
      link: '/products/samsung-galaxy-s25-ultra',
    },
    {
      id: 'google-pixel-9-pro-xl',
      name: 'Pixel 9 Pro XL',
      brand: 'Google',
      tag: 'Tensor G4 AI',
      specs: 'Pro Triple Visor • Super Actua OLED • 16GB RAM',
      price: '$1,099.00',
      oldPrice: '$1,199.00',
      image: '/images/products/google-pixel-9-pro-xl.png',
      link: '/products/google-pixel-9-pro-xl',
    },
  ];

  // Preload all spotlight images
  useEffect(() => {
    spotlightDevices.forEach((dev) => {
      const img = new Image();
      img.src = dev.image;
    });
  }, []);

  // 5-second auto-loop timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSpotlight((prev) => (prev + 1) % spotlightDevices.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, activeSpotlight]);

  const handleNextSpotlight = () => {
    setActiveSpotlight((prev) => (prev + 1) % spotlightDevices.length);
  };

  const handlePrevSpotlight = () => {
    setActiveSpotlight((prev) => (prev - 1 + spotlightDevices.length) % spotlightDevices.length);
  };

  useEffect(() => {
    async function load() {
      try {
        const [featRes, bestRes, brandRes] = await Promise.all([
          api.get('/products?featured=1&per_page=4'),
          api.get('/products?sort=best_selling&per_page=8'),
          api.get('/brands'),
        ]);
        if (Array.isArray(featRes.data?.data) && featRes.data.data.length > 0) {
          setFeatured(featRes.data.data);
        }
        if (Array.isArray(bestRes.data?.data) && bestRes.data.data.length > 0) {
          setBestsellers(bestRes.data.data);
        }
        if (Array.isArray(brandRes.data?.data) && brandRes.data.data.length > 0) {
          setBrands(brandRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Clean Premium Studio Light Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50/60 via-white to-white pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-zinc-100">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Headline pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200/90 bg-white px-3 py-1.5 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-xs font-bold tracking-wide text-zinc-800">
                  2026 Flagship Showcase • Sealed & Certified
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.15]">
                Engineered for speed. <br className="hidden sm:inline" />
                <span>
                  Crafted for <span className="text-red-600">prestige.</span>
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover next-generation titanium designs, cinema-grade camera systems, and all-day battery efficiency from Apple, Samsung, Google, and more.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1 w-full max-w-sm sm:max-w-none mx-auto lg:mx-0">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-zinc-950 text-white hover:bg-zinc-800 font-bold px-8 shadow-sm gap-2 rounded-md justify-center">
                    Explore Collection
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/brands" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-bold rounded-md px-8 justify-center">
                    Browse Brands
                  </Button>
                </Link>
              </div>

              {/* Trust Specs row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-7 border-t border-zinc-100 max-w-lg mx-auto lg:mx-0 text-center sm:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-zinc-950">100%</p>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5 truncate">Sealed & Genuine</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-zinc-950">1-Year</p>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5 truncate">Official Warranty</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-zinc-950">Free</p>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5 truncate">Delivery &gt; $500</p>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase - Pure Studio Phone Stage with 5s Auto-Loop & Smooth Transitions */}
            <div
              className="lg:col-span-5 relative flex flex-col items-center justify-center group/stage select-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Device Selector Tabs with 5s Live Progress Bar & Clean Rounded-MD */}
              <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-lg mb-4 border border-zinc-200/60 shadow-2xs">
                {spotlightDevices.map((dev, idx) => {
                  const isActive = activeSpotlight === idx;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setActiveSpotlight(idx)}
                      className={`relative overflow-hidden px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      <span className="relative z-10">{dev.brand}</span>
                      {isActive && (
                        <span
                          key={`progress-${idx}`}
                          className="absolute bottom-0 left-0 h-0.5 bg-zinc-950 rounded-full"
                          style={{
                            animation: isPaused
                              ? 'none'
                              : 'spotlight-progress 5s linear forwards',
                            width: isPaused ? '100%' : undefined,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Prev & Next Floating Navigation Arrows (hover over stage to reveal) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrevSpotlight();
                }}
                aria-label="Previous phone"
                className="absolute left-0 sm:-left-4 top-[40%] -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur text-zinc-700 hover:text-zinc-950 shadow-md border border-zinc-200/80 flex items-center justify-center transition-all duration-200 opacity-0 group-hover/stage:opacity-100 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextSpotlight();
                }}
                aria-label="Next phone"
                className="absolute right-0 sm:-right-4 top-[40%] -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur text-zinc-700 hover:text-zinc-950 shadow-md border border-zinc-200/80 flex items-center justify-center transition-all duration-200 opacity-0 group-hover/stage:opacity-100 hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Seamless Studio Stage */}
              <Link
                to={spotlightDevices[activeSpotlight].link}
                className="group relative flex flex-col items-center justify-center w-full max-w-sm text-center"
              >
                <div
                  key={spotlightDevices[activeSpotlight].id}
                  className="animate-hero-glide flex flex-col items-center w-full"
                >
                  {/* Phone Image (Large, Clean Transparent PNG - Zero Boxes, Zero Borders) */}
                  <div className="relative w-full h-[320px] sm:h-[420px] flex items-center justify-center">
                    <img
                      src={spotlightDevices[activeSpotlight].image}
                      alt={spotlightDevices[activeSpotlight].name}
                      className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Ground Contact Shadow beneath phone base */}
                  <div className="w-48 sm:w-56 h-3 rounded-full bg-zinc-900/10 blur-md mx-auto -mt-2" />

                  {/* Device Info & Specs Badge */}
                  <div className="mt-6 space-y-1.5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{spotlightDevices[activeSpotlight].tag}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-emerald-600 font-bold">In Stock</span>
                    </div>

                    <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950">
                      {spotlightDevices[activeSpotlight].name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      {spotlightDevices[activeSpotlight].specs}
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-xl font-extrabold text-zinc-950">
                        {spotlightDevices[activeSpotlight].price}
                      </span>
                      <span className="text-sm text-zinc-400 line-through">
                        {spotlightDevices[activeSpotlight].oldPrice}
                      </span>
                      <span className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5 ml-2 group-hover:underline">
                        View Details <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Slide Pill Dots (5s loop indicator) */}
              <div className="flex items-center gap-1.5 mt-4">
                {spotlightDevices.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSpotlight(idx)}
                    aria-label={`Go to ${spotlightDevices[idx].name}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSpotlight === idx
                        ? 'w-6 bg-zinc-950'
                        : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authorized Brands (Using REAL BRAND LOGOS) */}
      <section className="container-page">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Authorized Manufacturers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
              Shop by Official Brand
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Guaranteed genuine products direct from official suppliers.
            </p>
          </div>
          <Link
            to="/brands"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hidden sm:flex"
          >
            All Brands <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Real Brand Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.slug}`}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-md border border-zinc-200 bg-white hover:border-zinc-950 hover:bg-zinc-50/50 hover:shadow-xs transition-all duration-200 text-center"
            >
              <div className="h-9 flex items-center justify-center w-full transition-transform duration-200 group-hover:scale-105">
                <BrandLogo
                  name={brand.name}
                  slug={brand.slug}
                  className="h-7 w-auto"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-zinc-950 mt-2.5 truncate w-full">
                {brand.name}
              </span>
              <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                {brand.products_count ?? 0} models
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Flagship Phones (LARGE CARD STAGES) */}
      {featured.length > 0 && (
        <section className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Curated
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
                Featured Flagships
              </h2>
            </div>
            <Link
              to="/products?featured=1"
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trending / Bestseller section */}
      <section className="container-page">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Popular Choices
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
              Top Customer Choices
            </h2>
          </div>
          <Link
            to="/products?sort=best_selling"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
          >
            Explore More <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
