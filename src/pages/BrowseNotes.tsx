import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NoteCard from "@/components/NoteCard";
import NoteCardSkeleton from "@/components/skeletons/NoteCardSkeleton";
import EmptyState from "@/components/EmptyState";
import PersonalizedSuggestions from "@/components/PersonalizedSuggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNotes } from "@/hooks/useNotes";

const BrowseNotes = () => {
  const {
    notes,
    filters,
    isLoading,
    currentPage,
    totalPages,
    updateFilters,
    resetFilters,
    goToPage,
  } = useNotes();

  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilters({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "Economics",
    "History",
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

  const activeFiltersCount = [
    filters.subject !== "all",
    filters.classLevel !== "all",
    filters.rating !== "all",
    filters.onlyVerified,
    filters.onlyFree,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchInput("");
    resetFilters();
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {start > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="icon"
              onClick={() => goToPage(1)}
            >
              1
            </Button>
            {start > 2 && <span className="px-2 text-muted-foreground">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="icon"
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Browse Notes"
        description="Discover quality study notes from verified students. Find notes for Class 10-12, B.Tech, MBA, and competitive exams."
        keywords="study notes, class 12 notes, JEE notes, NEET notes, B.Tech notes, free notes"
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Notes</h1>
            <p className="text-muted-foreground">
              Discover quality notes from verified students across all subjects.
            </p>
          </motion.div>

          {/* Personalized Suggestions Section */}
          {filters.search === '' && filters.subject === 'all' && (
            <PersonalizedSuggestions />
          )}

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search notes by title, subject, or author..."
                  className="pl-12 h-12"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-6 bg-card rounded-xl border shadow-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filter Notes</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      Clear All
                      <X className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Subject */}
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={filters.subject} 
                      onValueChange={(value) => updateFilters({ subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class */}
                  <div className="space-y-2">
                    <Label>Class / Stream</Label>
                    <Select 
                      value={filters.classLevel} 
                      onValueChange={(value) => updateFilters({ classLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label>Minimum Rating</Label>
                    <Select 
                      value={filters.rating} 
                      onValueChange={(value) => updateFilters({ rating: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4.8">4.8+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified"
                          checked={filters.onlyVerified}
                          onCheckedChange={(checked) => 
                            updateFilters({ onlyVerified: checked as boolean })
                          }
                        />
                        <label htmlFor="verified" className="text-sm cursor-pointer">
                          Verified only
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="free"
                          checked={filters.onlyFree}
                          onCheckedChange={(checked) => 
                            updateFilters({ onlyFree: checked as boolean, onlyPaid: false })
                          }
                        />
                        <label htmlFor="free" className="text-sm cursor-pointer">
                          Free only
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paid"
                          checked={filters.onlyPaid}
                          onCheckedChange={(checked) => 
                            updateFilters({ onlyPaid: checked as boolean, onlyFree: false })
                          }
                        />
                        <label htmlFor="paid" className="text-sm cursor-pointer">
                          Paid only
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value: 'popular' | 'recent' | 'rating' | 'downloads') => 
                        updateFilters({ sortBy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="downloads">Most Downloads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing <span className="font-semibold text-foreground">{notes.length}</span> notes
                  </>
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <NoteCardSkeleton key={i} />
                ))}
              </div>
            ) : notes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NoteCard
                        id={note.id}
                        title={note.title}
                        subject={note.subject}
                        class={note.class_level}
                        views={note.views_count || 0}
                        downloads={note.downloads_count || 0}
                        rating={note.rating_avg || 0}
                        author={note.uploader?.full_name || 'Unknown'}
                        isVerified={note.uploader?.is_verified}
                        previewImage={note.thumbnail_url || undefined}
                        isFree={note.is_free ?? true}
                        price={note.price ?? undefined}
                      />
                    </motion.div>
                  ))}
                </div>

                {renderPagination()}
              </>
            ) : (
              <EmptyState
                variant="search"
                title="No notes found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseNotes;
