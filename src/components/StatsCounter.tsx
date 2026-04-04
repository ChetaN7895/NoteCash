import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, IndianRupee, Users, TrendingUp } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

interface StatsCounterProps {
  totalNotes?: number;
  totalEarningsPaid?: number;
  activeStudents?: number;
  totalDownloads?: number;
}

const StatItem = ({ icon: Icon, value, label, prefix = "", suffix = "", delay = 0 }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [hasUpdated, setHasUpdated] = useState(false);
  const prevValueRef = useRef(value);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Check if this is a real-time update (not initial load)
    if (!isInitialMount.current && prevValueRef.current !== value && value > 0) {
      setHasUpdated(true);
      const timer = setTimeout(() => setHasUpdated(false), 1500);
      return () => clearTimeout(timer);
    }
    isInitialMount.current = false;
    prevValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000 }}
      className="text-center relative"
    >
      {/* Update indicator */}
      <AnimatePresence>
        {hasUpdated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
          />
        )}
      </AnimatePresence>
      
      <motion.div 
        animate={hasUpdated ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={`w-14 h-14 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-300 ${
          hasUpdated ? "ring-2 ring-green-500/50 ring-offset-2 ring-offset-background" : ""
        }`}
      >
        <Icon className="w-6 h-6 text-primary-foreground" />
      </motion.div>
      
      <motion.div 
        animate={hasUpdated ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`text-3xl md:text-4xl font-bold mb-1 transition-colors duration-300 ${
          hasUpdated ? "text-green-500" : "text-foreground"
        }`}
      >
        {prefix}
        {formatNumber(count)}
        {suffix}
      </motion.div>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  );
};

// Minimum thresholds - show dummy data until real data exceeds these
const MINIMUM_THRESHOLDS = {
  totalNotes: 1000,
  totalEarningsPaid: 100000, // ₹1 lakh
  activeStudents: 1000,
  totalDownloads: 1000,
};

const StatsCounter = ({ 
  totalNotes = 0, 
  totalEarningsPaid = 0, 
  activeStudents = 0, 
  totalDownloads = 0 
}: StatsCounterProps) => {
  // Use real data only if it exceeds the threshold, otherwise show minimum
  const displayStats = {
    totalNotes: Math.max(totalNotes, MINIMUM_THRESHOLDS.totalNotes),
    totalEarningsPaid: Math.max(totalEarningsPaid, MINIMUM_THRESHOLDS.totalEarningsPaid),
    activeStudents: Math.max(activeStudents, MINIMUM_THRESHOLDS.activeStudents),
    totalDownloads: Math.max(totalDownloads, MINIMUM_THRESHOLDS.totalDownloads),
  };

  const stats = [
    { icon: FileText, value: displayStats.totalNotes, label: "Notes Uploaded", suffix: "+" },
    { icon: IndianRupee, value: displayStats.totalEarningsPaid, label: "Earnings Paid", prefix: "₹" },
    { icon: Users, value: displayStats.activeStudents, label: "Active Students", suffix: "+" },
    { icon: TrendingUp, value: displayStats.totalDownloads, label: "Total Downloads", suffix: "+" },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              {...stat}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
