export type NoteStatus = 'pending' | 'approved' | 'rejected';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  class_name: string;
  file_url: string;
  preview_url: string | null;
  price: number;
  is_free: boolean;
  status: NoteStatus;
  uploader_id: string;
  uploader_name?: string;
  is_verified: boolean;
  download_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface NoteFilters {
  search: string;
  subject: string;
  class_name: string;
  is_free: boolean | null;
  is_verified: boolean | null;
  min_rating: number | null;
  status: NoteStatus | null;
  sort_by: 'latest' | 'popular' | 'rating' | 'price_low' | 'price_high';
}

export interface CreateNoteData {
  title: string;
  description?: string;
  subject: string;
  class_name: string;
  file: File;
  price: number;
  is_free: boolean;
}

export interface UpdateNoteData {
  title?: string;
  description?: string;
  subject?: string;
  class_name?: string;
  price?: number;
  is_free?: boolean;
  status?: NoteStatus;
}
