import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, Smartphone, Building2, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

const upiSchema = z.object({
  amount: z.number().min(500, "Minimum withdrawal is ₹500").max(100000, "Maximum withdrawal is ₹1,00,000"),
  upiId: z.string()
    .min(1, "UPI ID is required")
    .regex(/^[\w.-]+@[\w]+$/, "Invalid UPI ID format (e.g., name@upi)"),
});

const bankSchema = z.object({
  amount: z.number().min(500, "Minimum withdrawal is ₹500").max(100000, "Maximum withdrawal is ₹1,00,000"),
  accountNumber: z.string()
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number must be at most 18 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  confirmAccountNumber: z.string(),
  ifscCode: z.string()
    .length(11, "IFSC code must be 11 characters")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  accountHolderName: z.string()
    .min(2, "Name is required")
    .max(100, "Name must be less than 100 characters"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ["confirmAccountNumber"],
});

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawableAmount: number;
  onSuccess?: () => void;
}

const WithdrawalModal = ({ open, onOpenChange, withdrawableAmount, onSuccess }: WithdrawalModalProps) => {
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const upiForm = useForm<z.infer<typeof upiSchema>>({
    resolver: zodResolver(upiSchema),
    defaultValues: {
      amount: Math.min(withdrawableAmount, 500),
      upiId: "",
    },
  });

  const bankForm = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      amount: Math.min(withdrawableAmount, 500),
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      accountHolderName: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof upiSchema> | z.infer<typeof bankSchema>) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      // Create withdrawal transaction
      const { data: txData, error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount: data.amount,
        type: "withdrawal",
        status: "pending",
        description: paymentMethod === "upi" 
          ? `Withdrawal to UPI: ${(data as z.infer<typeof upiSchema>).upiId}`
          : `Withdrawal to Bank: ****${(data as z.infer<typeof bankSchema>).accountNumber.slice(-4)}`,
      }).select("id").single();

      if (error) throw error;

      // Process via Razorpay
      const { data: result, error: fnError } = await supabase.functions.invoke("process-withdrawal", {
        body: { transactionId: txData.id },
      });

      if (fnError) {
        console.error("Razorpay processing error:", fnError);
        toast.warning("Withdrawal request saved but payment processing pending.", {
          description: "Admin will process it manually.",
        });
      }

      setIsSuccess(true);
      toast.success("Withdrawal request submitted!", {
        description: result?.message || "Your request will be processed within 2-3 business days.",
      });

      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        upiForm.reset();
        bankForm.reset();
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Available balance: <span className="font-semibold text-foreground">₹{withdrawableAmount.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Request Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                Your withdrawal will be processed within 2-3 business days.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "upi" | "bank")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upi" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    UPI
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Transfer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upi">
                  <Form {...upiForm}>
                    <form onSubmit={upiForm.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={upiForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="500"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                max={withdrawableAmount}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={upiForm.control}
                        name="upiId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UPI ID</FormLabel>
                            <FormControl>
                              <Input placeholder="yourname@upi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-4 h-4 mr-2" />
                            Withdraw ₹{upiForm.watch("amount") || 0}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="bank">
                  <Form {...bankForm}>
                    <form onSubmit={bankForm.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={bankForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="500"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                max={withdrawableAmount}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bankForm.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bankForm.control}
                        name="accountNumber"
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
                        control={bankForm.control}
                        name="confirmAccountNumber"
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
                        control={bankForm.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="ABCD0123456" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-4 h-4 mr-2" />
                            Withdraw ₹{bankForm.watch("amount") || 0}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Withdrawals require admin approval and KYC verification.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
