import Stripe from 'npm:stripe';

export const getStripeClient = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

  if (!stripeKey) {
    throw new Error("Missing Stripe secret key environment variable");
  }

  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });
};
