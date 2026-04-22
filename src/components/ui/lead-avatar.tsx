import { cn } from '@/lib/utils';

interface LeadAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'ativa' | 'pausada' | 'encerrada' | string;
  showStatus?: boolean;
}

// Paleta harmoniosa com a identidade teal/esmeralda — variações, não monótonas.
const GRADIENTS = [
  'from-teal-500 to-emerald-600',
  'from-emerald-500 to-cyan-600',
  'from-cyan-500 to-teal-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-500 to-orange-500',
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-blue-500 to-violet-600',
];

const SIZES: Record<NonNullable<LeadAvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const STATUS_DOT_SIZE: Record<NonNullable<LeadAvatarProps['size']>, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const cleaned = (name || '').trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function statusColor(status?: string): string {
  switch (status) {
    case 'ativa': return 'bg-success';
    case 'pausada': return 'bg-warning';
    case 'encerrada': return 'bg-muted-foreground';
    default: return 'bg-success';
  }
}

export function LeadAvatar({
  name,
  size = 'md',
  className,
  status,
  showStatus = false,
}: LeadAvatarProps) {
  const initials = getInitials(name);
  const gradient = GRADIENTS[hashString(name || 'lead') % GRADIENTS.length];

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-display font-semibold text-white',
          'bg-gradient-to-br shadow-md ring-2 ring-background',
          'select-none',
          gradient,
          SIZES[size],
        )}
        aria-label={name}
      >
        {initials}
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
            STATUS_DOT_SIZE[size],
            statusColor(status),
          )}
        />
      )}
    </div>
  );
}
