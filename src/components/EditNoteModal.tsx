import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Note } from "@/services/notes.service";

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "English", "Economics", "History", "Geography", "Other",
];

const classes = [
  "Class 10", "Class 11", "Class 12", "B.Tech", "BCA", "MCA", "MBA", "Competitive Exams",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface EditNoteModalProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const EditNoteModal = ({ note, open, onOpenChange, onSaved }: EditNoteModalProps) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  // Sync state when note changes
  const [lastNoteId, setLastNoteId] = useState<string | null>(null);
  if (note && note.id !== lastNoteId) {
    setLastNoteId(note.id);
    setTitle(note.title);
    setDescription(note.description || "");
    setSubject(note.subject);
    setClassLevel(note.class_level);
    setCoverFile(null);
    setCoverPreview(note.thumbnail_url || null);
    setRemoveCover(false);
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: "Invalid format", description: "Only JPG, PNG, WebP allowed", variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ title: "Too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setCoverFile(file);
    setRemoveCover(false);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(true);
    if (coverRef.current) coverRef.current.value = "";
  };

  const handleSave = async () => {
    if (!note || !user) return;
    if (!title.trim() || title.trim().length < 5) {
      toast({ title: "Title too short", description: "At least 5 characters", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      let thumbnailUrl = note.thumbnail_url;

      // Upload new cover if provided
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${user.id}/covers/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("notes").upload(path, coverFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("notes").getPublicUrl(path);
        thumbnailUrl = urlData.publicUrl;
      } else if (removeCover) {
        thumbnailUrl = null;
      }

      const { error } = await supabase
        .from("notes")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          subject,
          class_level: classLevel,
          thumbnail_url: thumbnailUrl,
        })
        .eq("id", note.id);

      if (error) throw error;

      toast({ title: "Saved", description: "Note updated successfully" });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Cover Photo */}
          <div className="space-y-2">
            <Label>Cover Photo</Label>
            <input
              ref={coverRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="hidden"
              id="edit-cover"
            />
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden border bg-muted aspect-[16/9]">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
                <label
                  htmlFor="edit-cover"
                  className="absolute bottom-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  <Camera className="w-4 h-4 text-primary" />
                </label>
              </div>
            ) : (
              <label
                htmlFor="edit-cover"
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 aspect-[16/9] cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload cover image</span>
                <span className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WebP • Max 5MB</span>
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteModal;
