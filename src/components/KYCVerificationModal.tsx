import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  XCircle,
  CreditCard,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useKYC, KYCStatus } from "@/hooks/useKYC";

const kycSchema = z.object({
  pan_number: z
    .string()
    .length(10, "PAN must be exactly 10 characters")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)"),
  pan_holder_name: z
    .string()
    .min(2, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  bank_name: z
    .string()
    .min(2, "Bank name is required")
    .max(100, "Bank name must be less than 100 characters"),
  account_number: z
    .string()
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number must be at most 18 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  confirm_account_number: z.string(),
  ifsc_code: z
    .string()
    .length(11, "IFSC code must be 11 characters")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  account_holder_name: z
    .string()
    .min(2, "Name is required")
    .max(100, "Name must be less than 100 characters"),
}).refine((data) => data.account_number === data.confirm_account_number, {
  message: "Account numbers don't match",
  path: ["confirm_account_number"],
});

type KYCFormData = z.infer<typeof kycSchema>;

interface KYCVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const StatusDisplay = ({ status, rejectionReason }: { status: KYCStatus; rejectionReason?: string | null }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Verification Pending",
      description: "Your KYC documents are being reviewed. This usually takes 1-2 business days.",
      color: "text-highlight",
      bg: "bg-highlight/10",
    },
    approved: {
      icon: CheckCircle,
      title: "KYC Verified",
      description: "Your identity has been verified. You can now withdraw funds.",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    rejected: {
      icon: XCircle,
      title: "Verification Failed",
      description: rejectionReason || "Your KYC submission was rejected. Please re-submit with correct details.",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    not_submitted: {
      icon: Shield,
      title: "Complete KYC",
      description: "Submit your PAN and bank details to enable withdrawals.",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} rounded-xl p-6 text-center`}>
      <div className={`w-16 h-16 rounded-full ${config.bg} flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${config.color}`} />
      </div>
      <h3 className="font-semibold text-lg mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground">{config.description}</p>
    </div>
  );
};

const KYCVerificationModal = ({ open, onOpenChange, onSuccess }: KYCVerificationModalProps) => {
  const { kycStatus, kycDetails, isLoading, submitKYC, isKYCRejected } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      pan_number: "",
      pan_holder_name: "",
      bank_name: "",
      account_number: "",
      confirm_account_number: "",
      ifsc_code: "",
      account_holder_name: "",
    },
  });

  const handleSubmit = async (data: KYCFormData) => {
    setIsSubmitting(true);
    try {
      const success = await submitKYC({
        pan_number: data.pan_number.toUpperCase(),
        pan_holder_name: data.pan_holder_name,
        account_number: data.account_number,
        ifsc_code: data.ifsc_code.toUpperCase(),
        account_holder_name: data.account_holder_name,
        bank_name: data.bank_name,
      });

      if (success) {
        toast.success("KYC submitted successfully!", {
          description: "Your documents will be reviewed within 1-2 business days.",
        });
        setShowForm(false);
        onSuccess?.();
      } else {
        toast.error("Failed to submit KYC");
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error("An error occurred while submitting KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowForm = showForm || kycStatus === 'not_submitted' || isKYCRejected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            KYC Verification
          </DialogTitle>
          <DialogDescription>
            Complete your KYC to enable withdrawals
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Loading KYC status...</p>
            </motion.div>
          ) : !shouldShowForm && (kycStatus === 'pending' || kycStatus === 'approved') ? (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StatusDisplay status={kycStatus} rejectionReason={kycDetails?.rejection_reason} />
              
              {kycStatus === 'approved' && kycDetails && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PAN</span>
                    <span className="font-medium">{kycDetails.pan_number.slice(0, 4)}****{kycDetails.pan_number.slice(-1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium">{kycDetails.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="font-medium">****{kycDetails.account_number.slice(-4)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isKYCRejected && kycDetails?.rejection_reason && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Previous submission rejected</AlertTitle>
                  <AlertDescription>{kycDetails.rejection_reason}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* PAN Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      PAN Card Details
                    </div>

                    <FormField
                      control={form.control}
                      name="pan_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ABCDE1234F"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              maxLength={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pan_holder_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on PAN Card</FormLabel>
                          <FormControl>
                            <Input placeholder="As per PAN card" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bank Details Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      Bank Account Details
                    </div>

                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., State Bank of India" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="account_holder_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="As per bank records" {...field} />
                          </FormControl>
                          <FormDescription>
                            Must match the name on your PAN card
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirm_account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Re-enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ifsc_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SBIN0001234"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              maxLength={11}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Submit KYC
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your details are encrypted and securely stored. We use this information only for payment verification.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default KYCVerificationModal;
