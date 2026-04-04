import { useEffect, useCallback } from 'react';
import { useNotesStore } from '@/stores/notesStore';
import { notesService, NotesQueryParams } from '@/services/notes.service';

export const useNotes = (autoFetch: boolean = true) => {
  const {
    notes,
    currentNote,
    userNotes,
    purchasedNotes,
    filters,
    isLoading,
    currentPage,
    totalPages,
    setNotes,
    setCurrentNote,
    setUserNotes,
    setFilters,
    resetFilters,
    setLoading,
    setCurrentPage,
    setTotalPages,
  } = useNotesStore();

  const fetchNotes = useCallback(async (params?: NotesQueryParams) => {
    setLoading(true);
    try {
      const queryParams: NotesQueryParams = {
        page: currentPage,
        limit: 9,
        search: filters.search,
        subject: filters.subject,
        classLevel: filters.classLevel,
        rating: filters.rating,
        sortBy: filters.sortBy,
        onlyVerified: filters.onlyVerified,
        onlyFree: filters.onlyFree,
        onlyPaid: filters.onlyPaid,
        ...params,
      };

      const { notes, total } = await notesService.getNotes(queryParams);
      setNotes(notes);
      setTotalPages(Math.ceil(total / 9));
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const fetchNoteById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const note = await notesService.getNoteById(id);
      setCurrentNote(note);
      return note;
    } catch (error) {
      console.error('Error fetching note:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserNotes = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const notes = await notesService.getUserNotes(userId);
      setUserNotes(notes);
    } catch (error) {
      console.error('Error fetching user notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchNotes();
    }
  }, [filters, currentPage, autoFetch]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setCurrentPage(1); // Reset to first page on filter change
    setFilters(newFilters);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    notes,
    currentNote,
    userNotes,
    purchasedNotes,
    filters,
    isLoading,
    currentPage,
    totalPages,
    fetchNotes,
    fetchNoteById,
    fetchUserNotes,
    updateFilters,
    resetFilters: () => {
      setCurrentPage(1);
      resetFilters();
    },
    goToPage,
  };
};
