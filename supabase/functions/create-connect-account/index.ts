import { getStripeClient } from "../_shared/stripe.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  try {
    // Verify the request method
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse the webhook payload
    const { record } = await req.json();
    console.log(record);
    if (!record || !record.id || !record.email) {
      return new Response("Invalid payload", { status: 400 });
    }

    const { id: userId, email } = record;

    // Initialize clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // Create the Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { supabaseUserId: userId },
    });

    // Update the `profiles` table with the Stripe Connect account ID
    const { error } = await supabase
      .from("profiles")
      .update({ stripe_account_id: account.id })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile in Supabase:", error);
      return new Response("Failed to update profile in database", {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ connectAccountId: account.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
