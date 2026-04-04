import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Upload, Trash2, Plus, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BulkNoteEntry {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  fileUrl: string;
  description: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const emptyEntry = (): BulkNoteEntry => ({
  id: crypto.randomUUID(),
  title: '',
  subject: '',
  classLevel: '',
  fileUrl: '',
  description: '',
  status: 'pending',
});

const BulkUpload = () => {
  const profile = useAuthStore((s) => s.profile);
  const [entries, setEntries] = useState<BulkNoteEntry[]>([emptyEntry()]);
  const [isUploading, setIsUploading] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const updateEntry = (id: string, field: keyof BulkNoteEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);

  const removeEntry = (id: string) => {
    if (entries.length === 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const parsePasteData = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.trim().split('\n').filter(Boolean);
    const parsed: BulkNoteEntry[] = lines.map((line) => {
      // Support tab or comma separated: title, subject, class, fileUrl, description(optional)
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      return {
        id: crypto.randomUUID(),
        title: parts[0]?.trim() || '',
        subject: parts[1]?.trim() || '',
        classLevel: parts[2]?.trim() || '',
        fileUrl: parts[3]?.trim() || '',
        description: parts[4]?.trim() || '',
        status: 'pending' as const,
      };
    });
    setEntries(parsed);
    setPasteMode(false);
    setPasteText('');
    toast.success(`Parsed ${parsed.length} entries`);
  };

  const validateEntry = (e: BulkNoteEntry): string | null => {
    if (!e.title) return 'Title is required';
    if (!e.subject) return 'Subject is required';
    if (!e.classLevel) return 'Class is required';
    if (!e.fileUrl) return 'File URL is required';
    try {
      new URL(e.fileUrl);
    } catch {
      return 'Invalid file URL';
    }
    return null;
  };

  const handleBulkUpload = async () => {
    if (!profile?.id) {
      toast.error('You must be logged in');
      return;
    }

    setIsUploading(true);
    const results = [...entries];

    for (let i = 0; i < results.length; i++) {
      const entry = results[i];
      const validationError = validateEntry(entry);
      if (validationError) {
        results[i] = { ...entry, status: 'error', error: validationError };
        continue;
      }

      try {
        // Determine file type from URL
        const urlPath = new URL(entry.fileUrl).pathname.toLowerCase();
        const fileType = urlPath.endsWith('.pdf') ? 'application/pdf'
          : urlPath.endsWith('.png') ? 'image/png'
          : urlPath.endsWith('.jpg') || urlPath.endsWith('.jpeg') ? 'image/jpeg'
          : 'application/pdf';

        const { error } = await supabase.from('notes').insert({
          title: entry.title,
          subject: entry.subject,
          class_level: entry.classLevel,
          file_url: entry.fileUrl,
          file_type: fileType,
          file_size: 0,
          description: entry.description || null,
          user_id: profile.id,
          status: 'approved',
          is_free: true,
          price: 0,
        });

        if (error) throw error;
        results[i] = { ...entry, status: 'success' };
      } catch (err: any) {
        results[i] = { ...entry, status: 'error', error: err.message || 'Insert failed' };
      }

      setEntries([...results]);
    }

    setIsUploading(false);
    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    if (successCount > 0) toast.success(`${successCount} notes imported successfully`);
    if (errorCount > 0) toast.error(`${errorCount} notes failed to import`);
  };

  const successCount = entries.filter((e) => e.status === 'success').length;
  const errorCount = entries.filter((e) => e.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setPasteMode(!pasteMode)}>
          {pasteMode ? 'Manual Entry' : 'Paste CSV/TSV Data'}
        </Button>
        {!pasteMode && (
          <Button variant="outline" size="sm" onClick={addEntry}>
            <Plus className="w-4 h-4 mr-1" /> Add Row
          </Button>
        )}
        {successCount > 0 && <Badge variant="default" className="bg-green-600">{successCount} imported</Badge>}
        {errorCount > 0 && <Badge variant="destructive">{errorCount} failed</Badge>}
      </div>

      {/* Paste mode */}
      {pasteMode && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Paste data with each note on a new line. Format: <code className="bg-muted px-1 rounded">title, subject, class, file_url, description(optional)</code>
            <br />Supports both comma-separated and tab-separated values.
          </p>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Math Chapter 1, Mathematics, Class 10, https://example.com/math1.pdf, Algebra basics\nScience Notes, Science, Class 12, https://example.com/sci.pdf`}
            rows={6}
          />
          <Button onClick={parsePasteData} size="sm">Parse Data</Button>
        </div>
      )}

      {/* Manual entries */}
      {!pasteMode && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_1fr_auto_auto] gap-2 items-end p-3 border rounded-lg ${
                entry.status === 'success' ? 'border-green-500/50 bg-green-500/5' :
                entry.status === 'error' ? 'border-destructive/50 bg-destructive/5' : ''
              }`}
            >
              <div>
                <Label className="text-xs">Title *</Label>
                <Input
                  value={entry.title}
                  onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                  placeholder="Note title"
                  disabled={entry.status === 'success'}
                />
              </div>
              <div>
                <Label className="text-xs">Subject *</Label>
                <Input
                  value={entry.subject}
                  onChange={(e) => updateEntry(entry.id, 'subject', e.target.value)}
                  placeholder="e.g. Mathematics"
                  disabled={entry.status === 'success'}
                />
              </div>
              <div>
                <Label className="text-xs">Class *</Label>
                <Input
                  value={entry.classLevel}
                  onChange={(e) => updateEntry(entry.id, 'classLevel', e.target.value)}
                  placeholder="e.g. 10"
                  className="w-20"
                  disabled={entry.status === 'success'}
                />
              </div>
              <div>
                <Label className="text-xs">File URL *</Label>
                <Input
                  value={entry.fileUrl}
                  onChange={(e) => updateEntry(entry.id, 'fileUrl', e.target.value)}
                  placeholder="https://..."
                  disabled={entry.status === 'success'}
                />
              </div>
              <div className="flex items-center gap-1">
                {entry.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {entry.status === 'error' && (
                  <span title={entry.error} className="flex items-center">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length === 1 || entry.status === 'success'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {entry.status === 'error' && entry.error && (
                <p className="col-span-full text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {entry.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <Button
        onClick={handleBulkUpload}
        disabled={isUploading || entries.every((e) => e.status === 'success')}
        className="w-full md:w-auto"
      >
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" /> Import {entries.filter((e) => e.status !== 'success').length} Notes</>
        )}
      </Button>
    </div>
  );
};

export default BulkUpload;
