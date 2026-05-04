import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, FileText, Music, Video, Copy, Trash2, Loader2, FolderOpen } from 'lucide-react';

const BUCKET = 'midias';

interface MediaFile {
  name: string;
  id: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return Image;
  if (['mp3','ogg','wav','m4a'].includes(ext)) return Music;
  if (['mp4','webm','mov','avi'].includes(ext)) return Video;
  return FileText;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'Imagem';
  if (['mp3','ogg','wav','m4a'].includes(ext)) return 'Áudio';
  if (['mp4','webm','mov','avi'].includes(ext)) return 'Vídeo';
  if (['pdf'].includes(ext)) return 'PDF';
  return 'Arquivo';
}

async function fetchFiles(): Promise<MediaFile[]> {
  const { data: auth } = await supabase.auth.getUser();
  const folder = auth.user?.id ?? 'shared';
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, { sortBy: { column: 'created_at', order: 'desc' } });
  if (error) return [];
  return (data ?? []).filter(f => f.name !== '.emptyFolderPlaceholder').map(f => {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${f.name}`);
    return {
      name: f.name,
      id: f.id ?? f.name,
      url: urlData.publicUrl,
      size: f.metadata?.size ?? 0,
      type: fileType(f.name),
      created_at: f.created_at ?? '',
    };
  });
}

export function MediaBankView() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('Todos');

  const { data: files = [], isLoading } = useQuery({ queryKey: ['media-files'], queryFn: fetchFiles });

  const deleteFile = useMutation({
    mutationFn: async (name: string) => {
      const { data: auth } = await supabase.auth.getUser();
      const folder = auth.user?.id ?? 'shared';
      const { error } = await supabase.storage.from(BUCKET).remove([`${folder}/${name}`]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media-files'] }); toast({ title: 'Arquivo removido' }); },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const folder = auth.user?.id ?? 'shared';
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from(BUCKET).upload(`${folder}/${safeName}`, file, { upsert: false });
      if (error) throw new Error(error.message);
      qc.invalidateQueries({ queryKey: ['media-files'] });
      toast({ title: 'Arquivo enviado!', description: file.name });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const copyUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copiada!', description: name });
  };

  const FILTERS = ['Todos', 'Imagem', 'Vídeo', 'Áudio', 'PDF', 'Arquivo'];
  const displayed = filter === 'Todos' ? files : files.filter(f => f.type === filter);
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{files.length} arquivos · {formatSize(totalSize)}</span>
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
          <Button size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Enviando...' : 'Enviar arquivo'}
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando arquivos...
        </div>
      ) : displayed.length === 0 ? (
        <div
          className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-16 text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <FolderOpen className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
          <p className="text-xs mt-1">Clique para enviar ou arraste arquivos aqui</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayed.map(file => {
            const Icon = fileIcon(file.name);
            const isImage = file.type === 'Imagem';
            return (
              <Card key={file.id} className="group hover:border-primary/40 transition-all overflow-hidden">
                <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                  ) : (
                    <Icon className="w-10 h-10 text-muted-foreground/40" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(file.url, file.name)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <Copy className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => deleteFile.mutate(file.name)} className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
                <CardContent className="pt-2 pb-2.5 px-2.5">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">{file.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatSize(file.size)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
