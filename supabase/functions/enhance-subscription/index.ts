
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { serviceName } = await req.json()
    
    if (!serviceName) {
      throw new Error('Service name is required')
    }

    // You would need to add your Perplexity API key to Supabase Edge Function Secrets
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a subscription service analyzer. Provide accurate, current pricing information and categorization for subscription services. Respond in JSON format only.'
          },
          {
            role: 'user',
            content: `Analyze the subscription service "${serviceName}" and provide:
            1. Official service name
            2. Current pricing plans (include monthly/yearly if available)
            3. Category (entertainment, productivity, news, utility, health, finance, education, shopping, other)
            4. Website URL
            5. Brief description
            
            Format response as JSON: {
              "name": "Official Name",
              "pricing_plans": [{"name": "Basic", "price": 9.99, "frequency": "monthly"}],
              "category": "entertainment",
              "website_url": "https://example.com",
              "description": "Brief description"
            }`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get AI analysis')
    }

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Enhancement error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
