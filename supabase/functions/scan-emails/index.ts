import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Optimized provider list with better search queries
const PROVIDERS = [
  { name: 'Netflix', query: 'from:netflix.com (subscription OR billing OR payment OR receipt)', domains: ['netflix.com'] },
  { name: 'Spotify', query: 'from:spotify.com (premium OR subscription OR billing OR receipt)', domains: ['spotify.com'] },
  { name: 'Amazon Prime', query: 'from:(primevideo.com OR amazon.com) (prime OR subscription OR billing)', domains: ['amazon.com', 'primevideo.com'] },
  { name: 'Apple', query: 'from:(apple.com OR itunes.com) (subscription OR billing OR receipt)', domains: ['apple.com', 'itunes.com'] },
  { name: 'Disney+', query: 'from:disneyplus.com (subscription OR billing OR receipt)', domains: ['disneyplus.com'] },
  { name: 'YouTube', query: 'from:(youtube.com OR google.com) (premium OR subscription OR billing)', domains: ['youtube.com', 'google.com'] },
  { name: 'Hulu', query: 'from:hulu.com (subscription OR billing OR receipt)', domains: ['hulu.com'] },
  { name: 'HBO', query: 'from:(hbo.com OR hbomax.com) (subscription OR billing OR receipt)', domains: ['hbo.com', 'hbomax.com'] },
  { name: 'Dropbox', query: 'from:dropbox.com (subscription OR billing OR receipt)', domains: ['dropbox.com'] },
  { name: 'Microsoft', query: 'from:(microsoft.com OR office.com) (subscription OR office365 OR billing)', domains: ['microsoft.com', 'office.com'] },
  { name: 'Adobe', query: 'from:adobe.com (subscription OR creative cloud OR billing)', domains: ['adobe.com'] },
  { name: 'Zoom', query: 'from:zoom.us (subscription OR billing OR receipt)', domains: ['zoom.us'] },
  { name: 'Slack', query: 'from:slack.com (subscription OR billing OR receipt)', domains: ['slack.com'] },
  { name: 'GitHub', query: 'from:github.com (subscription OR billing OR receipt)', domains: ['github.com'] }
];

// Configuration for optimization
const CONFIG = {
  MAX_CONCURRENT_REQUESTS: 5,
  MAX_EMAILS_PER_PROVIDER: 15,
  MAX_TOTAL_EMAILS: 100,
  BATCH_SIZE: 10,
  REQUEST_DELAY: 100, // ms between requests
  CACHE_DURATION: 3600000, // 1 hour in ms
  AI_BATCH_SIZE: 3 // Process AI extractions in batches
};

// Token refresh mutex to prevent race conditions
let tokenRefreshPromise: Promise<any> | null = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Optimized scan emails function started')
    
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

    // Clear existing subscriptions
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

    // Create scan log
    const { data: scanLog, error: logError } = await supabaseAdmin
      .from('email_scan_logs')
      .insert({
        user_id: user.id,
        scan_type: 'optimized',
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

    // Start optimized background scanning
    const backgroundScan = scanUserEmailsOptimized(user, supabaseAdmin, scanLog.id)
    
    // Don't await the background task, let it run async
    backgroundScan.catch(error => {
      console.error('Background scan error:', error)
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Optimized email scan started',
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

// Helper to extract plain text from Gmail message payload
function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';
  
  // Try to get text/plain first, then text/html
  let plainText = '';
  let htmlText = '';
  
  function extractFromPart(part: any): string {
    if (part.body?.data) {
      try {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } catch {
        return '';
      }
    }
    return '';
  }
  
  function processPart(part: any) {
    if (part.mimeType === 'text/plain') {
      const text = extractFromPart(part);
      if (text && text.length > plainText.length) {
        plainText = text;
      }
    } else if (part.mimeType === 'text/html') {
      const text = extractFromPart(part);
      if (text && text.length > htmlText.length) {
        htmlText = text;
      }
    }
    
    if (part.parts?.length) {
      for (const subPart of part.parts) {
        processPart(subPart);
      }
    }
  }
  
  processPart(payload);
  
  // Prefer plain text, fallback to HTML
  const body = plainText || htmlText;
  
  // Clean up HTML if we're using it
  if (!plainText && htmlText) {
    // Simple HTML tag removal
    return htmlText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  return body;
}

async function extractSubscriptionWithAI(emailBody, perplexityApiKey) {
  const prompt = `Extract subscription details from this email. Focus on:
- Provider/service name
- Billing amount with currency
- Next billing date
- Subscription status

Email content:
"""
${emailBody.slice(0, 2000)}
"""

Respond with JSON: {"provider": "name", "billing_amount": "amount", "next_billing_date": "date", "status": "active/cancelled"}`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'Extract subscription details from emails. Return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 256,
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

// Optimized email scanning function
async function scanUserEmailsOptimized(user: any, supabaseAdmin: any, scanLogId: string) {
  const startTime = Date.now();
  
  try {
    console.log('Starting optimized email scan for user:', user.id);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('gmail_access_token, gmail_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.gmail_access_token || !profile?.gmail_refresh_token) {
      throw new Error('No Gmail tokens found. Please re-authenticate with Google.');
    }

    let gmailAccessToken = profile.gmail_access_token;
    const gmailRefreshToken = profile.gmail_refresh_token;

    // Step 1: Fast parallel search for all providers with proper concurrency
    const providerSearchTasks = PROVIDERS.map((provider, index) => 
      () => searchProviderEmails(provider, gmailAccessToken, gmailRefreshToken, supabaseAdmin, user.id, index)
    );

    const allSearchResults = await executeConcurrently(providerSearchTasks, CONFIG.MAX_CONCURRENT_REQUESTS);
    
    // Step 2: Filter and prioritize emails
    const prioritizedEmails = prioritizeEmails(allSearchResults);
    
    // Step 3: Batch process email details
    const emailDetails = await fetchEmailDetailsBatch(prioritizedEmails, gmailAccessToken, gmailRefreshToken, supabaseAdmin, user.id);
    
    // Step 4: AI extraction in batches
    const subscriptions = await processWithAIBatch(emailDetails);
    
    // Step 5: Bulk insert subscriptions
    await bulkInsertSubscriptions(subscriptions, user.id, supabaseAdmin);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`Scan completed in ${duration}s. Found ${subscriptions.length} subscriptions from ${emailDetails.length} emails`);

    // Update scan log
    await supabaseAdmin
      .from('email_scan_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        emails_processed: emailDetails.length,
        subscriptions_found: subscriptions.length,
        duration_seconds: Math.round(duration)
      })
      .eq('id', scanLogId);

  } catch (error) {
    console.error('Optimized email scanning error:', error);
    await supabaseAdmin
      .from('email_scan_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', scanLogId);
  }
}

// Search emails for a specific provider
async function searchProviderEmails(provider: any, accessToken: string, refreshToken: string, supabaseAdmin: any, userId: string, index: number) {
  try {
    // Stagger requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, index * CONFIG.REQUEST_DELAY));
    
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(provider.query)}&maxResults=${CONFIG.MAX_EMAILS_PER_PROVIDER}`;
    
    let response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.status === 401) {
      const newToken = await refreshGmailAccessTokenSafely(refreshToken, supabaseAdmin, userId);
      accessToken = newToken.access_token;
      
      response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }

    if (!response.ok) {
      console.warn(`Failed to search emails for ${provider.name}:`, response.status);
      return { provider, messages: [] };
    }

    const data = await response.json();
    return { provider, messages: data.messages || [] };
    
  } catch (error) {
    console.error(`Error searching emails for ${provider.name}:`, error);
    return { provider, messages: [] };
  }
}

// Safe token refresh with mutex to prevent race conditions
async function refreshGmailAccessTokenSafely(refreshToken: string, supabaseAdmin: any, userId: string) {
  if (tokenRefreshPromise) {
    console.log('Token refresh already in progress, waiting...');
    return await tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    try {
      const newToken = await refreshGmailAccessToken(refreshToken);
      await supabaseAdmin.from('profiles').update({ gmail_access_token: newToken.access_token }).eq('id', userId);
      return newToken;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return await tokenRefreshPromise;
}

// Prioritize emails based on recency and relevance
function prioritizeEmails(searchResults: any[]) {
  const allEmails = [];
  
  for (const { provider, messages } of searchResults) {
    for (const message of messages) {
      allEmails.push({
        ...message,
        provider: provider.name,
        domains: provider.domains,
        priority: calculatePriority(message, provider)
      });
    }
  }
  
  // Sort by priority (higher is better) and limit total
  return allEmails
    .sort((a, b) => b.priority - a.priority)
    .slice(0, CONFIG.MAX_TOTAL_EMAILS);
}

// Calculate email priority for processing order
function calculatePriority(message: any, provider: any) {
  let priority = 100; // Base priority
  
  // Higher priority for recent emails (using internalDate if available)
  if (message.internalDate) {
    const emailDate = parseInt(message.internalDate);
    const now = Date.now();
    const daysOld = (now - emailDate) / (1000 * 60 * 60 * 24);
    priority += Math.max(0, 50 - daysOld); // Recent emails get higher priority
  } else {
    // Fallback to message ID for recency
    const messageId = parseInt(message.id, 16);
    if (messageId > 0) {
      priority += Math.min(messageId / 1000000, 50);
    }
  }
  
  // Provider-specific priority adjustments
  const highPriorityProviders = ['Netflix', 'Spotify', 'Amazon Prime', 'Apple'];
  if (highPriorityProviders.includes(provider.name)) {
    priority += 20;
  }
  
  return priority;
}

// Fetch email details in batches
async function fetchEmailDetailsBatch(emails: any[], accessToken: string, refreshToken: string, supabaseAdmin: any, userId: string) {
  const emailDetails = [];
  
  for (let i = 0; i < emails.length; i += CONFIG.BATCH_SIZE) {
    const batch = emails.slice(i, i + CONFIG.BATCH_SIZE);
    
    const batchPromises = batch.map(async (email, index) => {
      // Stagger requests within batch
      await new Promise(resolve => setTimeout(resolve, index * 50));
      return fetchEmailDetails(email, accessToken, refreshToken, supabaseAdmin, userId);
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        emailDetails.push(result.value);
      } else if (result.status === 'rejected') {
        console.error('Email detail fetch failed:', result.reason);
      }
    }
    
    // Progress update
    if (i % 20 === 0) {
      console.log(`Processed ${Math.min(i + CONFIG.BATCH_SIZE, emails.length)}/${emails.length} emails`);
    }
  }
  
  return emailDetails;
}

// Fetch individual email details
async function fetchEmailDetails(email: any, accessToken: string, refreshToken: string, supabaseAdmin: any, userId: string) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}?format=full`;
    
    let response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.status === 401) {
      const newToken = await refreshGmailAccessTokenSafely(refreshToken, supabaseAdmin, userId);
      accessToken = newToken.access_token;
      
      response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }

    if (!response.ok) return null;

    const msgData = await response.json();
    const emailBody = extractBodyFromPayload(msgData.payload);
    
    if (!emailBody || emailBody.length < 50) return null; // Skip very short emails
    
    return {
      id: email.id,
      provider: email.provider,
      domains: email.domains,
      body: emailBody,
      subject: getHeader(msgData.payload.headers, 'Subject'),
      from: getHeader(msgData.payload.headers, 'From'),
      date: getHeader(msgData.payload.headers, 'Date'),
      internalDate: msgData.internalDate
    };
    
  } catch (error) {
    console.error(`Error fetching email ${email.id}:`, error);
    return null;
  }
}

// Process emails with AI in batches
async function processWithAIBatch(emailDetails: any[]) {
  const subscriptions = [];
  const foundSubscriptions = new Set(); // Track unique subscriptions
  
  for (let i = 0; i < emailDetails.length; i += CONFIG.AI_BATCH_SIZE) {
    const batch = emailDetails.slice(i, i + CONFIG.AI_BATCH_SIZE);
    
    const batchPromises = batch.map(async (email) => {
      try {
        const aiResult = await extractSubscriptionWithAI(email.body, Deno.env.get('PERPLEXITY_API_KEY'));
        
        if (aiResult?.provider) {
          // Create unique key for deduplication
          const subscriptionKey = `${aiResult.provider}-${aiResult.billing_amount}-${aiResult.next_billing_date}`;
          
          if (!foundSubscriptions.has(subscriptionKey)) {
            foundSubscriptions.add(subscriptionKey);
            return {
              provider: aiResult.provider,
              status: aiResult.status || 'active',
              billing_amount: aiResult.billing_amount,
              next_billing_date: aiResult.next_billing_date,
              details: email.body.slice(0, 300),
              source_email_id: email.id,
              detected_from: email.from,
              confidence: calculateConfidence(email, aiResult)
            };
          }
        }
        return null;
      } catch (error) {
        console.error(`AI extraction failed for email ${email.id}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        subscriptions.push(result.value);
      } else if (result.status === 'rejected') {
        console.error('AI extraction failed:', result.reason);
      }
    }
    
    // Small delay between AI batches to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return subscriptions;
}

// Calculate confidence score for subscription detection
function calculateConfidence(email: any, aiResult: any) {
  let confidence = 0.5; // Base confidence
  
  // Email domain matches known provider domains
  if (email.domains?.some((domain: string) => email.from?.includes(domain))) {
    confidence += 0.3;
  }
  
  // Subject contains subscription keywords
  const subjectKeywords = ['subscription', 'billing', 'payment', 'invoice', 'receipt'];
  if (subjectKeywords.some(keyword => email.subject?.toLowerCase().includes(keyword))) {
    confidence += 0.2;
  }
  
  // AI provided detailed information
  if (aiResult.billing_amount && aiResult.next_billing_date) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
}

// Bulk insert subscriptions
async function bulkInsertSubscriptions(subscriptions: any[], userId: string, supabaseAdmin: any) {
  if (subscriptions.length === 0) return;
  
  const subscriptionRecords = subscriptions.map(sub => ({
    user_id: userId,
    name: sub.provider, // Map provider to name field
    status: sub.status,
    cost: sub.billing_amount ? parseFloat(sub.billing_amount) : null, // Map billing_amount to cost
    next_billing_date: sub.next_billing_date,
    email_source: sub.detected_from, // Map detected_from to email_source
    is_pending_review: sub.confidence < 0.8
  }));
  
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(subscriptionRecords, { onConflict: 'user_id,name' });
  
  if (error) {
    console.error('Error bulk inserting subscriptions:', error);
    throw error;
  }
}

// Proper concurrency control function
async function executeConcurrently(tasks: (() => Promise<any>)[], concurrency: number) {
  const results: any[] = [];
  let i = 0;
  
  async function next() {
    if (i >= tasks.length) return;
    const idx = i++;
    try {
      const result = await tasks[idx]();
      results[idx] = result;
    } catch (e) {
      console.error(`Task ${idx} failed:`, e);
      results[idx] = null;
    }
    await next();
  }
  
  await Promise.all(Array(concurrency).fill(0).map(next));
  return results.filter(Boolean);
}

// Utility functions
function getHeader(headers: any[], name: string) {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}
