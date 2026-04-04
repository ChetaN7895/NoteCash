import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, X, Image as ImageIcon, CheckCircle, Camera, Trash2 } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { z } from "zod";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Economics",
  "History",
  "Geography",
  "Other",
];

const classes = [
  "Class 10",
  "Class 11",
  "Class 12",
  "B.Tech",
  "BCA",
  "MCA",
  "MBA",
  "Competitive Exams",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const uploadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  subject: z.string().min(1, "Please select a subject"),
  classLevel: z.string().min(1, "Please select a class"),
});

const UploadForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [firstPageImage, setFirstPageImage] = useState<File | null>(null);
  const [firstPagePreview, setFirstPagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; subject?: string; classLevel?: string; files?: string }>({});
  const coverInputRef = useRef<HTMLInputElement>(null);
  const firstPageInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `${file.name}: Only PDF and image files are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size must be less than 10MB`;
    }
    return null;
  };

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP images are allowed";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "Image size must be less than 5MB";
    }
    return null;
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast({ title: "Invalid Image", description: error, variant: "destructive" });
      return;
    }

    setCoverPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFirstPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast({ title: "Invalid Image", description: error, variant: "destructive" });
      return;
    }

    setFirstPageImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFirstPagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const removeFirstPageImage = () => {
    setFirstPageImage(null);
    setFirstPagePreview(null);
    if (firstPageInputRef.current) firstPageInputRef.current.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setErrors((prev) => ({ ...prev, files: undefined }));
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    droppedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errorMessages.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      setErrors((prev) => ({ ...prev, files: errorMessages.join("; ") }));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, files: undefined }));
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errorMessages: string[] = [];

      selectedFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errorMessages.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errorMessages.length > 0) {
        setErrors((prev) => ({ ...prev, files: errorMessages.join("; ") }));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImageToStorage = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from("notes").upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("notes").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to upload notes.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Validate form
    const result = uploadSchema.safeParse({ title, description, subject, classLevel });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (files.length === 0) {
      setErrors((prev) => ({ ...prev, files: "Please upload at least one file" }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload main file to storage
      const file = files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("notes")
        .getPublicUrl(fileName);

      // Upload cover photo if provided
      let thumbnailUrl: string | null = null;
      if (coverPhoto) {
        thumbnailUrl = await uploadImageToStorage(coverPhoto, "covers");
      }

      // Upload first page image if provided
      let firstPageUrl: string | null = null;
      if (firstPageImage) {
        firstPageUrl = await uploadImageToStorage(firstPageImage, "previews");
      }

      // Use first page as thumbnail fallback if no cover provided
      const finalThumbnail = thumbnailUrl || firstPageUrl;

      // Create note record with pending status
      const { data: noteData, error: noteError } = await supabase.from("notes").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        subject,
        class_level: classLevel,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        thumbnail_url: finalThumbnail,
        status: "pending",
      }).select('id').single();

      if (noteError) {
        throw noteError;
      }

      // Trigger auto-approval
      toast({
        title: "Processing...",
        description: "AI is reviewing your notes for approval.",
      });

      const { data: approvalResult, error: approvalError } = await supabase.functions.invoke('auto-approve-note', {
        body: { noteId: noteData.id }
      });

      if (approvalError) {
        console.error("Auto-approval error:", approvalError);
        toast({
          title: "Notes Submitted",
          description: "Your notes are pending manual review.",
        });
      } else if (approvalResult?.status === 'approved') {
        toast({
          title: "Notes Approved! ✓",
          description: "Your notes have been automatically approved and are now live.",
        });
      } else if (approvalResult?.status === 'rejected') {
        toast({
          title: "Notes Rejected",
          description: approvalResult?.rejectionReason || "Your notes did not meet our quality standards. Please review and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Notes Submitted",
          description: "Your notes are being reviewed.",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSubject("");
      setClassLevel("");
      setFiles([]);
      setCoverPhoto(null);
      setCoverPreview(null);
      setFirstPageImage(null);
      setFirstPagePreview(null);
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Note Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Calculus Chapter 1 - Limits & Derivatives"
          className={`h-12 ${errors.title ? "border-destructive" : ""}`}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what's covered in these notes..."
          rows={4}
        />
      </div>

      {/* Subject & Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subject *</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className={`h-12 ${errors.subject ? "border-destructive" : ""}`}>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="text-sm text-destructive">{errors.subject}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Class / Stream *</Label>
          <Select value={classLevel} onValueChange={setClassLevel}>
            <SelectTrigger className={`h-12 ${errors.classLevel ? "border-destructive" : ""}`}>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classLevel && (
            <p className="text-sm text-destructive">{errors.classLevel}</p>
          )}
        </div>
      </div>

      {/* Cover Photo & First Page */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cover Photo */}
        <div className="space-y-2">
          <Label>Cover Photo (optional)</Label>
          <p className="text-xs text-muted-foreground">Displayed as thumbnail in browse view</p>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverPhotoChange}
            className="hidden"
            id="cover-upload"
          />
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden border bg-muted aspect-[4/3]">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeCoverPhoto}
                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="cover-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 aspect-[4/3] cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Camera className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload cover</span>
              <span className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WebP • Max 5MB</span>
            </label>
          )}
        </div>

        {/* First Page Preview */}
        <div className="space-y-2">
          <Label>First Page Preview (optional)</Label>
          <p className="text-xs text-muted-foreground">Show the first page of your notes</p>
          <input
            ref={firstPageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFirstPageChange}
            className="hidden"
            id="firstpage-upload"
          />
          {firstPagePreview ? (
            <div className="relative rounded-xl overflow-hidden border bg-muted aspect-[4/3]">
              <img src={firstPagePreview} alt="First page" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeFirstPageImage}
                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="firstpage-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 aspect-[4/3] cursor-pointer hover:border-primary/50 transition-colors"
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload first page</span>
              <span className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WebP • Max 5MB</span>
            </label>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Upload Files * (PDF or Images, max 10MB each)</Label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragActive
              ? "border-primary bg-primary/5"
              : errors.files
              ? "border-destructive"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground font-medium mb-1">
              Drag & drop files here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse (PDF, Images only)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </div>
        {errors.files && (
          <p className="text-sm text-destructive">{errors.files}</p>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({files.length})</Label>
          <div className="space-y-2">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Submit for Review
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By uploading, you agree to our content guidelines and terms of service.
      </p>
    </motion.form>
  );
};

export default UploadForm;
