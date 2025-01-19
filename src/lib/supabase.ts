import { createClient } from "@supabase/supabase-js";
import { ProductFormData } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// call the edge function to get the stripe account session
export const getStripeAccountSession = async () => {
  const resp = await supabase.functions.invoke("get-stripe-account-info", {
    method: "GET",
  });
  return resp;
};

// call the edge function to create stripe product
export const createProduct = async (product: ProductFormData) => {
  const resp = await supabase.functions.invoke("create-product", {
    body: product,
  });
  return resp;
};
