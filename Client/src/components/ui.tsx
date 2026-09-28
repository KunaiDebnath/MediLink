import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AppointmentStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, AlertCircleIcon, XIcon } from './Icons';

// ─── Button ─────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants: Record<string, string> = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 shadow-sm hover:shadow-md',
    secondary:
      'bg-white text-brand-700 font-semibold hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-white shadow-sm hover:shadow',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:ring-brand-400',
    danger:
      'bg-danger text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-400 shadow-sm',
    ghost:
      'text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
    success:
      'bg-success text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-400 shadow-sm',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {rest.required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white transition-colors
            ${icon ? 'pl-9' : ''}
            ${error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            }
            focus:outline-none ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-danger flex items-center gap-1"><AlertCircleIcon size={12} />{error}</p>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...rest }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {rest.required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white transition-colors resize-none
          ${error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          }
          focus:outline-none ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-danger flex items-center gap-1"><AlertCircleIcon size={12} />{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {rest.required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <select
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white transition-colors appearance-none cursor-pointer
          ${error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          }
          focus:outline-none ${className}`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger flex items-center gap-1"><AlertCircleIcon size={12} />{error}</p>}
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

const statusConfig: Record<AppointmentStatus, { label: string; bg: string; text: string; icon: ReactNode }> = {
  pending: {
    label: 'Pending',
    bg: 'bg-warning-bg',
    text: 'text-warning-text',
    icon: <ClockIcon size={12} className="shrink-0" />,
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-info-bg',
    text: 'text-info-text',
    icon: <CheckCircleIcon size={12} className="shrink-0" />,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-success-bg',
    text: 'text-success-text',
    icon: <CheckCircleIcon size={12} className="shrink-0" />,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    icon: <XCircleIcon size={12} className="shrink-0" />,
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-danger-bg',
    text: 'text-danger-text',
    icon: <XCircleIcon size={12} className="shrink-0" />,
  },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

export function DoctorCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-5/6 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </Card>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
    </Card>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-5">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </Card>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-danger-bg flex items-center justify-center text-danger mb-4">
        <AlertCircleIcon size={28} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">Try again</Button>
      )}
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const configs = {
    success: { bg: 'bg-slate-900', icon: <CheckCircleIcon size={16} className="text-emerald-400" /> },
    error: { bg: 'bg-slate-900', icon: <XCircleIcon size={16} className="text-red-400" /> },
    info: { bg: 'bg-slate-900', icon: <AlertCircleIcon size={16} className="text-blue-400" /> },
  };
  const { bg, icon } = configs[type];
  return (
    <div className={`${bg} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-72 max-w-sm`}>
      {icon}
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
        <XIcon size={14} />
      </button>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md ${className}`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100" aria-label="Close modal">
              <XIcon size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary' | 'success';
  loading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading = false }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  sub?: string;
}

export function StatsCard({ label, value, icon, color, sub }: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mb-0.5">{value}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ name, size = 'md', className = '' }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['bg-brand-100 text-brand-700', 'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-slate-200" />;
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center"><hr className="w-full border-slate-200" /></div>
      <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">{label}</span></div>
    </div>
  );
}
