import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-card-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads, conversas..."
            className="pl-9 w-64 h-9 text-sm bg-muted border-none"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
