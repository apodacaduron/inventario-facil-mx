// Import via bare specifier thanks to the import_map.json file.
import Stripe from "npm:stripe@^11.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }

  console.log(`🔔 Event received: ${receivedEvent.type} ${receivedEvent.id}`);

  switch (receivedEvent.type) {
    case "price.created": {
      const price = receivedEvent.data.object;
      await supabase
        .from("plans")
        .update({
          currency: price.currency,
          price: price.unit_amount_decimal,
          stripe_price_id: price.id,
        })
        .eq("stripe_product_id", price.product);
      break;
    }
    case "price.updated": {
      const price = receivedEvent.data.object;
      await supabase
        .from("plans")
        .update({
          currency: price.currency,
          price: price.unit_amount_decimal,
        })
        .eq("stripe_price_id", price.id);
      break;
    }
    case "product.created": {
      const product = receivedEvent.data.object;
      await supabase.from("plans").insert({
        name: product.name,
        description: product.description,
        stripe_product_id: product.id,
      });
      break;
    }
    case "product.updated": {
      const product = receivedEvent.data.object;
      await supabase
        .from("plans")
        .update({
          name: product.name,
          description: product.description,
        })
        .eq("stripe_product_id", product.id);
      break;
    }
    case "product.deleted": {
      const product = receivedEvent.data.object;
      await supabase
        .from("plans")
        .delete()
        .eq("stripe_product_id", product.id);
      break;
    }
    default:
      console.log(`Unhandled event type ${receivedEvent.type}`);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
