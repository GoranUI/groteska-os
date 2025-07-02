import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExchangeRateResponse {
  result?: {
    date: string;
    eur: {
      kup: string;
      sre: string;
      pro: string;
    };
    usd: {
      kup: string;
      sre: string;
      pro: string;
    };
  };
  msg?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiId = Deno.env.get('KURSNA_LISTA_API_ID')
    if (!apiId) {
      throw new Error('KURSNA_LISTA_API_ID not configured')
    }

    // Fetch current exchange rates using JSON endpoint
    const response = await fetch(`https://api.kursna-lista.info/${apiId}/kursna_lista/json`, {
      headers: {
        'User-Agent': 'StacksFlow-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()

    if (!data.result) {
      throw new Error('No result data from API')
    }

    // Extract USD and EUR "sre" (middle) rates - these represent how many RSD = 1 foreign currency
    const rates = {
      USD: data.result.usd ? parseFloat(data.result.usd.sre) : 99.32, // current fallback
      EUR: data.result.eur ? parseFloat(data.result.eur.sre) : 117.16, // current fallback  
      RSD: 1
    }

    console.log('Fetched exchange rates:', rates)

    return new Response(
      JSON.stringify({
        rates,
        lastUpdated: data.result.date || new Date().toISOString(),
        source: 'kursna-lista.info'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Return fallback rates
    return new Response(
      JSON.stringify({
        rates: { USD: 99.32, EUR: 117.16, RSD: 1 },
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 with fallback rates
      },
    )
  }
})