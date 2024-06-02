// Import via bare specifier thanks to the import_map.json file.
import Stripe from "npm:stripe@^11.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2024-04-10",
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

  console.log(
    `🔔 Event received: ${receivedEvent.type} ${receivedEvent.id}`,
    receivedEvent.data.object
  );

  switch (receivedEvent.type) {
    case "invoice.payment_failed": {
      const invoice = receivedEvent.data.object;
      const user = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", invoice.customer)
        .single();
      const freemiumPlanResponse = await supabase
        .from("plans")
        .select("*")
        .eq("name", "freemium")
        .single();
      await supabase.from("subscriptions").update({
        user_id: user.data.id,
        plan_id: freemiumPlanResponse.data.id,
        start_date: new Date().toISOString(),
        status: "active",
      }).eq("user_id", user.data.id);
      break;
    }
    case "invoice.paid": {
      const invoice = receivedEvent.data.object;

      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription
      );
      const user = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", invoice.customer)
        .single();
      const premiumPlanResponse = await supabase
        .from("plans")
        .select("*")
        .eq("name", "premium")
        .single();
      await supabase.from("subscriptions").update({
        user_id: user.data.id,
        plan_id: premiumPlanResponse.data.id,
        start_date: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        end_date: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_invoice_id: subscription.latest_invoice,
      }).eq("user_id", user.data.id);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = receivedEvent.data.object;
      await supabase
        .from("subscriptions")
        .update({
          start_date: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          end_date: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_invoice_id: subscription.latest_invoice,
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = receivedEvent.data.object;
      const user = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", subscription.customer)
        .single();
      const freemiumPlanResponse = await supabase
        .from("plans")
        .select("*")
        .eq("name", "freemium")
        .single();
      await supabase.from("subscriptions").update({
        user_id: user.data.id,
        plan_id: freemiumPlanResponse.data.id,
        start_date: new Date().toISOString(),
        end_date: null,
        status: "active",
        stripe_subscription_id: null,
        stripe_invoice_id: null,
      }).eq("user_id", user.data.id);
      break;
    }
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
      await supabase.from("plans").delete().eq("stripe_product_id", product.id);
      break;
    }
    default:
      console.log(`Unhandled event type ${receivedEvent.type}`);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
