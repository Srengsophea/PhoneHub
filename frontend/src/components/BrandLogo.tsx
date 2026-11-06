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
  className = 'w-10 h-10',
  size = 'md',
}) => {
  const normalized = (slug || name).toLowerCase().trim();

  // 1. Apple: Iconic Apple silhouette with sleek dark glass look
  if (normalized.includes('apple') || normalized.includes('iphone')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md ${className}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8.92-2.85-.9.04-1.99.6-2.61 1.34-.55.63-1.03 1.67-.9 2.68 1 .08 2.03-.5 2.59-1.17z" />
        </svg>
      </div>
    );
  }

  // 2. Google: Official vibrant 4-color "G" emblem
  if (normalized.includes('google') || normalized.includes('pixel')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-white shadow-md border border-zinc-200/80 p-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.88-3.03c-1.08.72-2.46 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.13C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.13z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.03 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
      </div>
    );
  }

  // 3. Samsung: Official vibrant Samsung Royal Blue emblem (#034EA2)
  if (normalized.includes('samsung') || normalized.includes('galaxy')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#034EA2] text-white shadow-md p-1 ${className}`}>
        <span className="font-sans font-black tracking-wider text-[11px] text-white px-1">
          SAMSUNG
        </span>
      </div>
    );
  }

  // 4. Xiaomi: Official vibrant Xiaomi Orange (#FF6900) "mi" emblem
  if (normalized.includes('xiaomi') || normalized.includes('redmi') || normalized.includes('poco')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#FF6900] text-white shadow-md p-1.5 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-5 h-5 fill-white">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 8h32v32H8V8zm6 7h4.8v18H14V15zm8.4 0H28c4.2 0 6.6 2.4 6.6 6.6V33h-4.8V21.6c0-1.5-.9-2.1-2.4-2.1H24V33h-4.8V15h3.2zm6.6 6.6h3.6V33H29V21.6z"
          />
        </svg>
      </div>
    );
  }

  // 5. OnePlus: Official bold Crimson Red (#EB0029) 1+ emblem
  if (normalized.includes('oneplus')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#EB0029] text-white shadow-md p-1.5 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-5 h-5 fill-none stroke-white" strokeWidth="3">
          <rect x="5" y="5" width="38" height="38" rx="7" stroke="white" strokeWidth="3.5" />
          <path d="M19 19l4-3v16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 19v8M29 23h8" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 6. OPPO: Vibrant Emerald Green
  if (normalized.includes('oppo')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#008450] to-[#05944F] text-white shadow-md p-1 ${className}`}>
        <span className="font-sans font-black tracking-widest text-[12px] text-white lowercase">
          oppo
        </span>
      </div>
    );
  }

  // 7. Vivo: Electric Cobalt Blue
  if (normalized.includes('vivo')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#0055FF] text-white shadow-md p-1 ${className}`}>
        <span className="font-sans italic font-black tracking-wider text-[12px] text-white lowercase">
          vivo
        </span>
      </div>
    );
  }

  // 8. Realme: Official Canary Yellow emblem with bold black 'r'
  if (normalized.includes('realme')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#FFC915] text-black shadow-md p-1.5 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-5 h-5 fill-black">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 8h15c7.2 0 13 5.8 13 13 0 5.4-3.3 10-8 11.9L38 40h-8.2l-6.8-6h-6v6H10V8zm7 6v13h8c3.9 0 7-3.1 7-7s-3.1-6-7-6h-8z"
          />
        </svg>
      </div>
    );
  }

  // 9. Huawei: Iconic Red petal emblem
  if (normalized.includes('huawei')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#ED1C24] text-white shadow-md p-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2c-.6 3-2 5-4 7 2 .5 4 2 4 4 0-2 2-3.5 4-4-2-2-3.4-4-4-7zm-5 7c-1.5 2-3.5 3-5 3.5 1.5 1.5 3.5 2 5 2 .5-1.5 1-3.5 0-5.5zm10 0c-1 2-.5 4 0 5.5 1.5 0 3.5-.5 5-2-1.5-.5-3.5-1.5-5-3.5zM8 17c1 1 2.5 1.5 4 1.5s3-.5 4-1.5c-1-1-2.5-1.5-4-1.5s-3 .5-4 1.5z" />
        </svg>
      </div>
    );
  }

  // 10. Sony
  if (normalized.includes('sony')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-black border border-zinc-800 text-white shadow-md p-1 ${className}`}>
        <span className="font-serif text-[10px] font-black tracking-wider text-white">
          SONY
        </span>
      </div>
    );
  }

  // 11. ASUS / ROG
  if (normalized.includes('asus') || normalized.includes('rog')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-950 to-black border border-red-900/60 text-red-500 shadow-md p-1 ${className}`}>
        <span className="font-mono text-[10px] font-black tracking-wider">
          ROG
        </span>
      </div>
    );
  }

  // 12. Honor
  if (normalized.includes('honor')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/40 text-cyan-300 shadow-md p-1 ${className}`}>
        <span className="font-sans text-[10px] font-black tracking-widest uppercase">
          HONOR
        </span>
      </div>
    );
  }

  // Default fallback: Branded monogram badge
  const initial = name.charAt(0).toUpperCase() || 'P';
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-sm shadow-md ${className}`}>
      {initial}
    </div>
  );
};

