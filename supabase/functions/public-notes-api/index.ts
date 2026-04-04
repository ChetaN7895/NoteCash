import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '12'), 50);
    const search = url.searchParams.get('search') || '';
    const subject = url.searchParams.get('subject') || '';
    const classLevel = url.searchParams.get('class_level') || '';
    const sortBy = url.searchParams.get('sort') || 'recent';
    const noteId = url.searchParams.get('id') || '';

    // Single note endpoint
    if (noteId) {
      const { data: note, error } = await supabase
        .from('notes')
        .select('id, title, description, subject, class_level, file_url, file_type, file_size, thumbnail_url, views_count, downloads_count, rating_avg, rating_count, is_free, price, created_at, user_id')
        .eq('id', noteId)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) throw error;
      if (!note) {
        return new Response(JSON.stringify({ error: 'Note not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch uploader profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, is_verified')
        .eq('id', note.user_id)
        .maybeSingle();

      const { user_id, ...noteData } = note;

      return new Response(JSON.stringify({
        note: {
          ...noteData,
          uploader: profile ? { name: profile.full_name, is_verified: profile.is_verified } : null,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List notes endpoint - only approved notes
    let query = supabase
      .from('notes')
      .select('id, title, description, subject, class_level, file_type, file_size, thumbnail_url, views_count, downloads_count, rating_avg, rating_count, is_free, price, created_at, user_id', { count: 'exact' })
      .eq('status', 'approved');

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`);
    }
    if (subject) {
      query = query.eq('subject', subject);
    }
    if (classLevel) {
      query = query.eq('class_level', classLevel);
    }

    switch (sortBy) {
      case 'popular':
        query = query.order('views_count', { ascending: false });
        break;
      case 'downloads':
        query = query.order('downloads_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating_avg', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: notes, error, count } = await query;
    if (error) throw error;

    // Fetch uploader profiles
    const userIds = [...new Set((notes || []).map(n => n.user_id))];
    let profileMap = new Map();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, is_verified')
        .in('id', userIds);
      profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    }

    const formattedNotes = (notes || []).map(({ user_id, ...note }) => ({
      ...note,
      uploader: profileMap.has(user_id)
        ? { name: profileMap.get(user_id).full_name, is_verified: profileMap.get(user_id).is_verified }
        : null,
    }));

    return new Response(JSON.stringify({
      notes: formattedNotes,
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Public notes API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
