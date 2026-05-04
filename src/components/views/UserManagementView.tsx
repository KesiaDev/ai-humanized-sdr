import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield, User, Mail, Loader2, Trash2 } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
  email?: string;
}

async function fetchUserRoles(): Promise<UserRole[]> {
  const { data, error } = await (supabase as any).from('user_roles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  // get current user email
  const { data: auth } = await supabase.auth.getUser();
  return (data ?? []).map((r: any) => ({
    ...r,
    email: r.user_id === auth.user?.id ? auth.user?.email : `...${r.user_id.slice(-8)}`,
  }));
}

export function UserManagementView() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading } = useQuery({ queryKey: ['user-roles'], queryFn: fetchUserRoles });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'admin' | 'user' }) => {
      const { error } = await (supabase as any).from('user_roles').update({ role }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-roles'] });
      toast({ title: 'Papel atualizado com sucesso' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const removeUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('user_roles').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-roles'] });
      toast({ title: 'Usuário removido' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: inviteEmail.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      toast({ title: 'Convite enviado!', description: `Link de acesso enviado para ${inviteEmail}` });
      setInviteEmail('');
    } catch (e: any) {
      toast({ title: 'Erro ao convidar', description: e.message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Convidar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Convidar usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">E-mail</Label>
              <Input
                type="email"
                placeholder="email@empresa.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="h-9"
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <div className="w-32 space-y-1">
              <Label className="text-xs">Papel</Label>
              <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={inviting} className="h-9 gap-1.5">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Convidar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">O usuário receberá um link de acesso por e-mail.</p>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4" /> Usuários cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando...
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {u.role === 'admin' ? <Shield className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.email}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Desde {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Select
                    value={u.role}
                    onValueChange={(v: any) => updateRole.mutate({ id: u.id, role: v })}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" className="text-xs">Usuário</SelectItem>
                      <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => removeUser.mutate(u.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
