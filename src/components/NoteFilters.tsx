import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { NoteFilters as NoteFiltersType } from '@/types/note';

interface NoteFiltersProps {
  filters: NoteFiltersType;
  onFiltersChange: (filters: Partial<NoteFiltersType>) => void;
  onClear: () => void;
  subjects: string[];
  classes: string[];
  showStatusFilter?: boolean;
}

const NoteFilters = ({
  filters,
  onFiltersChange,
  onClear,
  subjects,
  classes,
  showStatusFilter = false,
}: NoteFiltersProps) => {
  const activeFiltersCount = [
    filters.subject,
    filters.class_name,
    filters.is_free !== null,
    filters.is_verified,
    filters.min_rating,
    filters.status,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes by title, subject..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Subject */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Subject</Label>
          <Select
            value={filters.subject || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ subject: value === 'all' ? '' : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Class</Label>
          <Select
            value={filters.class_name || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ class_name: value === 'all' ? '' : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Sort By</Label>
          <Select
            value={filters.sort_by}
            onValueChange={(value: NoteFiltersType['sort_by']) =>
              onFiltersChange({ sort_by: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Rating */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Min Rating</Label>
          <Select
            value={filters.min_rating?.toString() || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                min_rating: value === 'all' ? null : parseInt(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter (Admin only) */}
        {showStatusFilter && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  status: value === 'all' ? null : (value as 'pending' | 'approved' | 'rejected'),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="free-only"
            checked={filters.is_free === true}
            onCheckedChange={(checked) =>
              onFiltersChange({ is_free: checked ? true : null })
            }
          />
          <Label htmlFor="free-only" className="text-sm cursor-pointer">
            Free Notes Only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified-only"
            checked={filters.is_verified === true}
            onCheckedChange={(checked) =>
              onFiltersChange({ is_verified: checked ? true : null })
            }
          />
          <Label htmlFor="verified-only" className="text-sm cursor-pointer">
            Verified Uploaders Only
          </Label>
        </div>
      </div>

      {/* Active Filters & Clear */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            <SlidersHorizontal className="inline-block w-4 h-4 mr-1" />
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </span>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoteFilters;
