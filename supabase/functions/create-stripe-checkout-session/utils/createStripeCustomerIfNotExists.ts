export async function createStripeCustomerIfNotExists(
  request: Request,
  supabase,
  stripe
) {
  // Get the session or user object
  const authHeader = request.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await supabase.auth.getUser(token);
  const email = data.user.email;
  const user_id = data.user.id;

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
  await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user_id);

  return {
    customer,
  };
}
