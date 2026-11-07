import React from 'react';

interface BrandLogoProps {
  name: string;
  slug?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  name,
  slug = '',
  className = 'h-8 w-auto',
}) => {
  const normalized = (slug || name).toLowerCase().trim();

  // 1. Apple: Iconic Apple silhouette
  if (normalized.includes('apple') || normalized.includes('iphone')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 170 170" className="h-8 w-8 fill-zinc-900 group-hover:fill-black transition-colors">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.81-11.66-14.3-5.23-8.25-9.42-17.65-12.58-28.21-3.16-10.55-4.74-20.73-4.74-30.54 0-13.25 3.48-24.31 10.43-33.19 6.96-8.88 15.68-13.43 26.17-13.67 5.12 0 10.68 1.35 16.69 4.04 6.01 2.7 9.87 4.09 11.58 4.19 1.34 0 5.42-1.46 12.24-4.38 6.83-2.92 12.63-4.18 17.41-3.79 13.04 1.05 23.36 5.86 30.98 14.43-11.45 6.94-17.06 16.48-16.83 28.61.23 9.48 3.84 17.37 10.84 23.66 4.35 3.96 9.38 6.85 15.08 8.68-2.31 6.84-5.06 13.88-8.24 21.13zM119.22 33.11c0-7.39 2.66-14.19 7.97-20.4 5.31-6.22 11.83-10.02 19.55-11.41.4 1.15.61 2.38.61 3.68 0 7.39-2.73 14.28-8.19 20.67-5.46 6.39-12.09 10.15-19.89 11.28-.05-1.25-.05-2.51-.05-3.82z" />
        </svg>
      </div>
    );
  }

  // 2. Google: Official 4-color "G"
  if (normalized.includes('google') || normalized.includes('pixel')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 24 24" className="h-8 w-8">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.88-3.03c-1.08.72-2.46 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.13C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.13z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.03 3.13c.95-2.85 3.6-4.96 6.73-4.96z" />
        </svg>
      </div>
    );
  }

  // 3. Samsung: Official Royal Blue wordmark
  if (normalized.includes('samsung') || normalized.includes('galaxy')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans font-black tracking-[0.18em] text-sm text-[#034EA2] select-none">
          SAMSUNG
        </span>
      </div>
    );
  }

  // 4. Xiaomi: Official 'mi' in rounded orange badge
  if (normalized.includes('xiaomi') || normalized.includes('redmi') || normalized.includes('poco')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF6900] shadow-2xs">
          <svg viewBox="0 0 48 48" className="h-4 w-4 fill-white">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 8h32v32H8V8zm6 7h4.8v18H14V15zm8.4 0H28c4.2 0 6.6 2.4 6.6 6.6V33h-4.8V21.6c0-1.5-.9-2.1-2.4-2.1H24V33h-4.8V15h3.2zm6.6 6.6h3.6V33H29V21.6z"
            />
          </svg>
        </div>
      </div>
    );
  }

  // 5. OnePlus: Official 1+ in red badge
  if (normalized.includes('oneplus')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EB0029] shadow-2xs">
          <svg viewBox="0 0 48 48" className="h-4 w-4 stroke-white fill-none" strokeWidth="3">
            <rect x="5" y="5" width="38" height="38" rx="6" stroke="white" strokeWidth="3.5" />
            <path d="M19 19l4-3v16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M33 19v8M29 23h8" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  // 6. OPPO: Emerald Green wordmark
  if (normalized.includes('oppo')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans font-bold tracking-[0.2em] text-base text-[#008450] lowercase select-none">
          oppo
        </span>
      </div>
    );
  }

  // 7. Vivo: Cobalt Blue italic wordmark
  if (normalized.includes('vivo')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans italic font-black tracking-wider text-base text-[#0055FF] lowercase select-none">
          vivo
        </span>
      </div>
    );
  }

  // 8. Nothing: Minimal dot/bracket logo
  if (normalized.includes('nothing')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-mono text-xs font-bold tracking-[0.25em] text-zinc-950 uppercase select-none border-b-2 border-zinc-950 pb-0.5">
          NOTHING
        </span>
      </div>
    );
  }

  // 9. Motorola: Official Batwing M in dark navy circle
  if (normalized.includes('motorola')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00142E] shadow-2xs">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.89 14.54c-.95 0-1.81-.59-2.22-1.52l-1.67-3.79-1.67 3.79c-.41.93-1.27 1.52-2.22 1.52-.45 0-.89-.13-1.28-.4-.95-.65-1.23-1.9-.62-2.87L9.4 8.24c.48-.77 1.34-1.24 2.25-1.24h.7c.91 0 1.77.47 2.25 1.24l3.19 5.04c.61.97.33 2.22-.62 2.87-.39.26-.83.39-1.28.39z"/>
          </svg>
        </div>
      </div>
    );
  }

  // 10. Honor: Clean modern typography
  if (normalized.includes('honor')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans font-black tracking-[0.2em] text-xs uppercase text-zinc-950 select-none">
          HONOR
        </span>
      </div>
    );
  }

  // 11. ASUS / ROG: Bold ASUS wordmark
  if (normalized.includes('asus') || normalized.includes('rog')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans font-black tracking-[0.16em] text-xs uppercase text-zinc-950 select-none">
          ASUS
        </span>
      </div>
    );
  }

  // 12. Infinix: Clean modern typography
  if (normalized.includes('infinix')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans font-bold tracking-[0.18em] text-xs uppercase text-zinc-950 select-none">
          INFINIX
        </span>
      </div>
    );
  }

  // 13. Realme: Official Yellow bold badge
  if (normalized.includes('realme')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-sans font-black text-xs lowercase text-zinc-950 tracking-tight bg-[#FFC915] px-2 py-0.5 rounded-sm select-none">
          realme
        </span>
      </div>
    );
  }

  // 14. Sony: Classic serif wordmark
  if (normalized.includes('sony')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-serif font-black text-xs tracking-[0.2em] uppercase text-zinc-950 select-none">
          SONY
        </span>
      </div>
    );
  }

  // 15. Huawei: Red petal emblem
  if (normalized.includes('huawei')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ED1C24] shadow-2xs">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
            <path d="M12 2c-.6 3-2 5-4 7 2 .5 4 2 4 4 0-2 2-3.5 4-4-2-2-3.4-4-4-7zm-5 7c-1.5 2-3.5 3-5 3.5 1.5 1.5 3.5 2 5 2 .5-1.5 1-3.5 0-5.5zm10 0c-1 2-.5 4 0 5.5 1.5 0 3.5-.5 5-2-1.5-.5-3.5-1.5-5-3.5zM8 17c1 1 2.5 1.5 4 1.5s3-.5 4-1.5c-1-1-2.5-1.5-4-1.5s-3 .5-4 1.5z" />
          </svg>
        </div>
      </div>
    );
  }

  // Default fallback: Clean neutral monogram
  const initial = name.charAt(0).toUpperCase() || 'P';
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="font-sans font-bold text-xs tracking-wider text-zinc-900 uppercase">
        {name}
      </span>
    </div>
  );
};
