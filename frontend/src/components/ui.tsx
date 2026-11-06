import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Tone } from '@/lib/format';
import type { PaginationMeta } from '@/types';

/* ------------------------------------------------------------------ Button */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'brand';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const variants: Record<Variant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
  brand: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80',
  outline: 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};
const sizes: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-lg gap-1',
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-2xl gap-2',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/10',
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

/* ------------------------------------------------------------------ Form fields */

interface FieldWrap {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldWrap & { icon?: ReactNode }>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn('input', icon && 'pl-10', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10')}
            {...props}
          />
        </div>
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrap>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <textarea ref={ref} id={inputId} className={cn('input min-h-[96px] resize-y', error && 'border-red-400')} {...props} />
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldWrap>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'input appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9',
            error && 'border-red-400',
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

export function Switch({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string; disabled?: boolean }) {
  return (
    <label className={cn('flex items-start gap-3', disabled ? 'opacity-50' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition-colors', checked ? 'bg-zinc-900' : 'bg-zinc-200')}
      >
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </button>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-medium text-zinc-900">{label}</span>}
          {description && <span className="block text-xs text-zinc-500">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; className?: string }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 text-sm text-zinc-700 select-none', className)}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 accent-zinc-900" />
      {label}
    </label>
  );
}

/* ------------------------------------------------------------------ Badge */

const tones: Record<Tone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
};

export function Badge({ tone = 'neutral', dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ Feedback */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-zinc-400', className)} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-zinc-100', className)} />;
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">{icon}</div>}
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ Overlays */

function useLockBody(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title?: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' }) {
  useLockBody(open, onClose);
  if (!open) return null;
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-zinc-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full animate-scale-in flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', w)}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
            <div>
              {title && <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
            </div>
            <button onClick={onClose} className="-mr-2 -mt-1 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 'max-w-md' }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; side?: 'right' | 'left'; width?: string }) {
  useLockBody(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 animate-fade-in bg-zinc-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('absolute top-0 flex h-full w-full flex-col bg-white shadow-2xl', width, side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-fade-in')}>
        {title && (
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div className="text-base font-semibold text-zinc-900">{title}</div>
            <button onClick={onClose} className="-mr-2 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-zinc-100 p-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmText = 'Confirm', danger, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description?: string; confirmText?: string; danger?: boolean; loading?: boolean }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-600">{description}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Pagination */

export function Pagination({ meta, onPage, className }: { meta?: PaginationMeta | null; onPage: (p: number) => void; className?: string }) {
  if (!meta || meta.last_page <= 1) return null;
  const { current_page: cur, last_page: last } = meta;
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || Math.abs(i - cur) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <nav className={cn('flex items-center justify-center gap-1', className)}>
      <Button variant="ghost" size="icon-sm" disabled={cur <= 1} onClick={() => onPage(cur - 1)} aria-label="Previous">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-sm text-zinc-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cn('h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition', p === cur ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100')}
          >
            {p}
          </button>
        ),
      )}
      <Button variant="ghost" size="icon-sm" disabled={cur >= last} onClick={() => onPage(cur + 1)} aria-label="Next">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

/* ------------------------------------------------------------------ Misc */

export function Stars({ value = 0, size = 'sm', className }: { value?: number; size?: 'xs' | 'sm' | 'md'; className?: string }) {
  const s = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-5 w-5' }[size];
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn(s, i <= Math.round(value) ? 'fill-amber-400' : 'fill-zinc-200')}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </div>
  );
}

export function Avatar({ name, src, size = 'md', className }: { name?: string | null; src?: string | null; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-base' }[size];
  const init = (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('');
  if (src) return <img src={src} alt={name ?? ''} className={cn('rounded-full object-cover', s, className)} />;
  return <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 font-semibold text-white', s, className)}>{init}</div>;
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />}
          {it.to ? (
            <Link to={it.to} className="hover:text-zinc-900">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-zinc-900">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: { value: T; label: ReactNode; count?: number }[]; className?: string }) {
  return (
    <div className={cn('inline-flex gap-1 rounded-xl bg-zinc-100 p-1', className)}>
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition whitespace-nowrap',
            value === it.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900',
          )}
        >
          {it.label}
          {it.count !== undefined && <span className="rounded-md bg-zinc-200/70 px-1.5 text-[11px] text-zinc-600">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

