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
    if (price >= 1000) base = 94;
    else if (price >= 750) base = 86;
    else if (price >= 450) base = 76;
    else if (price >= 250) base = 67;
    else base = 58;
  }

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

function isStrictMax(val: number, all: number[]): boolean {
  if (all.length <= 1 || val <= 0) return false;
  const max = Math.max(...all);
  const min = Math.min(...all);
  return max > min && val === max;
}

function isStrictMin(val: number, all: number[]): boolean {
  if (all.length <= 1 || val <= 0) return false;
  const max = Math.max(...all);
  const min = Math.min(...all);
  return max > min && val === min;
}

export function ComparePage() {
  const { items, remove, clear } = useCompare();
  const { add: addToCart } = useCart();

  const [detailsMap, setDetailsMap] = useState<Record<number, Product>>({});
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [diffOnly, setDiffOnly] = useState(false);

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
        name: p.name,
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

    const perfScores = perPhone.map((m) => m.perfScore);
    const ramValues = perPhone.map((m) => m.maxRamGB);
    const storageValues = perPhone.map((m) => m.maxStorageGB);
    const batteryValues = perPhone.map((m) => m.batteryMah);
    const priceValues = perPhone.map((m) => m.price);

    return {
      perPhone,
      perfScores,
      ramValues,
      storageValues,
      batteryValues,
      priceValues,
      maxRam: Math.max(0, ...ramValues),
      maxStorage: Math.max(0, ...storageValues),
      maxBattery: Math.max(0, ...batteryValues),
    };
  }, [phones]);

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
          Select up to 4 smartphones from the catalog to compare their performance, storage space, camera, and battery side by side.
        </p>
        <Link to="/products">
          <Button className="mt-6 rounded-xl px-6">Browse Smartphones</Button>
        </Link>
      </div>
    );
  }

  const colCount = phones.length;
  const maxWidthClass = colCount <= 2 ? 'max-w-5xl mx-auto' : 'max-w-7xl mx-auto';
  const phoneGridCols =
    colCount === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : colCount === 2
      ? 'grid-cols-2'
      : colCount === 3
      ? 'grid-cols-3'
      : 'grid-cols-4';
  const specGridCols =
    colCount === 1
      ? 'grid-cols-[170px_1fr]'
      : colCount === 2
      ? 'grid-cols-[180px_repeat(2,minmax(0,1fr))]'
      : colCount === 3
      ? 'grid-cols-[170px_repeat(3,minmax(0,1fr))]'
      : 'grid-cols-[160px_repeat(4,minmax(0,1fr))]';

  // Quick verdict winners (when comparing 2+ devices)
  const topPerfPhone =
    phones.length > 1
      ? metrics.perPhone.reduce((best, cur) => (cur.perfScore > best.perfScore ? cur : best), metrics.perPhone[0])
      : null;
  const topSpacePhone =
    phones.length > 1
      ? metrics.perPhone.reduce(
          (best, cur) =>
            cur.maxStorageGB > best.maxStorageGB ||
            (cur.maxStorageGB === best.maxStorageGB && cur.maxRamGB > best.maxRamGB)
              ? cur
              : best,
          metrics.perPhone[0]
        )
      : null;
  const bestValuePhone =
    phones.length > 1
      ? metrics.perPhone.reduce((best, cur) => (cur.price < best.price ? cur : best), metrics.perPhone[0])
      : null;

  return (
    <div className="container-page py-10 sm:py-12">
      <div className={`${maxWidthClass} space-y-10`}>
        {/* Clean Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Side-by-Side Comparison
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mt-1">
              Compare Models
            </h1>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
              <span>Comparing {phones.length} of 4 devices</span>
              {loadingSpecs && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing specs...
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {phones.length > 1 && (
              <button
                type="button"
                onClick={() => setDiffOnly((d) => !d)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
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
            <Button variant="outline" size="sm" onClick={clear} className="rounded-xl">
              Clear All
            </Button>
            {phones.length < 4 && (
              <Link to="/products">
                <Button size="sm" className="rounded-xl gap-1 bg-zinc-950 text-white hover:bg-zinc-800">
                  <Plus className="h-4 w-4" /> Add Phone
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Overflow Container for Responsive Columns */}
        <div className="overflow-x-auto pb-4">
          <div className={colCount >= 3 ? 'min-w-[760px]' : 'min-w-[540px]'}>
            {/* Top Showcase Cards (Apple-style Airy Centered Columns) */}
            <div className={`grid ${colCount > 1 ? specGridCols : phoneGridCols} gap-0 items-end pb-8`}>
              {colCount > 1 && <div />}
              {phones.map((phone, idx) => {
                const m = metrics.perPhone[idx];
                const isBestPrice = isStrictMin(m.price, metrics.priceValues);
                const isAdding = addingId === phone.id;

                return (
                  <div
                    key={phone.id}
                    className="relative px-4 sm:px-6 flex flex-col items-center text-center"
                  >
                    <button
                      type="button"
                      onClick={() => remove(phone.id)}
                      className="absolute top-0 right-4 h-7 w-7 rounded-full border border-zinc-200/80 bg-white text-zinc-400 hover:text-zinc-950 hover:border-zinc-400 flex items-center justify-center transition cursor-pointer"
                      title="Remove from comparison"
                      aria-label={`Remove ${phone.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Seamless Phone Image Stage */}
                    <Link
                      to={`/products/${phone.slug}`}
                      className="group block h-44 sm:h-52 w-full flex items-center justify-center mb-4"
                    >
                      <img
                        src={productImage(phone)}
                        alt={phone.name}
                        className="h-full max-w-[180px] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      {phone.brand?.name || 'Smartphone'}
                    </span>

                    <Link
                      to={`/products/${phone.slug}`}
                      className="mt-1 text-base sm:text-lg font-extrabold text-zinc-950 hover:text-brand-600 transition line-clamp-1"
                    >
                      {phone.name}
                    </Link>

                    <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {Number(phone.rating_cache || 5).toFixed(1)}
                      </span>
                      {isBestPrice && (
                        <>
                          <span className="text-zinc-300">•</span>
                          <span className="font-bold text-emerald-600">Best Price</span>
                        </>
                      )}
                    </div>

                    <p className="mt-2.5 text-xl font-black text-zinc-950 tracking-tight">
                      {formatPrice(m.price)}
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        disabled={isAdding}
                        onClick={() => handleAddCart(phone)}
                        className="rounded-full px-5 gap-1.5 text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    </div>

                    <Link
                      to={`/products/${phone.slug}`}
                      className="mt-2.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      View full details
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Quick Summary Strip (Clean Light Monochrome) */}
            {phones.length > 1 && topPerfPhone && topSpacePhone && bestValuePhone && (
              <div className="grid grid-cols-3 gap-3 mb-10 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <div className="px-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-zinc-600" /> Top Performance
                  </p>
                  <p className="text-sm font-extrabold text-zinc-950 mt-1 truncate">
                    {topPerfPhone.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    Score {topPerfPhone.perfScore}/100 · {topPerfPhone.rams[topPerfPhone.rams.length - 1] || 'Flagship'} RAM
                  </p>
                </div>

                <div className="px-2 border-l border-zinc-200/80">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-zinc-600" /> Most Space &amp; Memory
                  </p>
                  <p className="text-sm font-extrabold text-zinc-950 mt-1 truncate">
                    {topSpacePhone.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    Up to {formatGB(topSpacePhone.maxStorageGB)} · {topSpacePhone.maxRamGB > 0 ? `${topSpacePhone.maxRamGB}GB RAM` : 'Pro Storage'}
                  </p>
                </div>

                <div className="px-2 border-l border-zinc-200/80">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" /> Best Value
                  </p>
                  <p className="text-sm font-extrabold text-zinc-950 mt-1 truncate">
                    {bestValuePhone.name}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    Starting at {formatPrice(bestValuePhone.price)}
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 1: PERFORMANCE */}
            <div className="space-y-0">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-zinc-950">
                <Cpu className="h-4 w-4 text-zinc-900" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-950">
                  Performance
                </h2>
              </div>

              {/* Performance Score */}
              {shouldShowRow(metrics.perfScores) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-5 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Performance Index</div>
                  {metrics.perPhone.map((m) => {
                    const isWinner = isStrictMax(m.perfScore, metrics.perfScores);
                    return (
                      <div key={m.id} className="px-4 sm:px-6 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-base font-black text-zinc-950">
                            {m.perfScore}
                            <span className="text-xs font-medium text-zinc-400">/100</span>
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isWinner ? 'text-emerald-600' : 'text-zinc-400'
                            }`}
                          >
                            {isWinner ? '• Top Power' : performanceLabel(m.perfScore)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isWinner ? 'bg-zinc-950' : 'bg-zinc-300'
                            }`}
                            style={{ width: `${m.perfScore}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Processor */}
              {shouldShowRow(metrics.perPhone.map((m) => m.processor)) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Processor / Chipset</div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 text-sm font-semibold text-zinc-900">
                      {m.processor || '—'}
                    </div>
                  ))}
                </div>
              )}

              {/* GPU */}
              {metrics.perPhone.some((m) => m.gpu) && shouldShowRow(metrics.perPhone.map((m) => m.gpu)) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Graphics (GPU)</div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 text-sm text-zinc-700">
                      {m.gpu || '—'}
                    </div>
                  ))}
                </div>
              )}

              {/* RAM */}
              {shouldShowRow(metrics.perPhone.map((m) => m.rams.join(','))) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-5 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">RAM (Memory)</div>
                  {metrics.perPhone.map((m) => {
                    const isWinner = isStrictMax(m.maxRamGB, metrics.ramValues);
                    const pct = metrics.maxRam > 0 ? Math.min(100, Math.round((m.maxRamGB / metrics.maxRam) * 100)) : 0;
                    return (
                      <div key={m.id} className="px-4 sm:px-6 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-zinc-950">
                            {m.rams.length > 0 ? m.rams.join(' / ') : '—'}
                          </span>
                          {isWinner && (
                            <span className="text-[11px] font-semibold text-emerald-600">• More RAM</span>
                          )}
                        </div>
                        {m.maxRamGB > 0 && (
                          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isWinner ? 'bg-zinc-950' : 'bg-zinc-300'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: SPACE & STORAGE */}
            <div className="pt-10 space-y-0">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-zinc-950">
                <HardDrive className="h-4 w-4 text-zinc-900" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-950">
                  Space &amp; Storage
                </h2>
              </div>

              {/* Max Storage Space */}
              {shouldShowRow(metrics.storageValues) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-5 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Max Storage</div>
                  {metrics.perPhone.map((m) => {
                    const isWinner = isStrictMax(m.maxStorageGB, metrics.storageValues);
                    const pct =
                      metrics.maxStorage > 0
                        ? Math.min(100, Math.round((m.maxStorageGB / metrics.maxStorage) * 100))
                        : 0;
                    return (
                      <div key={m.id} className="px-4 sm:px-6 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-zinc-950">
                            Up to {formatGB(m.maxStorageGB)}
                          </span>
                          {isWinner && (
                            <span className="text-[11px] font-semibold text-emerald-600">• Most Space</span>
                          )}
                        </div>
                        {m.maxStorageGB > 0 && (
                          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isWinner ? 'bg-zinc-950' : 'bg-zinc-300'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available Storage Tiers */}
              {shouldShowRow(metrics.perPhone.map((m) => m.storages.join(','))) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Storage Options</div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 flex flex-wrap gap-1.5">
                      {m.storages.length > 0 ? (
                        m.storages.map((st) => (
                          <span
                            key={st}
                            className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-800 bg-white"
                          >
                            {st}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Color Finishes */}
              {shouldShowRow(metrics.perPhone.map((m) => m.colors.map((c) => c.name).join(','))) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Color Finishes</div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 flex flex-wrap items-center gap-3">
                      {m.colors.length > 0 ? (
                        m.colors.map((c) => (
                          <span
                            key={c.name}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: DISPLAY & CAMERA */}
            <div className="pt-10 space-y-0">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-zinc-950">
                <Smartphone className="h-4 w-4 text-zinc-900" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-950">
                  Display &amp; Camera
                </h2>
              </div>

              {shouldShowRow(metrics.perPhone.map((m) => m.screenSize)) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Display</div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 text-sm font-medium text-zinc-900">
                      {m.screenSize || '—'}
                    </div>
                  ))}
                </div>
              )}

              {metrics.perPhone.some((m) => m.resolution) &&
                shouldShowRow(metrics.perPhone.map((m) => m.resolution)) && (
                  <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                    <div className="pr-4 text-xs font-semibold text-zinc-500">Resolution</div>
                    {metrics.perPhone.map((m) => (
                      <div key={m.id} className="px-4 sm:px-6 text-sm text-zinc-700">
                        {m.resolution || '—'}
                      </div>
                    ))}
                  </div>
                )}

              {shouldShowRow(metrics.perPhone.map((m) => m.mainCamera)) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-start`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500 flex items-center gap-1.5 pt-0.5">
                    <Camera className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    Main Camera
                  </div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 text-sm text-zinc-800 leading-relaxed">
                      {m.mainCamera || '—'}
                    </div>
                  ))}
                </div>
              )}

              {metrics.perPhone.some((m) => m.frontCamera) &&
                shouldShowRow(metrics.perPhone.map((m) => m.frontCamera)) && (
                  <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                    <div className="pr-4 text-xs font-semibold text-zinc-500">Front Camera</div>
                    {metrics.perPhone.map((m) => (
                      <div key={m.id} className="px-4 sm:px-6 text-sm text-zinc-700">
                        {m.frontCamera || '—'}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* SECTION 4: BATTERY & WARRANTY */}
            <div className="pt-10 space-y-0">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-zinc-950">
                <BatteryCharging className="h-4 w-4 text-zinc-900" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-950">
                  Battery &amp; Warranty
                </h2>
              </div>

              {shouldShowRow(metrics.perPhone.map((m) => m.batteryRaw)) && (
                <div className={`grid ${specGridCols} border-b border-zinc-100 py-5 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Battery Capacity</div>
                  {metrics.perPhone.map((m) => {
                    const isWinner = isStrictMax(m.batteryMah, metrics.batteryValues);
                    const pct =
                      metrics.maxBattery > 0
                        ? Math.min(100, Math.round((m.batteryMah / metrics.maxBattery) * 100))
                        : 0;
                    return (
                      <div key={m.id} className="px-4 sm:px-6 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-zinc-950">
                            {m.batteryRaw || '—'}
                          </span>
                          {isWinner && (
                            <span className="text-[11px] font-semibold text-emerald-600">• Longer Battery</span>
                          )}
                        </div>
                        {m.batteryMah > 0 && (
                          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isWinner ? 'bg-zinc-950' : 'bg-zinc-300'}`}
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
                  <div className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                    <div className="pr-4 text-xs font-semibold text-zinc-500">Charging</div>
                    {metrics.perPhone.map((m) => (
                      <div key={m.id} className="px-4 sm:px-6 text-sm text-zinc-700">
                        {m.charging || '—'}
                      </div>
                    ))}
                  </div>
                )}

              {extraSpecNames.map((specName) => {
                const values = phones.map((p) => {
                  const found = getSpecsList(p).find((s) => s.name === specName);
                  return found?.value || null;
                });
                if (!shouldShowRow(values)) return null;
                return (
                  <div key={specName} className={`grid ${specGridCols} border-b border-zinc-100 py-4 items-center`}>
                    <div className="pr-4 text-xs font-semibold text-zinc-500">{specName}</div>
                    {values.map((val, idx) => (
                      <div key={phones[idx].id} className="px-4 sm:px-6 text-sm text-zinc-700">
                        {val || '—'}
                      </div>
                    ))}
                  </div>
                );
              })}

              {shouldShowRow(metrics.perPhone.map((m) => m.warranty)) && (
                <div className={`grid ${specGridCols} py-4 items-center`}>
                  <div className="pr-4 text-xs font-semibold text-zinc-500">Warranty</div>
                  {metrics.perPhone.map((m) => (
                    <div key={m.id} className="px-4 sm:px-6 text-sm text-zinc-700">
                      {m.warranty}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
