// Import via bare specifier thanks to the import_map.json file.
import Stripe from "npm:stripe@^11.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { user_id, email } = await request.json()
  
  if (!user_id || !email) {
    return new Response('Bad Request', { status: 400 })
  }

  try {
    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { user_id }
    })

    // Update the user record in Supabase with the Stripe customer ID
    const { error } = await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user_id)

    if (error) {
      throw new Error(error.message)
    }

    return new Response(JSON.stringify({ customer_id: customer.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return new Response(error.message, { status: 500 })
  }
})
