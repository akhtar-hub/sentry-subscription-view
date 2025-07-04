
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Create a scan log entry
    const { data: scanLog, error: logError } = await supabaseClient
      .from('email_scan_logs')
      .insert({
        user_id: user.id,
        scan_type: 'full',
        status: 'running',
        emails_processed: 0,
        subscriptions_found: 0,
      })
      .select()
      .single()

    if (logError) throw logError

    // Start background email scanning
    EdgeRuntime.waitUntil(scanUserEmails(user, supabaseClient, scanLog.id))

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
        status: 400,
      }
    )
  }
})

async function scanUserEmails(user: any, supabaseClient: any, scanLogId: string) {
  try {
    // Get user's Gmail access token
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('gmail_access_token')
      .eq('id', user.id)
      .single()

    if (!profile?.gmail_access_token) {
      throw new Error('No Gmail access token found')
    }

    // Search for subscription-related emails using Gmail API
    const searchQueries = [
      'subscription',
      'billing',
      'invoice',
      'payment',
      'renewal',
      'auto-renewal',
      'recurring',
      'membership',
      'plan'
    ]

    let totalEmailsProcessed = 0
    let totalSubscriptionsFound = 0

    for (const query of searchQueries) {
      const gmailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query + ' in:inbox OR in:promotions OR in:updates')}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${profile.gmail_access_token}`,
          },
        }
      )

      if (!gmailResponse.ok) {
        console.error('Gmail API error:', await gmailResponse.text())
        continue
      }

      const messagesData = await gmailResponse.json()
      
      if (messagesData.messages) {
        for (const message of messagesData.messages.slice(0, 10)) { // Limit processing
          try {
            const messageResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${profile.gmail_access_token}`,
                },
              }
            )

            if (messageResponse.ok) {
              const messageData = await messageResponse.json()
              const subscription = await analyzeEmailForSubscription(messageData, supabaseClient)
              
              if (subscription) {
                // Save subscription to database
                await supabaseClient
                  .from('user_subscriptions')
                  .upsert({
                    user_id: user.id,
                    ...subscription,
                    email_source: messageData.payload?.headers?.find((h: any) => h.name === 'From')?.value,
                    is_manual: false,
                  })

                totalSubscriptionsFound++
              }
              
              totalEmailsProcessed++
            }
          } catch (err) {
            console.error('Error processing message:', err)
          }
        }
      }
    }

    // Update scan log
    await supabaseClient
      .from('email_scan_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        emails_processed: totalEmailsProcessed,
        subscriptions_found: totalSubscriptionsFound,
      })
      .eq('id', scanLogId)

    // Update user's last scan timestamp
    await supabaseClient
      .from('profiles')
      .update({ last_scan_at: new Date().toISOString() })
      .eq('id', user.id)

  } catch (error) {
    console.error('Email scanning error:', error)
    
    // Update scan log with error
    await supabaseClient
      .from('email_scan_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq('id', scanLogId)
  }
}

async function analyzeEmailForSubscription(messageData: any, supabaseClient: any) {
  try {
    const headers = messageData.payload?.headers || []
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
    const from = headers.find((h: any) => h.name === 'From')?.value || ''
    
    // Extract email body
    let body = ''
    if (messageData.payload?.body?.data) {
      body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
    } else if (messageData.payload?.parts) {
      for (const part of messageData.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
        }
      }
    }

    // Simple subscription detection patterns
    const subscriptionPatterns = [
      /subscription/i,
      /billing/i,
      /invoice/i,
      /payment.*received/i,
      /auto.*renew/i,
      /membership/i,
      /plan.*renewed/i,
    ]

    const isSubscriptionEmail = subscriptionPatterns.some(pattern => 
      pattern.test(subject) || pattern.test(body)
    )

    if (!isSubscriptionEmail) return null

    // Extract service name from sender
    const serviceName = extractServiceName(from, subject)
    if (!serviceName) return null

    // Extract cost if possible
    const cost = extractCost(body, subject)
    
    // Extract billing frequency
    const billingFrequency = extractBillingFrequency(body, subject)

    // Determine category
    const category = determineCategory(serviceName, from)

    return {
      name: serviceName,
      cost: cost,
      billing_frequency: billingFrequency,
      category: category,
      status: 'active',
    }
  } catch (error) {
    console.error('Error analyzing email:', error)
    return null
  }
}

function extractServiceName(from: string, subject: string): string | null {
  // Extract service name from email sender
  const fromMatch = from.match(/([^@<]+)@|([^<]+)</i)
  if (fromMatch) {
    const name = (fromMatch[1] || fromMatch[2]).trim()
    if (name.toLowerCase() !== 'noreply' && name.toLowerCase() !== 'no-reply') {
      return name.split(' ')[0] // Take first word
    }
  }
  
  // Fallback to subject line analysis
  const subjectWords = subject.split(' ')
  const possibleService = subjectWords.find(word => 
    word.length > 3 && /^[A-Za-z]+$/.test(word)
  )
  
  return possibleService || null
}

function extractCost(text: string): number | null {
  const costPattern = /\$(\d+(?:\.\d{2})?)/g
  const matches = text.match(costPattern)
  if (matches && matches.length > 0) {
    return parseFloat(matches[0].replace('$', ''))
  }
  return null
}

function extractBillingFrequency(text: string): string {
  const monthlyPattern = /month|monthly/i
  const yearlyPattern = /year|yearly|annual/i
  const quarterlyPattern = /quarter|quarterly/i
  
  if (yearlyPattern.test(text)) return 'yearly'
  if (quarterlyPattern.test(text)) return 'quarterly'
  if (monthlyPattern.test(text)) return 'monthly'
  
  return 'monthly' // default
}

function determineCategory(serviceName: string): string {
  const entertainmentServices = ['netflix', 'spotify', 'disney', 'hulu', 'amazon', 'youtube', 'apple', 'hbo']
  const productivityServices = ['microsoft', 'google', 'adobe', 'dropbox', 'slack', 'zoom', 'notion']
  const newsServices = ['times', 'post', 'journal', 'news', 'magazine']
  
  const name = serviceName.toLowerCase()
  
  if (entertainmentServices.some(service => name.includes(service))) return 'entertainment'
  if (productivityServices.some(service => name.includes(service))) return 'productivity'
  if (newsServices.some(service => name.includes(service))) return 'news'
  
  return 'other'
}
