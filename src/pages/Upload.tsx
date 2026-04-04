import { useState, useCallback, useEffect } from 'react';
import { Upload as UploadIcon, FileText, FileSpreadsheet, File, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadedFile } from '@/types/client';
import { toast } from 'sonner';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { addFile, deleteFile as deleteFileFn, getFiles } from '@/lib/firestore-services';
import { useAuth } from '@/contexts/AuthContext';

const acceptedTypes = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
];

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-8 h-8 text-destructive" />;
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="w-8 h-8 text-success" />;
  return <File className="w-8 h-8 text-muted-foreground" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Upload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    if (!user) return;
    getFiles(user.uid)
      .then(setFiles)
      .catch(() => toast.error('Erro ao carregar arquivos'))
      .finally(() => setLoadingFiles(false));
  }, [user]);

  const processFiles = useCallback(async (fileList: FileList) => {
    if (!user) return;
    setUploading(true);
    let count = 0;

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (!acceptedTypes.includes(f.type) && !f.name.endsWith('.csv')) {
        toast.error(`Formato não suportado: ${f.name}`);
        continue;
      }

      try {
        const storageRef = ref(storage, `users/${user.uid}/files/${Date.now()}_${f.name}`);
        const snap = await uploadBytes(storageRef, f);
        const url = await getDownloadURL(snap.ref);

        const uploaded: Omit<UploadedFile, 'id'> = {
          name: f.name,
          type: f.type,
          size: f.size,
          uploadedAt: new Date(),
          url,
        };
        const docRef = await addFile(user.uid, uploaded);

        setFiles(prev => [{ ...uploaded, id: docRef.id }, ...prev]);
        count++;
      } catch (err) {
        toast.error(`Erro ao enviar ${f.name}`);
      }
    }

    if (count > 0) toast.success(`${count} arquivo(s) enviado(s)`);
    setUploading(false);
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const removeFile = async (id: string) => {
    if (!user) return;
    await deleteFileFn(user.uid, id);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload de Arquivos</h1>
        <p className="text-sm text-muted-foreground">Envie arquivos CSV, XLS e PDF</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium mb-1">
          {uploading ? 'Enviando...' : 'Arraste arquivos aqui'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
        <label>
          <Button variant="outline" asChild disabled={uploading}>
            <span>Selecionar Arquivos</span>
          </Button>
          <input type="file" className="hidden" multiple accept=".csv,.xls,.xlsx,.pdf" onChange={handleFileInput} />
        </label>
        <p className="text-xs text-muted-foreground mt-3">Formatos aceitos: CSV, XLS, XLSX, PDF</p>
      </div>

      {loadingFiles ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : files.length > 0 && (
        <div className="bg-card rounded-xl card-shadow divide-y divide-border">
          <div className="p-4">
            <h2 className="font-semibold">Arquivos Enviados ({files.length})</h2>
          </div>
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)} • {file.uploadedAt.toLocaleDateString('pt-BR')} {file.uploadedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-2">
                {file.url && (
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted rounded text-xs text-primary font-medium">Ver</a>
                )}
                <Check className="w-4 h-4 text-success" />
                <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Upload;
