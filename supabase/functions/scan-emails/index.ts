import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Scan emails function started')
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No Authorization header found')
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Create supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Create regular client for user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, getting user...')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    console.log('User authenticated:', user.id)

    // Check for existing running scan
    const { data: existingScan } = await supabaseAdmin
      .from('email_scan_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'running')
      .single()

    if (existingScan) {
      console.log('Found existing running scan:', existingScan.id)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email scan already in progress',
          scanId: existingScan.id 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Clear all existing subscriptions before starting new scan
    console.log('Clearing existing subscriptions before scan...')
    const { error: clearError } = await supabaseAdmin
      .from('user_subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (clearError) {
      console.error('Error clearing existing subscriptions:', clearError)
    } else {
      console.log('Existing subscriptions cleared successfully')
    }

    // Use admin client to insert scan log (bypassing RLS)
    const { data: scanLog, error: logError } = await supabaseAdmin
      .from('email_scan_logs')
      .insert({
        user_id: user.id,
        scan_type: 'full',
        status: 'running',
        emails_processed: 0,
        subscriptions_found: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating scan log:', logError)
      return new Response(
        JSON.stringify({ error: `Failed to create scan log: ${logError.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Scan log created:', scanLog.id)

    // Start background email scanning
    const backgroundScan = scanUserEmails(user, supabaseAdmin, scanLog.id)
    
    // Don't await the background task, let it run async
    backgroundScan.catch(error => {
      console.error('Background scan error:', error)
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email scan started',
        scanId: scanLog.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Scan emails error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function refreshGmailAccessToken(refreshToken: string) {
  // Google's OAuth2 token endpoint
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
    client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error('Failed to refresh Gmail access token');
  }
  return await res.json();
}

// List of popular subscription providers and their email search queries
const PROVIDERS = [
  { name: 'Netflix', query: 'from:(netflix)' },
  { name: 'Spotify', query: 'from:(spotify)' },
  { name: 'Amazon Prime', query: 'from:(primevideo.com OR amazon.com)' },
  { name: 'Apple', query: 'from:(apple.com OR itunes.com)' },
  { name: 'Disney+', query: 'from:(disneyplus.com)' },
  { name: 'YouTube', query: 'from:(youtube.com OR google.com)' },
  { name: 'Hulu', query: 'from:(hulu.com)' },
  { name: 'HBO', query: 'from:(hbo.com OR hbomax.com)' },
  { name: 'Dropbox', query: 'from:(dropbox.com)' },
  { name: 'Microsoft', query: 'from:(microsoft.com OR office.com)' },
  // Add more as needed
];

// Helper to extract plain text from Gmail message payload
function extractBodyFromPayload(payload) {
  if (!payload) return '';
  if (payload.body && payload.body.data) {
    try {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const text = extractBodyFromPayload(part);
      if (text) return text;
    }
  }
  return '';
}

async function extractSubscriptionWithAI(emailBody, perplexityApiKey) {
  const prompt = `Extract the following details from this email about a subscription:
- Provider name
- Billing amount (with currency)
- Next billing date (if present)
- Subscription status (active/cancelled/other)

Email:
"""
${emailBody}
"""

Respond in JSON with keys: provider, billing_amount, next_billing_date, status.`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3-sonar-large-32k-online',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for extracting subscription details from emails.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 512,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Perplexity API error:', errorText);
    throw new Error('Failed to get AI extraction from Perplexity: ' + errorText);
  }
  const aiResponse = await response.json();
  let content = aiResponse.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function scanUserEmails(user, supabaseAdmin, scanLogId) {
  try {
    console.log('Starting background email scan for user:', user.id)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('gmail_access_token, gmail_refresh_token')
      .eq('id', user.id)
      .single();
    if (profileError || !profile || !profile.gmail_access_token || !profile.gmail_refresh_token) {
      throw new Error('No Gmail tokens found. Please re-authenticate with Google.');
    }
    let gmailAccessToken = profile.gmail_access_token;
    const gmailRefreshToken = profile.gmail_refresh_token;
    let subscriptionsFound = 0;
    let emailsProcessed = 0;
    const foundProviders = new Set();
    for (const provider of PROVIDERS) {
      let gmailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(provider.query)}`,
        {
          headers: {
            'Authorization': `Bearer ${gmailAccessToken}`,
          },
        }
      );
      if (gmailRes.status === 401) {
        const tokenData = await refreshGmailAccessToken(gmailRefreshToken);
        gmailAccessToken = tokenData.access_token;
        await supabaseAdmin.from('profiles').update({ gmail_access_token: gmailAccessToken }).eq('id', user.id);
        gmailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(provider.query)}`,
          {
            headers: {
              'Authorization': `Bearer ${gmailAccessToken}`,
            },
          }
        );
      }
      if (!gmailRes.ok) continue;
      const { messages } = await gmailRes.json();
      if (messages && messages.length > 0) {
        for (const msg of messages) {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
              headers: {
                'Authorization': `Bearer ${gmailAccessToken}`,
              },
            }
          );
          if (!msgRes.ok) continue;
          const msgData = await msgRes.json();
          emailsProcessed++;
          const emailBody = extractBodyFromPayload(msgData.payload);
          if (!emailBody) continue;
          // Use Perplexity AI to extract subscription details
          let aiExtracted = {};
          try {
            aiExtracted = await extractSubscriptionWithAI(emailBody, Deno.env.get('PERPLEXITY_API_KEY'));
          } catch (e) {
            console.error('Perplexity extraction failed:', e);
            continue;
          }
          if (aiExtracted && aiExtracted.provider && !foundProviders.has(aiExtracted.provider)) {
            await supabaseAdmin.from('user_subscriptions').upsert({
              user_id: user.id,
              provider: aiExtracted.provider,
              status: aiExtracted.status || 'active',
              billing_amount: aiExtracted.billing_amount || null,
              next_billing_date: aiExtracted.next_billing_date || null,
              details: emailBody.slice(0, 200),
              is_pending_review: true,
            }, { onConflict: 'user_id,provider' });
            foundProviders.add(aiExtracted.provider);
            subscriptionsFound++;
          }
        }
      }
    }
    const { error: updateError } = await supabaseAdmin
      .from('email_scan_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        emails_processed: emailsProcessed,
        subscriptions_found: subscriptionsFound,
      })
      .eq('id', scanLogId)
    if (updateError) {
      throw updateError
    }
    console.log('Email scan completed successfully - scan log updated')
  } catch (error) {
    console.error('Email scanning error:', error)
    const { error: updateError } = await supabaseAdmin
      .from('email_scan_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq('id', scanLogId)
    if (updateError) {
      console.error('Error updating failed scan log:', updateError)
    }
  }
}
