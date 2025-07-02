import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExchangeRateResponse {
  status: string;
  code: number;
  result?: {
    valute: Array<{
      ean: string;
      sifra: string;
      oznaka: string;
      naziv: string;
      kurs: {
        kup: string;
        sre: string;
        pro: string;
      };
    }>;
    date: string;
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

    // Fetch current exchange rates
    const response = await fetch(`https://api.kursna-lista.info/${apiId}/kursna_lista/json`, {
      headers: {
        'User-Agent': 'StacksFlow-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()

    if (data.status !== 'ok') {
      throw new Error(`API error: ${data.code} - ${data.msg}`)
    }

    // Extract USD and EUR rates (RSD is base currency, so rate = 1)
    const valute = data.result?.valute || []
    const usdRate = valute.find(v => v.oznaka === 'USD')
    const eurRate = valute.find(v => v.oznaka === 'EUR')

    // Convert middle rates to numbers - these represent how many RSD = 1 foreign currency
    const rates = {
      USD: usdRate ? parseFloat(usdRate.kurs.sre) : 110, // fallback
      EUR: eurRate ? parseFloat(eurRate.kurs.sre) : 120, // fallback  
      RSD: 1
    }

    return new Response(
      JSON.stringify({
        rates,
        lastUpdated: data.result?.date || new Date().toISOString(),
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
        rates: { USD: 110, EUR: 120, RSD: 1 },
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