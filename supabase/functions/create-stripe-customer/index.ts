import Stripe from 'npm:stripe@^11.16';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      headers: corsHeaders,
      status: 405,
    });
  }

  const { user_id, email } = await request.json();

  if (!user_id || !email) {
    return new Response('Bad Request', { headers: corsHeaders, status: 400 });
  }

  try {
    // Search for an existing Stripe customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customer;

    if (existingCustomers.data.length > 0) {
      // Use the existing customer if found
      customer = existingCustomers.data[0];
      console.log(`Found existing Stripe customer: ${customer.id}`);
    } else {
      // Create a new Stripe customer if none exists
      customer = await stripe.customers.create({
        email,
        metadata: { user_id },
      });
      console.log(`Created new Stripe customer: ${customer.id}`);
    }

    // Update the user record in Supabase with the Stripe customer ID
    const { error } = await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user_id);

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ customer_id: customer.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling Stripe customer:', error);
    return new Response(error.message, { headers: corsHeaders, status: 500 });
  }
});
