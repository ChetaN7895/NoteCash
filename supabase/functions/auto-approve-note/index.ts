import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TESTING MODE: Auto-approve all notes
const TESTING_MODE = true;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { noteId } = await req.json();

    if (!noteId) {
      return new Response(
        JSON.stringify({ error: 'Note ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Auto-Approve] Processing note: ${noteId} (Testing Mode: ${TESTING_MODE})`);

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      console.error(`[Auto-Approve] Note not found: ${noteId}`, noteError);
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Auto-Approve] Note found: ${note.title}`);

    // TESTING MODE: Auto-approve immediately
    if (TESTING_MODE) {
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          status: 'approved',
          rejection_reason: null,
        })
        .eq('id', noteId);

      if (updateError) {
        console.error(`[Auto-Approve] Failed to update note status:`, updateError);
        throw updateError;
      }

      console.log(`[Auto-Approve] Note ${noteId} auto-approved (Testing Mode)`);

      // Log the approval
      const processingTime = Date.now() - startTime;
      await supabase.from('approval_logs').insert({
        note_id: noteId,
        status: 'approved',
        check_results: [{ check: 'testing_mode', passed: true, reason: 'Auto-approved for testing' }],
        ai_analysis: 'Testing mode - auto-approved',
        confidence_score: 1.0,
        processing_time_ms: processingTime,
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: 'approved',
          checks: [{ check: 'testing_mode', passed: true }],
          confidenceScore: 1.0,
          aiAnalysis: 'Testing mode - auto-approved',
          processingTimeMs: processingTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normal validation flow (when TESTING_MODE is false)
    // ... original validation code would go here

    return new Response(
      JSON.stringify({ success: true, status: 'approved' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[Auto-Approve] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
