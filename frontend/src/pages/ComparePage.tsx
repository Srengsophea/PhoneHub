import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useCompare } from '@/stores/compare';
import { useCart } from '@/stores/cart';
import { Button } from '@/components/ui';
import { formatPrice, productImage, productPricing } from '@/lib/format';
import type { Product, Specification } from '@/types';
import {
  BatteryCharging,
  Camera,
  Check,
  Cpu,
  HardDrive,
  Loader2,
  Plus,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

function parseCapacityToGB(raw?: string | null): number {
  if (!raw) return 0;
  const match = raw.toUpperCase().match(/(\d+(?:\.\d+)?)\s*(TB|GB)/);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  return match[2] === 'TB' ? Math.round(val * 1024) : Math.round(val);
}

function formatGB(gb: number): string {
  if (gb <= 0) return '—';
  if (gb >= 1024) {
    const tb = gb / 1024;
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1)}TB`;
  }
  return `${gb}GB`;
}

function getSpecsList(product: Product): Specification[] {
  if (!product.specifications) return [];
  if (Array.isArray(product.specifications)) return product.specifications;
  return Object.entries(product.specifications as Record<string, unknown>).map(([name, value], idx) => ({
    id: idx,
    group_name: 'General',
    name,
    value: String(value),
  }));
}

function findSpec(product: Product, keywords: string[]): string | null {
  const list = getSpecsList(product);
  for (const kw of keywords) {
    const found = list.find((s) => s.name.toLowerCase().includes(kw.toLowerCase()));
    if (found?.value) return found.value;
  }
  return null;
}

function getStorageOptions(product: Product): string[] {
  const fromVariants = Array.from(
    new Set((product.variants || []).map((v) => v.storage).filter(Boolean) as string[])
  );
  if (fromVariants.length > 0) {
    return fromVariants.sort((a, b) => parseCapacityToGB(a) - parseCapacityToGB(b));
  }
  const specStorage = findSpec(product, ['storage', 'internal', 'rom', 'space']);
  return specStorage ? [specStorage] : [];
}

function getRamOptions(product: Product): string[] {
  const fromVariants = Array.from(
    new Set((product.variants || []).map((v) => v.ram).filter(Boolean) as string[])
  );
  if (fromVariants.length > 0) {
    return fromVariants.sort((a, b) => parseCapacityToGB(a) - parseCapacityToGB(b));
  }
  const specRam = findSpec(product, ['ram', 'memory']);
  return specRam ? [specRam] : [];
}

function getColors(product: Product): { name: string; hex: string }[] {
  const seen = new Set<string>();
  const list: { name: string; hex: string }[] = [];
  (product.variants || []).forEach((v) => {
    if (!v.color) return;
    const key = v.color.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      list.push({ name: v.color, hex: v.color_hex || '#71717a' });
    }
  });
  return list;
}

function parseBatteryMah(product: Product): number {
  const raw = findSpec(product, ['capacity', 'battery']);
  if (!raw) return 0;
  const match = raw.replace(/,/g, '').match(/(\d{3,5})\s*mAh/i);
  return match ? parseInt(match[1], 10) : 0;
}

function estimatePerformanceScore(product: Product): number {
  const cpu = (findSpec(product, ['processor', 'chipset', 'chip', 'cpu', 'soc']) || '').toLowerCase();
  const maxRam = Math.max(0, ...getRamOptions(product).map(parseCapacityToGB));
  const price = productPricing(product).current;

  let base = 62;

  // Chipset-based performance estimation
  if (
    cpu.includes('a18 pro') ||
    cpu.includes('8 elite') ||
    cpu.includes('dimensity 9400') ||
    cpu.includes('m4')
  ) {
    base = 98;
  } else if (
    cpu.includes('a18') ||
    cpu.includes('a17 pro') ||
    cpu.includes('8 gen 3') ||
    cpu.includes('dimensity 9300') ||
    cpu.includes('exynos 2400')
  ) {
    base = 93;
  } else if (
    cpu.includes('tensor g4') ||
    cpu.includes('8 gen 2') ||
    cpu.includes('8s gen 3') ||
    cpu.includes('a16') ||
    cpu.includes('dimensity 9200')
  ) {
    base = 87;
  } else if (
    cpu.includes('tensor g3') ||
    cpu.includes('8+ gen 1') ||
    cpu.includes('8 gen 1') ||
    cpu.includes('a15') ||
    cpu.includes('dimensity 8300') ||
    cpu.includes('dimensity 8200') ||
    cpu.includes('7+ gen 3')
  ) {
    base = 81;
  } else if (
    cpu.includes('7 gen 3') ||
    cpu.includes('7s gen') ||
    cpu.includes('dimensity 7') ||
    cpu.includes('exynos 1480') ||
    cpu.includes('kirin 9')
  ) {
    base = 73;
  } else if (cpu.includes('helio g99') || cpu.includes('snapdragon 6') || cpu.includes('dimensity 6')) {
    base = 64;
  } else if (cpu.includes('helio') || cpu.includes('unisoc')) {
    base = 55;
  } else {
    // Fallback heuristic using price tier if chipset text isn't recognized
    if (price >= 1000) base = 94;
    else if (price >= 750) base = 86;
    else if (price >= 450) base = 76;
    else if (price >= 250) base = 67;
    else base = 58;
  }

  // Slight boost for higher RAM (up to +2 pts, capped at 99)
  const ramBonus = maxRam >= 16 ? 2 : maxRam >= 12 ? 1 : 0;
  return Math.min(99, base + ramBonus);
}

function performanceLabel(score: number): string {
  if (score >= 92) return 'Ultra Flagship';
  if (score >= 84) return 'Flagship Tier';
  if (score >= 74) return 'Upper Midrange';
  if (score >= 64) return 'Everyday Smooth';
  return 'Essential';
}

export function ComparePage() {
  const { items, remove, clear } = useCompare();
  const { add: addToCart } = useCart();

  const [detailsMap, setDetailsMap] = useState<Record<number, Product>>({});
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [diffOnly, setDiffOnly] = useState(false);

  // Fetch full specifications & variants for every compared phone
  useEffect(() => {
    let cancelled = false;
    const missing = items.filter((p) => !detailsMap[p.id] && (!p.specifications || p.specifications.length === 0));
    if (missing.length === 0) return;

    async function hydrate() {
      setLoadingSpecs(true);
      try {
        const results = await Promise.all(
          missing.map(async (p) => {
            try {
              const { data } = await api.get(`/products/${p.slug}`);
              return data?.data as Product | undefined;
            } catch {
              return undefined;
            }
          })
        );
        if (cancelled) return;
        setDetailsMap((prev) => {
          const next = { ...prev };
          results.forEach((full) => {
            if (full) next[full.id] = full;
          });
          return next;
        });
      } finally {
        if (!cancelled) setLoadingSpecs(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [items, detailsMap]);

  const phones = useMemo(
    () => items.map((item) => detailsMap[item.id] || item),
    [items, detailsMap]
  );

  // Compute comparison winners & metrics across all compared phones
  const metrics = useMemo(() => {
    const perPhone = phones.map((p) => {
      const storages = getStorageOptions(p);
      const rams = getRamOptions(p);
      const maxStorageGB = Math.max(0, ...storages.map(parseCapacityToGB));
      const maxRamGB = Math.max(0, ...rams.map(parseCapacityToGB));
      const batteryMah = parseBatteryMah(p);
      const perfScore = estimatePerformanceScore(p);
      const price = productPricing(p).current;
      return {
        id: p.id,
        storages,
        rams,
        maxStorageGB,
        maxRamGB,
        batteryMah,
        perfScore,
        price,
        colors: getColors(p),
        processor: findSpec(p, ['processor', 'chipset', 'chip', 'cpu', 'soc']),
        gpu: findSpec(p, ['gpu', 'graphics']),
        screenSize: findSpec(p, ['screen size', 'display', 'screen']),
        resolution: findSpec(p, ['resolution', 'refresh']),
        mainCamera: findSpec(p, ['main camera', 'rear camera', 'camera']),
        frontCamera: findSpec(p, ['front camera', 'selfie']),
        batteryRaw: findSpec(p, ['capacity', 'battery']),
        charging: findSpec(p, ['charging', 'charge']),
        warranty: findSpec(p, ['warranty']) || p.warranty_info || '1-Year Official Warranty',
      };
    });

    const maxPerf = Math.max(0, ...perPhone.map((m) => m.perfScore));
    const maxRam = Math.max(0, ...perPhone.map((m) => m.maxRamGB));
    const maxStorage = Math.max(0, ...perPhone.map((m) => m.maxStorageGB));
    const maxBattery = Math.max(0, ...perPhone.map((m) => m.batteryMah));
    const minPrice = perPhone.length > 0 ? Math.min(...perPhone.map((m) => m.price)) : 0;

    return { perPhone, maxPerf, maxRam, maxStorage, maxBattery, minPrice };
  }, [phones]);

  // Extra specs not already covered in core sections
  const extraSpecNames = useMemo(() => {
    const covered = [
      'processor',
      'chipset',
      'chip',
      'cpu',
      'soc',
      'gpu',
      'graphics',
      'ram',
      'memory',
      'storage',
      'internal',
      'screen',
      'display',
      'resolution',
      'refresh',
      'camera',
      'selfie',
      'capacity',
      'battery',
      'charging',
      'charge',
      'warranty',
    ];
    const names = new Set<string>();
    phones.forEach((p) => {
      getSpecsList(p).forEach((s) => {
        const lower = s.name.toLowerCase();
        if (!covered.some((kw) => lower.includes(kw))) {
          names.add(s.name);
        }
      });
    });
    return Array.from(names);
  }, [phones]);

  const handleAddCart = async (phone: Product) => {
    setAddingId(phone.id);
    try {
      const firstVariantId = phone.variants?.[0]?.id;
      const res = await addToCart(phone.id, firstVariantId, 1, false);
      if (res.ok) toast.success(`Added ${phone.name} to cart`);
      else toast.error(res.message || 'Could not add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const shouldShowRow = (values: (string | number | null | undefined)[]) => {
    if (!diffOnly || phones.length <= 1) return true;
    const normalized = values.map((v) => String(v ?? '').trim().toLowerCase());
    return new Set(normalized).size > 1;
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center max-w-md mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-5">
          <Scale className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">No phones to compare</h2>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
          Select up to 4 smartphones from the catalog to compare their processor performance, RAM, storage space, camera, and battery side by side.
        </p>
        <Link to="/products">
          <Button className="mt-6 rounded-xl px-6">Browse Smartphones</Button>
        </Link>
      </div>
    );
  }

  const colCount = phones.length;
  const gridColsClass =
    colCount === 1
      ? 'grid-cols-[200px_minmax(240px,1fr)]'
      : colCount === 2
      ? 'grid-cols-[200px_repeat(2,minmax(220px,1fr))]'
      : colCount === 3
      ? 'grid-cols-[190px_repeat(3,minmax(210px,1fr))]'
      : 'grid-cols-[180px_repeat(4,minmax(195px,1fr))]';

  return (
    <div className="container-page py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            Side-by-Side Specs &amp; Benchmarks
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
            Compare Smartphones
          </h1>
          <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
            <span>Comparing {phones.length} of 4 devices — performance, space, display &amp; battery</span>
            {loadingSpecs && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading full specs...
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {phones.length > 1 && (
            <button
              type="button"
              onClick={() => setDiffOnly((d) => !d)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                diffOnly
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
              }`}
            >
              <span
                className={`h-3.5 w-3.5 rounded-xs flex items-center justify-center border ${
                  diffOnly ? 'border-white bg-white text-zinc-950' : 'border-zinc-300'
                }`}
              >
                {diffOnly && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </span>
              Differences Only
            </button>
          )}
          <Button variant="outline" size="sm" onClick={clear} className="rounded-lg">
            Clear All
          </Button>
          {phones.length < 4 && (
            <Link to="/products">
              <Button size="sm" className="rounded-lg gap-1 bg-zinc-950 text-white hover:bg-zinc-800">
                <Plus className="h-4 w-4" /> Add Phone
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Comparison Matrix */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[780px] rounded-2xl border border-zinc-200/90 bg-white shadow-soft overflow-hidden">
          {/* Sticky Top Phone Header Cards */}
          <div className={`grid ${gridColsClass} border-b border-zinc-200 bg-zinc-50/50`}>
            <div className="p-5 flex flex-col justify-end border-r border-zinc-200/70">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Overview</p>
              <p className="text-sm font-bold text-zinc-900 mt-1">
                {phones.length} {phones.length === 1 ? 'Device' : 'Devices'} Selected
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Top performer, largest storage space, and best value are automatically highlighted.
              </p>
            </div>

            {phones.map((phone, idx) => {
              const m = metrics.perPhone[idx];
              const isBestPrice = phones.length > 1 && m.price === metrics.minPrice;
              const isAdding = addingId === phone.id;

              return (
                <div
                  key={phone.id}
                  className={`p-5 flex flex-col justify-between bg-white relative ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => remove(phone.id)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full border border-zinc-200 bg-white text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                    title="Remove from comparison"
                    aria-label={`Remove ${phone.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  <div>
                    <Link
                      to={`/products/${phone.slug}`}
                      className="block aspect-square max-h-44 mx-auto p-3 flex items-center justify-center group"
                    >
                      <img
                        src={productImage(phone)}
                        alt={phone.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                          {phone.brand?.name || 'Smartphone'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-zinc-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {Number(phone.rating_cache || 5).toFixed(1)}
                        </span>
                      </div>

                      <Link
                        to={`/products/${phone.slug}`}
                        className="font-extrabold text-sm text-zinc-950 hover:text-brand-600 transition line-clamp-1 block"
                      >
                        {phone.name}
                      </Link>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-lg font-black text-zinc-950">
                          {formatPrice(m.price)}
                        </span>
                        {isBestPrice && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Best Price
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      disabled={isAdding}
                      onClick={() => handleAddCart(phone)}
                      className="flex-1 gap-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {isAdding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION 1: PERFORMANCE & POWER */}
          <div className="bg-zinc-950 text-white px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Cpu className="h-4 w-4 text-red-500" />
            <span>Performance &amp; Processing Power</span>
          </div>

          {/* Performance Index Bar */}
          {shouldShowRow(metrics.perPhone.map((m) => m.perfScore)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Performance Score
              </div>
              {metrics.perPhone.map((m, idx) => {
                const isWinner = phones.length > 1 && m.perfScore === metrics.maxPerf;
                return (
                  <div
                    key={m.id}
                    className={`p-4 space-y-2 ${idx < phones.length - 1 ? 'border-r border-zinc-100' : ''} ${
                      isWinner ? 'bg-emerald-50/35' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-zinc-950">
                        {m.perfScore}
                        <span className="text-[11px] font-medium text-zinc-400">/100</span>
                      </span>
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Trophy className="h-2.5 w-2.5" /> Top Power
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-500">
                          {performanceLabel(m.perfScore)}
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWinner ? 'bg-emerald-500' : 'bg-zinc-900'
                        }`}
                        style={{ width: `${m.perfScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Processor / Chipset */}
          {shouldShowRow(metrics.perPhone.map((m) => m.processor)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Processor / Chipset
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 text-xs font-semibold text-zinc-900 flex items-center ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.processor || '—'}
                </div>
              ))}
            </div>
          )}

          {/* GPU */}
          {metrics.perPhone.some((m) => m.gpu) && shouldShowRow(metrics.perPhone.map((m) => m.gpu)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                GPU / Graphics
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 text-xs font-medium text-zinc-700 flex items-center ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.gpu || 'Integrated Flagship GPU'}
                </div>
              ))}
            </div>
          )}

          {/* RAM / Memory */}
          {shouldShowRow(metrics.perPhone.map((m) => m.rams.join(','))) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                RAM (Memory)
              </div>
              {metrics.perPhone.map((m, idx) => {
                const isWinner = phones.length > 1 && m.maxRamGB > 0 && m.maxRamGB === metrics.maxRam;
                const pct = metrics.maxRam > 0 ? Math.min(100, Math.round((m.maxRamGB / metrics.maxRam) * 100)) : 0;
                return (
                  <div
                    key={m.id}
                    className={`p-4 space-y-2 ${idx < phones.length - 1 ? 'border-r border-zinc-100' : ''} ${
                      isWinner ? 'bg-emerald-50/35' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-950">
                        {m.rams.length > 0 ? m.rams.join(' / ') : '—'}
                      </span>
                      {isWinner && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Max RAM
                        </span>
                      )}
                    </div>
                    {m.maxRamGB > 0 && (
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isWinner ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 2: SPACE & STORAGE */}
          <div className="bg-zinc-900 text-white px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <HardDrive className="h-4 w-4 text-brand-400" />
            <span>Space &amp; Storage Capacity</span>
          </div>

          {/* Max Space Comparison */}
          {shouldShowRow(metrics.perPhone.map((m) => m.maxStorageGB)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Max Storage Space
              </div>
              {metrics.perPhone.map((m, idx) => {
                const isWinner =
                  phones.length > 1 && m.maxStorageGB > 0 && m.maxStorageGB === metrics.maxStorage;
                const pct =
                  metrics.maxStorage > 0
                    ? Math.min(100, Math.round((m.maxStorageGB / metrics.maxStorage) * 100))
                    : 0;
                return (
                  <div
                    key={m.id}
                    className={`p-4 space-y-2 ${idx < phones.length - 1 ? 'border-r border-zinc-100' : ''} ${
                      isWinner ? 'bg-brand-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-zinc-950">
                        Up to {formatGB(m.maxStorageGB)}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                          <HardDrive className="h-2.5 w-2.5" /> Most Space
                        </span>
                      )}
                    </div>
                    {m.maxStorageGB > 0 && (
                      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinner ? 'bg-brand-600' : 'bg-zinc-800'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Available Storage Options Pills */}
          {shouldShowRow(metrics.perPhone.map((m) => m.storages.join(','))) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Available Space Tiers
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 flex flex-wrap items-center gap-1.5 ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.storages.length > 0 ? (
                    m.storages.map((st) => (
                      <span
                        key={st}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-bold text-zinc-800"
                      >
                        {st}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Available Colors */}
          {shouldShowRow(metrics.perPhone.map((m) => m.colors.map((c) => c.name).join(','))) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Color Finishes
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 flex flex-wrap items-center gap-2 ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.colors.length > 0 ? (
                    m.colors.map((c) => (
                      <span
                        key={c.name}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-700"
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SECTION 3: DISPLAY & CAMERA */}
          <div className="bg-zinc-100 text-zinc-900 px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-y border-zinc-200/80">
            <Smartphone className="h-4 w-4 text-zinc-700" />
            <span>Display &amp; Camera System</span>
          </div>

          {shouldShowRow(metrics.perPhone.map((m) => m.screenSize)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Screen Size &amp; Panel
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 text-xs font-semibold text-zinc-900 ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.screenSize || '—'}
                </div>
              ))}
            </div>
          )}

          {metrics.perPhone.some((m) => m.resolution) &&
            shouldShowRow(metrics.perPhone.map((m) => m.resolution)) && (
              <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
                <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                  Resolution
                </div>
                {metrics.perPhone.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`p-4 text-xs font-medium text-zinc-700 ${
                      idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                    }`}
                  >
                    {m.resolution || '—'}
                  </div>
                ))}
              </div>
            )}

          {shouldShowRow(metrics.perPhone.map((m) => m.mainCamera)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                Main Camera
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 text-xs font-medium text-zinc-800 leading-relaxed ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.mainCamera || '—'}
                </div>
              ))}
            </div>
          )}

          {metrics.perPhone.some((m) => m.frontCamera) &&
            shouldShowRow(metrics.perPhone.map((m) => m.frontCamera)) && (
              <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
                <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                  Front Camera
                </div>
                {metrics.perPhone.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`p-4 text-xs font-medium text-zinc-700 ${
                      idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                    }`}
                  >
                    {m.frontCamera || '—'}
                  </div>
                ))}
              </div>
            )}

          {/* SECTION 4: BATTERY & WARRANTY */}
          <div className="bg-zinc-100 text-zinc-900 px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-y border-zinc-200/80">
            <BatteryCharging className="h-4 w-4 text-emerald-600" />
            <span>Battery, Charging &amp; Warranty</span>
          </div>

          {shouldShowRow(metrics.perPhone.map((m) => m.batteryRaw)) && (
            <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                Battery Capacity
              </div>
              {metrics.perPhone.map((m, idx) => {
                const isWinner =
                  phones.length > 1 && m.batteryMah > 0 && m.batteryMah === metrics.maxBattery;
                const pct =
                  metrics.maxBattery > 0
                    ? Math.min(100, Math.round((m.batteryMah / metrics.maxBattery) * 100))
                    : 0;
                return (
                  <div
                    key={m.id}
                    className={`p-4 space-y-2 ${idx < phones.length - 1 ? 'border-r border-zinc-100' : ''} ${
                      isWinner ? 'bg-emerald-50/35' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-950">
                        {m.batteryRaw || '—'}
                      </span>
                      {isWinner && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Best Battery
                        </span>
                      )}
                    </div>
                    {m.batteryMah > 0 && (
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isWinner ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {metrics.perPhone.some((m) => m.charging) &&
            shouldShowRow(metrics.perPhone.map((m) => m.charging)) && (
              <div className={`grid ${gridColsClass} border-b border-zinc-100`}>
                <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                  Charging Speed
                </div>
                {metrics.perPhone.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`p-4 text-xs font-medium text-zinc-700 ${
                      idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                    }`}
                  >
                    {m.charging || '—'}
                  </div>
                ))}
              </div>
            )}

          {/* Any additional dynamic specs */}
          {extraSpecNames.map((specName) => {
            const values = phones.map((p) => {
              const found = getSpecsList(p).find((s) => s.name === specName);
              return found?.value || null;
            });
            if (!shouldShowRow(values)) return null;
            return (
              <div key={specName} className={`grid ${gridColsClass} border-b border-zinc-100`}>
                <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center">
                  {specName}
                </div>
                {values.map((val, idx) => (
                  <div
                    key={phones[idx].id}
                    className={`p-4 text-xs font-medium text-zinc-700 ${
                      idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                    }`}
                  >
                    {val || '—'}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Warranty */}
          {shouldShowRow(metrics.perPhone.map((m) => m.warranty)) && (
            <div className={`grid ${gridColsClass}`}>
              <div className="p-4 text-xs font-bold text-zinc-600 bg-zinc-50/70 border-r border-zinc-200/70 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Warranty
              </div>
              {metrics.perPhone.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 text-xs font-medium text-zinc-700 ${
                    idx < phones.length - 1 ? 'border-r border-zinc-100' : ''
                  }`}
                >
                  {m.warranty}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
