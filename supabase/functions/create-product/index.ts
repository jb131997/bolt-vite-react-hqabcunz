import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { stripe } from '../_shared/stripe.ts'
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
    const { name, description, price, type, gym_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', gym_id)
      .single()

    if (profileError || !profile?.stripe_account_id) {
      throw new Error('Stripe account not found')
    }

    const product = await stripe.products.create({
      name,
      description,
    }, {
      stripeAccount: profile.stripe_account_id,
    })

    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'usd',
    }, {
      stripeAccount: profile.stripe_account_id,
    })

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        gym_id,
        name,
        description,
        price,
        type,
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id,
      })

    if (insertError) {
      throw new Error('Failed to create product')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})