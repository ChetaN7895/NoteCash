import { create } from 'zustand';

export interface NotificationNote {
  id: string;
  title: string;
  subject: string;
  createdAt: Date;
}

interface NotificationState {
  newNotes: NotificationNote[];
  addNewNote: (note: NotificationNote) => void;
  resetNewNotes: () => void;
  newNotesCount: number;
}

const MAX_NOTIFICATIONS = 10;

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  newNotes: [],
  newNotesCount: 0,
  addNewNote: (note) => set((state) => {
    const updatedNotes = [note, ...state.newNotes].slice(0, MAX_NOTIFICATIONS);
    return { 
      newNotes: updatedNotes,
      newNotesCount: updatedNotes.length 
    };
  }),
  resetNewNotes: () => set({ newNotes: [], newNotesCount: 0 }),
}));
