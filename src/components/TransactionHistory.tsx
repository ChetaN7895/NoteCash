import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Clock, Wallet, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string | null;
  description: string | null;
  created_at: string | null;
  note_id: string | null;
}

const TransactionHistory = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earning":
        return <ArrowDownRight className="w-4 h-4 text-accent" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-highlight/10 text-highlight text-xs">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Transaction History
          </h2>
        </div>
        <div className="p-4 space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Transaction History
        </h2>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground">
            Your earnings and withdrawals will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          <AnimatePresence>
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === "earning" 
                    ? "bg-accent/10" 
                    : transaction.type === "withdrawal"
                    ? "bg-destructive/10"
                    : "bg-secondary"
                }`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize">
                    {transaction.type === "earning" ? "Earning" : transaction.type}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {transaction.description || "Transaction"}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === "earning" 
                      ? "text-accent" 
                      : transaction.type === "withdrawal"
                      ? "text-destructive"
                      : ""
                  }`}>
                    {transaction.type === "earning" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.created_at 
                      ? format(new Date(transaction.created_at), "MMM dd, HH:mm")
                      : "-"
                    }
                  </p>
                </div>

                {getStatusBadge(transaction.status)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
