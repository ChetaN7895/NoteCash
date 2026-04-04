import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Clock, Shield } from "lucide-react";
import { format } from "date-fns";

interface KYCRequest {
  id: string;
  user_id: string;
  pan_number: string;
  pan_holder_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  bank_name: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  user_email?: string;
  user_name?: string;
}

const KYCManagement = () => {
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchKYCRequests = async () => {
    setIsLoading(true);
    try {
      const { data: kycData, error } = await supabase
        .from("kyc_details")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Fetch user details for each KYC request
      if (kycData && kycData.length > 0) {
        const userIds = kycData.map((kyc) => kyc.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const enrichedData = kycData.map((kyc) => ({
          ...kyc,
          user_email: profileMap.get(kyc.user_id)?.email,
          user_name: profileMap.get(kyc.user_id)?.full_name,
        }));

        setKycRequests(enrichedData as KYCRequest[]);
      } else {
        setKycRequests([]);
      }
    } catch (error) {
      console.error("Error fetching KYC requests:", error);
      toast.error("Failed to load KYC requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const handleApprove = async (kyc: KYCRequest) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("kyc_details")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", kyc.id);

      if (error) throw error;

      toast.success("KYC approved successfully");
      await fetchKYCRequests();
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast.error("Failed to approve KYC");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("kyc_details")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedKYC.id);

      if (error) throw error;

      toast.success("KYC rejected");
      await fetchKYCRequests();
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast.error("Failed to reject KYC");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-accent/10 text-accent border-accent/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-highlight/10 text-highlight border-highlight/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const pendingCount = kycRequests.filter((k) => k.status === "pending").length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
      </div>
    );
  }

  if (kycRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-lg mb-1">No KYC Requests</h3>
        <p className="text-muted-foreground text-sm">
          No users have submitted KYC verification yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {pendingCount} pending • {kycRequests.length} total requests
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>PAN</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kycRequests.map((kyc) => (
              <TableRow key={kyc.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{kyc.user_name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{kyc.user_email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {kyc.pan_number.slice(0, 4)}****{kyc.pan_number.slice(-1)}
                  </code>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{kyc.bank_name}</p>
                    <p className="text-xs text-muted-foreground">
                      ****{kyc.account_number.slice(-4)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(kyc.submitted_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedKYC(kyc);
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View KYC Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              KYC Details
            </DialogTitle>
            <DialogDescription>
              Review and verify user's KYC information
            </DialogDescription>
          </DialogHeader>

          {selectedKYC && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedKYC.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="font-medium">{selectedKYC.user_name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{selectedKYC.user_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                  <p className="text-sm">
                    {format(new Date(selectedKYC.submitted_at), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">PAN Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">PAN Number</p>
                    <code className="bg-muted px-2 py-1 rounded">{selectedKYC.pan_number}</code>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Name on PAN</p>
                    <p className="font-medium">{selectedKYC.pan_holder_name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
                    <p className="font-medium">{selectedKYC.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Holder</p>
                    <p className="font-medium">{selectedKYC.account_holder_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                    <code className="bg-muted px-2 py-1 rounded">{selectedKYC.account_number}</code>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">IFSC Code</p>
                    <code className="bg-muted px-2 py-1 rounded">{selectedKYC.ifsc_code}</code>
                  </div>
                </div>
              </div>

              {selectedKYC.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-xs text-destructive font-medium mb-1">Rejection Reason</p>
                  <p className="text-sm">{selectedKYC.rejection_reason}</p>
                </div>
              )}

              {selectedKYC.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectDialogOpen(true);
                    }}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedKYC)}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve KYC
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this KYC submission
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isProcessing}
            >
              Reject KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KYCManagement;
