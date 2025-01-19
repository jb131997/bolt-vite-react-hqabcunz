import { getStripeClient } from "../_shared/stripe.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    const { name, description, price, type } = await req.json();

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
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData?.stripe_account_id) {
      return new Response("Stripe account not found", { status: 404 });
    }

    const stripe = getStripeClient();

    // Create product in Stripe
    const product = await stripe.products.create(
      {
        name,
        description,
      },
      {
        stripeAccount: profileData.stripe_account_id,
      }
    );

    // Create price in Stripe
    const priceInCents = price * 100
    let stripePrice;
    if (type === "subscription") {
      stripePrice = await stripe.prices.create(
        {
          product: product.id,
          unit_amount: priceInCents ,
          currency: "usd",
          recurring: { interval: "month" },
        },
        {
          stripeAccount: profileData.stripe_account_id,
        }
      );
    } else {
      stripePrice = await stripe.prices.create(
        {
          product: product.id,
          unit_amount: priceInCents,
          currency: "usd",
        },
        {
          stripeAccount: profileData.stripe_account_id,
        }
      );
    }

    // Create product in Supabase
    const { data: newProduct, error } = await supabaseClient
      .from("products")
      .insert({
        name,
        description,
        price,
        type,
        gym_id: profileData.id,
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, product: newProduct }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    conso.log("Error creating product:", error);  
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
