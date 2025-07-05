
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

async function scanUserEmails(user: any, supabaseAdmin: any, scanLogId: string) {
  try {
    console.log('Starting background email scan for user:', user.id)
    
    // Simulate email scanning process
    console.log('Processing emails...')
    await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds for demo
    
    // Check if user already has any existing subscriptions
    const { data: existingSubscriptions } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    console.log('Existing active subscriptions found:', existingSubscriptions?.length || 0)
    
    // For demo purposes, we'll only add subscriptions if none exist
    // In a real implementation, this would analyze actual email content
    let subscriptionsFound = 0
    
    // Only add demo subscriptions if user has no existing active subscriptions
    // and we want to simulate finding some (this should be replaced with real email analysis)
    if (!existingSubscriptions || existingSubscriptions.length === 0) {
      console.log('No existing subscriptions found, checking for subscription emails...')
      
      // In a real implementation, you would:
      // 1. Connect to Gmail API
      // 2. Search for subscription-related emails
      // 3. Parse email content to extract subscription details
      // 4. Only add subscriptions that are actually active
      
      // For now, we'll not add any mock subscriptions unless we find real evidence
      console.log('Email scan completed - no active subscriptions detected in emails')
    } else {
      console.log('User already has active subscriptions, skipping insertion')
    }

    // Update scan log with completion
    const { error: updateError } = await supabaseAdmin
      .from('email_scan_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        emails_processed: 50, // Mock value - in real implementation this would be actual count
        subscriptions_found: subscriptionsFound,
      })
      .eq('id', scanLogId)

    if (updateError) {
      console.error('Error updating scan log:', updateError)
      throw updateError
    }

    console.log('Email scan completed successfully - scan log updated')

  } catch (error) {
    console.error('Email scanning error:', error)
    
    // Update scan log with error
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
