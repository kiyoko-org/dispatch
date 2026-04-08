import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  // CORS setup
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    // 1. Get the auth token and verify the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error("Auth Error:", userError);
      return new Response(JSON.stringify({ error: 'Unauthorized user', details: userError?.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 2. Parse request body
    const { qrData } = await req.json()
    if (!qrData) {
      return new Response(JSON.stringify({ error: 'qrData is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 3. Verify QR data with external validation service
    const verifyRes = await fetch('https://dispatch-auth.stvndvmrnd.workers.dev/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: qrData,
    })

    if (!verifyRes.ok) {
        return new Response(JSON.stringify({ error: 'Verification service unavailable or failed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }

    const verifyData = await verifyRes.json()

    if (!verifyData.isVerified || !verifyData.data?.data?.pcn) {
      return new Response(JSON.stringify({ error: 'Invalid or fraudulent ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const { pcn, first_name, last_name, middle_name, suffix, birth_date } = verifyData.data.data;

    const toTitleCase = (str: string | undefined | null): string | null => {
      if (!str) return null;
      return str
        .trim()
        .toLowerCase()
        .replace(/(?:^|[\s_-])\w/g, (match) => match.toUpperCase());
    };

    // 4. Securely Update the database using Service Role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_verified: true,
        id_card_number: pcn,
        first_name: toTitleCase(first_name),
        last_name: toTitleCase(last_name),
        middle_name: toTitleCase(middle_name),
        suffix: toTitleCase(suffix),
        birth_date: birth_date
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    console.log("--- NATIONAL ID VERIFICATION RESPONSE ---");
    console.log(JSON.stringify(verifyData.data.data, null, 2));
    
    return new Response(JSON.stringify({ success: true, pcn, debugData: verifyData.data.data }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
