
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
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No Authorization header found')
      throw new Error('Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, getting user...')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id)

    // Create a scan log entry with proper user context
    const { data: scanLog, error: logError } = await supabaseClient
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
      throw new Error(`Failed to create scan log: ${logError.message}`)
    }

    console.log('Scan log created:', scanLog.id)

    // Start background email scanning
    const backgroundScan = scanUserEmails(user, supabaseClient, scanLog.id)
    
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
        status: 400,
      }
    )
  }
})

async function scanUserEmails(user: any, supabaseClient: any, scanLogId: string) {
  try {
    console.log('Starting background email scan for user:', user.id)
    
    // Simulate email scanning process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For now, we'll simulate finding some subscriptions
    const mockSubscriptions = [
      {
        name: 'Netflix',
        cost: 15.99,
        billing_frequency: 'monthly',
        category: 'entertainment',
        status: 'active',
      },
      {
        name: 'Spotify',
        cost: 9.99,
        billing_frequency: 'monthly',
        category: 'entertainment',
        status: 'active',
      }
    ]

    let subscriptionsFound = 0
    
    // Insert mock subscriptions
    for (const subscription of mockSubscriptions) {
      const { error: subError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          ...subscription,
          is_manual: false,
        })

      if (!subError) {
        subscriptionsFound++
      }
    }

    console.log('Subscriptions found:', subscriptionsFound)

    // Update scan log with completion
    const { error: updateError } = await supabaseClient
      .from('email_scan_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        emails_processed: 50, // Mock value
        subscriptions_found: subscriptionsFound,
      })
      .eq('id', scanLogId)

    if (updateError) {
      console.error('Error updating scan log:', updateError)
    }

    console.log('Email scan completed successfully')

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
