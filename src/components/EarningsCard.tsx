import { useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Eye, Download, ArrowRight, Info, Shield, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WithdrawalModal from "@/components/WithdrawalModal";
import KYCVerificationModal from "@/components/KYCVerificationModal";
import { useKYC } from "@/hooks/useKYC";

interface EarningsCardProps {
  balance: number;
  withdrawable: number;
  totalViews: number;
  totalDownloads: number;
  viewsToNextMilestone: number;
}

const EarningsCard = ({
  balance,
  withdrawable,
  totalViews,
  totalDownloads,
  viewsToNextMilestone,
}: EarningsCardProps) => {
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const { kycStatus, isKYCApproved, isKYCPending, isLoading: kycLoading } = useKYC();
  const viewProgress = ((1000 - viewsToNextMilestone) / 1000) * 100;
  
  // Calculate earnings breakdown with new model:
  // First 1000 views = ₹50, then ₹10 per 1000 views
  // Downloads = ₹25 per 100 downloads
  const calculateViewsEarnings = () => {
    if (totalViews < 1000) return 0;
    const firstMilestone = 50; // ₹50 for first 1000 views
    const additionalThousands = Math.floor((totalViews - 1000) / 1000);
    return firstMilestone + (additionalThousands * 10);
  };
  const viewsEarnings = calculateViewsEarnings();
  const downloadsEarnings = Math.floor(totalDownloads / 100) * 25;

  const handleWithdrawClick = () => {
    if (!isKYCApproved) {
      setKycModalOpen(true);
    } else {
      setWithdrawalOpen(true);
    }
  };

  const getKYCBadge = () => {
    if (kycLoading) return null;
    
    if (isKYCApproved) {
      return (
        <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          KYC Verified
        </Badge>
      );
    }
    
    if (isKYCPending) {
      return (
        <Badge className="bg-highlight/20 text-highlight border-highlight/30 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          KYC Pending
        </Badge>
      );
    }
    
    return (
      <Badge 
        className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs cursor-pointer hover:bg-primary-foreground/30"
        onClick={() => setKycModalOpen(true)}
      >
        <Shield className="w-3 h-3 mr-1" />
        Complete KYC
      </Badge>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl p-6 text-primary-foreground shadow-xl shadow-primary/25"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold opacity-90">Your Earnings</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                className="bg-popover text-popover-foreground border-border p-4 max-w-xs"
              >
                <div className="space-y-3">
                  <p className="font-semibold text-sm">Earnings Breakdown</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        {totalViews.toLocaleString()} views
                      </span>
                      <span className="font-medium">₹{viewsEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Download className="w-3.5 h-3.5" />
                        {totalDownloads.toLocaleString()} downloads
                      </span>
                      <span className="font-medium">₹{downloadsEarnings.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between items-center">
                      <span className="font-medium">Total Earned</span>
                      <span className="font-bold text-primary">₹{(viewsEarnings + downloadsEarnings).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                    ₹50 at first 1K views • ₹10 per 1K after • ₹25 per 100 downloads
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mb-6">
          <p className="text-sm opacity-70 mb-1">Total Balance</p>
          <p className="text-4xl font-bold">₹{balance.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-primary-foreground/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 opacity-70" />
              <span className="text-sm opacity-70">Views</span>
            </div>
            <p className="text-xl font-semibold">{totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 opacity-70" />
              <span className="text-sm opacity-70">Downloads</span>
            </div>
            <p className="text-xl font-semibold">{totalDownloads.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to next milestone */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="opacity-70">
              {totalViews < 1000 ? "First ₹50 milestone" : "Next ₹10 milestone"}
            </span>
            <span className="font-medium">{viewsToNextMilestone} views left</span>
          </div>
          <Progress value={viewProgress} className="h-2 bg-primary-foreground/20" />
        </div>

        {/* KYC Status Badge */}
        <div className="mb-4">
          {getKYCBadge()}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Withdrawable</p>
            <p className="text-xl font-bold">₹{withdrawable.toLocaleString()}</p>
          </div>
          <Button
            variant="secondary"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            disabled={withdrawable < 500}
            onClick={handleWithdrawClick}
          >
            {isKYCApproved ? "Withdraw" : "Complete KYC"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {withdrawable < 500 && (
          <p className="text-xs opacity-60 mt-3 text-center">
            Minimum withdrawal: ₹500
          </p>
        )}

        {!isKYCApproved && withdrawable >= 500 && (
          <p className="text-xs opacity-60 mt-3 text-center">
            Complete KYC verification to withdraw funds
          </p>
        )}
      </motion.div>

      <WithdrawalModal
        open={withdrawalOpen}
        onOpenChange={setWithdrawalOpen}
        withdrawableAmount={withdrawable}
      />

      <KYCVerificationModal
        open={kycModalOpen}
        onOpenChange={setKycModalOpen}
        onSuccess={() => {
          // If KYC gets approved (rare instant case) or submitted, close modal
        }}
      />
    </>
  );
};

export default EarningsCard;
