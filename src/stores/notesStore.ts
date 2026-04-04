import { create } from 'zustand';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  class_level: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url: string | null;
  views_count: number;
  downloads_count: number;
  rating_avg: number;
  rating_count: number;
  is_free: boolean;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    full_name: string | null;
    is_verified: boolean;
  };
}

interface NotesFilters {
  search: string;
  subject: string;
  classLevel: string;
  rating: string;
  sortBy: 'popular' | 'recent' | 'rating' | 'downloads';
  onlyVerified: boolean;
  onlyFree: boolean;
  onlyPaid: boolean;
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  userNotes: Note[];
  purchasedNotes: Note[];
  filters: NotesFilters;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  
  // Actions
  setNotes: (notes: Note[]) => void;
  setCurrentNote: (note: Note | null) => void;
  setUserNotes: (notes: Note[]) => void;
  setPurchasedNotes: (notes: Note[]) => void;
  setFilters: (filters: Partial<NotesFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
}

const defaultFilters: NotesFilters = {
  search: '',
  subject: 'all',
  classLevel: 'all',
  rating: 'all',
  sortBy: 'popular',
  onlyVerified: false,
  onlyFree: false,
  onlyPaid: false,
};

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  currentNote: null,
  userNotes: [],
  purchasedNotes: [],
  filters: defaultFilters,
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  
  setNotes: (notes) => set({ notes }),
  setCurrentNote: (currentNote) => set({ currentNote }),
  setUserNotes: (userNotes) => set({ userNotes }),
  setPurchasedNotes: (purchasedNotes) => set({ purchasedNotes }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
}));
