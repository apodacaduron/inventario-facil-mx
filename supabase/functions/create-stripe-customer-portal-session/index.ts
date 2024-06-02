import Stripe from "npm:stripe@^11.16";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const { customer_id, return_url } = await request.json();

  if (!customer_id || !return_url) {
    return new Response("Bad Request", { status: 400, headers: corsHeaders });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url,
    });

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Stripe Customer Portal Session:", error);
    return new Response(error.message, { headers: corsHeaders, status: 500 });
  }
});