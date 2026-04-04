import { motion } from 'framer-motion';
import { LucideIcon, FileX, Search, Upload, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: 'default' | 'notes' | 'search' | 'uploads' | 'purchases';
}

const variantIcons = {
  default: FileX,
  notes: FileX,
  search: Search,
  uploads: Upload,
  purchases: ShoppingBag,
};

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
}: EmptyStateProps) => {
  const Icon = icon || variantIcons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

      {(actionLabel && actionHref) && (
        <Link to={actionHref}>
          <Button variant="hero">{actionLabel}</Button>
        </Link>
      )}

      {(actionLabel && onAction && !actionHref) && (
        <Button variant="hero" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
