import { getStripeClient } from "../_shared/stripe.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

type ProductType = "one_time" | "recurring";
interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "US$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

// Zero-decimal currencies don't need to be multiplied by 100
const ZERO_DECIMAL_CURRENCIES = ["JPY"];

interface ProductData {
  name: string;
  description: string;
  price: number;
  type: ProductType;
  currency: string;
  intervalUnit?: "days" | "weeks" | "months" | "years";
  intervalCount?: number;
}

function convertPriceToMinorUnits(price: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency.toUpperCase())) {
    return Math.round(price); // Round to ensure whole numbers for zero-decimal currencies
  }
  return Math.round(price * 100); // Convert to cents/minor units for other currencies
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      console.log("OPTIONS request received, responding with ok.");
      return new Response("ok", { headers: corsHeaders });
    }

    const formData: ProductData = await req.json();
    console.log("Received product data:", formData);
    const {
      name,
      description,
      price,
      type,
      currency,
      intervalUnit,
      intervalCount,
    } = formData;

    // Validate currency
    const upperCaseCurrency = currency.toUpperCase();
    if (!CURRENCIES.some((c) => c.code === upperCaseCurrency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const supabaseClient = getSupabaseClient();
    console.log("Supabase client initialized.");

    // Get the session or user object
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      console.error("Unauthorized access attempt or missing user data.");
      return new Response("Unauthorized", { status: 401 });
    }

    const user = userData.user;
    console.log(`User ${user.id} authenticated successfully.`);

    // Fetch the user's profile to get stripe_account_id
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData?.stripe_account_id) {
      console.error(
        "Profile not found or Stripe account ID missing for user:",
        user.id
      );
      return new Response("Stripe account not found", { status: 404 });
    }

    console.log(`Stripe account ID found: ${profileData.stripe_account_id}`);

    const stripe = getStripeClient();
    console.log("Stripe client initialized.");

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
    console.log(`Product created in Stripe with ID: ${product.id}`);

    // Convert price to appropriate minor units based on currency
    const priceInMinorUnits = convertPriceToMinorUnits(
      price,
      upperCaseCurrency
    );
    let stripePrice;

    if (type === "recurring" && intervalUnit && intervalCount) {
      stripePrice = await stripe.prices.create(
        {
          product: product.id,
          unit_amount: priceInMinorUnits,
          currency: upperCaseCurrency,
          recurring: {
            interval: intervalUnit.slice(0, -1),
            interval_count: intervalCount,
          },
        },
        {
          stripeAccount: profileData.stripe_account_id,
        }
      );
      console.log(
        `Recurring price created in Stripe with ID: ${stripePrice.id}`
      );
    } else {
      stripePrice = await stripe.prices.create(
        {
          product: product.id,
          unit_amount: priceInMinorUnits,
          currency: upperCaseCurrency,
        },
        {
          stripeAccount: profileData.stripe_account_id,
        }
      );
      console.log(
        `One-time price created in Stripe with ID: ${stripePrice.id}`
      );
    }

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
      },
      {
        stripeAccount: profileData.stripe_account_id,
      }
    );
    console.log(`Payment link created: ${paymentLink.url}`);

    const productData = {
      name,
      description,
      price,
      currency: upperCaseCurrency,
      type,
      gym_id: profileData.id,
      stripe_product_id: product.id,
      stripe_price_id: stripePrice.id,
      stripe_payment_link: paymentLink.url,
      active: true,
      // Only include interval fields for recurring products
      ...(type === "recurring"
        ? {
            interval_unit: intervalUnit,
            interval_count: intervalCount,
          }
        : {
            interval_unit: null,
            interval_count: null,
          }),
    };

    // Create product in Supabase with new schema fields
    const { data: newProduct, error } = await supabaseClient
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting product into Supabase:", error);
      throw error;
    }

    console.log(
      `Product successfully created in Supabase with ID: ${newProduct.id}`
    );

    return new Response(
      JSON.stringify({ success: true, product: newProduct }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
