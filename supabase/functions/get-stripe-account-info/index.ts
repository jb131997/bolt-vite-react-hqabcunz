import { getStripeClient } from "../_shared/stripe.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    const supabaseClient = getSupabaseClient();

    // Get the session or user object
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = userData.user;

    // Fetch the user's profile to get stripe_account_id
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Stripe account not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create Stripe account session
    const stripe = getStripeClient();
    const accountSession = await stripe.accountSessions.create({
      account: profileData.stripe_account_id,
      components: {
        notification_banner: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
        account_management: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
      },
    });

    // retrieve the connect account
    const account = await stripe.accounts.retrieve(
      profileData.stripe_account_id
    );

    return new Response(
      JSON.stringify({
        clientSecret: accountSession.client_secret,
        components: accountSession.components,
        stripeAccountId: profileData.stripe_account_id,
        account,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Stripe account session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
