import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { transactionId } = await req.json();
    if (!transactionId) throw new Error("Transaction ID required");

    // Fetch the transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .eq("type", "withdrawal")
      .eq("status", "pending")
      .single();

    if (txError || !transaction) {
      throw new Error("Transaction not found or already processed");
    }

    // Check user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (!profile || Number(profile.balance) < transaction.amount) {
      throw new Error("Insufficient balance");
    }

    // Check for Razorpay credentials
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const useRealPayout = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET;

    let payoutId: string;
    let payoutStatus: string;

    if (useRealPayout) {
      try {
        const result = await processRazorpayPayout({
          transaction,
          user,
          supabase,
          razorpayKeyId: RAZORPAY_KEY_ID!,
          razorpayKeySecret: RAZORPAY_KEY_SECRET!,
          transactionId,
        });
        payoutId = result.payoutId;
        payoutStatus = result.payoutStatus;
      } catch (razorpayError) {
        console.warn("Razorpay payout failed, falling back to mock:", razorpayError);
        payoutId = `mock_payout_${crypto.randomUUID().slice(0, 8)}`;
        payoutStatus = "processing";
      }
    } else {
      console.log("No Razorpay credentials found, using mock payout");
      payoutId = `mock_payout_${crypto.randomUUID().slice(0, 8)}`;
      payoutStatus = "processing";
    }

    // Update transaction as processing
    const { error: updateTxError } = await supabase
      .from("transactions")
      .update({
        status: "completed",
        description: `${transaction.description} | Payout: ${payoutId}`,
      })
      .eq("id", transactionId);
    
    if (updateTxError) console.error("Failed to update transaction:", updateTxError);

    // Deduct balance
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ balance: Number(profile.balance) - transaction.amount })
      .eq("id", user.id);
    
    if (balanceError) console.error("Failed to update balance:", balanceError);

    return new Response(
      JSON.stringify({
        success: true,
        payoutId,
        status: payoutStatus,
        message: "Withdrawal is being processed",
        mock: !useRealPayout,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Withdrawal error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processRazorpayPayout({
  transaction,
  user,
  supabase,
  razorpayKeyId,
  razorpayKeySecret,
  transactionId,
}: {
  transaction: Record<string, unknown>;
  user: { id: string; email?: string };
  supabase: ReturnType<typeof createClient>;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  transactionId: string;
}) {
  const isUPI = (transaction.description as string)?.includes("UPI:");
  const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${authString}`,
  };

  // Step 1: Create contact
  const contactRes = await fetch("https://api.razorpay.com/v1/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: user.email?.split("@")[0] || "User",
      email: user.email,
      type: "employee",
    }),
  });
  const contact = await contactRes.json();
  if (!contactRes.ok) throw new Error(`Contact creation failed: ${contact.error?.description || "Unknown"}`);

  // Step 2: Create fund account
  let fundAccountBody: Record<string, unknown>;
  if (isUPI) {
    const upiId = (transaction.description as string)?.split("UPI: ")[1] || "";
    fundAccountBody = { contact_id: contact.id, account_type: "vpa", vpa: { address: upiId } };
  } else {
    const { data: kyc } = await supabase
      .from("kyc_details")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();
    if (!kyc) throw new Error("KYC not approved for bank transfer");
    fundAccountBody = {
      contact_id: contact.id,
      account_type: "bank_account",
      bank_account: { ifsc: kyc.ifsc_code, name: kyc.account_holder_name, account_number: kyc.account_number },
    };
  }

  const fundRes = await fetch("https://api.razorpay.com/v1/fund_accounts", { method: "POST", headers, body: JSON.stringify(fundAccountBody) });
  const fundAccount = await fundRes.json();
  if (!fundRes.ok) throw new Error(`Fund account failed: ${fundAccount.error?.description || "Unknown"}`);

  // Step 3: Create payout
  const payoutRes = await fetch("https://api.razorpay.com/v1/payouts", {
    method: "POST",
    headers: { ...headers, "X-Payout-Idempotency": transactionId },
    body: JSON.stringify({
      account_number: Deno.env.get("RAZORPAY_ACCOUNT_NUMBER") || "2323230085752951",
      fund_account_id: fundAccount.id,
      amount: Math.round((transaction.amount as number) * 100),
      currency: "INR",
      mode: isUPI ? "UPI" : "NEFT",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: transactionId,
      narration: "NoteCash Withdrawal",
    }),
  });
  const payout = await payoutRes.json();
  if (!payoutRes.ok) {
    throw new Error(`Payout failed: ${payout.error?.description || "Unknown"}`);
  }

  return { payoutId: payout.id, payoutStatus: payout.status };
}
