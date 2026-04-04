import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Check, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
}

const ReferralCard = () => {
  const user = useAuthStore((state) => state.user);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : "";

  useEffect(() => {
    if (!user) return;

    const fetchReferralData = async () => {
      setIsLoading(true);
      try {
        // Fetch referral code from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", user.id)
          .single();

        if (profile?.referral_code) {
          setReferralCode(profile.referral_code);
        }

        // Fetch referral stats
        const { data: referrals } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", user.id);

        if (referrals) {
          const completed = referrals.filter(r => r.status === "completed");
          const pending = referrals.filter(r => r.status === "pending");
          
          setStats({
            totalReferrals: referrals.length,
            completedReferrals: completed.length,
            pendingReferrals: pending.length,
            totalEarnings: completed.reduce((sum, r) => sum + Number(r.bonus_amount), 0),
          });
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralData();

    // Subscribe to realtime updates for referrals
    const channel = supabase
      .channel("referrals-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "referrals",
          filter: `referrer_id=eq.${user.id}`,
        },
        () => {
          fetchReferralData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `Referral ${type} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join NotesHub!",
          text: `Use my referral code ${referralCode} to sign up and we both earn ₹1!`,
          url: referralLink,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          copyToClipboard(referralLink, "link");
        }
      }
    } else {
      copyToClipboard(referralLink, "link");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border shadow-card p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border shadow-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Gift className="w-4 h-4 text-accent" />
          Refer & Earn
        </h3>
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
          ₹1 per referral
        </Badge>
      </div>

      {/* Referral Code */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Your referral code</p>
        <div className="flex gap-2">
          <Input
            value={referralCode || ""}
            readOnly
            className="font-mono text-center font-semibold tracking-widest"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => referralCode && copyToClipboard(referralCode, "code")}
          >
            {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Share Button */}
      <Button
        variant="default"
        className="w-full mb-4"
        onClick={shareReferral}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Referral Link
      </Button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-lg font-bold">{stats.totalReferrals}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="bg-accent/10 rounded-lg p-2">
          <p className="text-lg font-bold text-accent">{stats.completedReferrals}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </div>
        <div className="bg-highlight/10 rounded-lg p-2">
          <p className="text-lg font-bold text-highlight">₹{stats.totalEarnings}</p>
          <p className="text-[10px] text-muted-foreground">Earned</p>
        </div>
      </div>

      {stats.pendingReferrals > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          <Users className="w-3 h-3 inline mr-1" />
          {stats.pendingReferrals} pending (complete when they upload a note)
        </p>
      )}
    </motion.div>
  );
};

export default ReferralCard;
