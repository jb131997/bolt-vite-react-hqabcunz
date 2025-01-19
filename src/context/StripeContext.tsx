import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import Stripe from "stripe";
import { getStripeAccountSession } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { FunctionsHttpError } from "@supabase/supabase-js";

interface StripeContextType {
  stripeConnectInstance: Awaited<
    ReturnType<typeof loadConnectAndInitialize>
  > | null;
  stripeAccount: Stripe.Account | null;
  loading: boolean;
  error: string;
  reinitializeStripe: () => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

// Utility function for delay with exponential backoff
const delay = (attempt: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 8000))
  );

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<Awaited<
    ReturnType<typeof loadConnectAndInitialize>
  > | null>(null);
  const [stripeAccount, setStripeAccount] = useState<Stripe.Account | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  const initializeStripe = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let lastError;
      // Try up to 3 times
      // The reason for this is that when user signs up and immediately tries to connect their Stripe account, the account id might not be available yet
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { data, error: sessionError } = await getStripeAccountSession();

          let errorMessage = "";
          if (sessionError instanceof FunctionsHttpError) {
            const errorData = await sessionError.context.json();
            errorMessage = errorData.error;
          }

          // If there's no error or it's not a "Stripe account not found" error, break the retry loop
          if (
            !errorMessage ||
            !errorMessage.includes("Stripe account not found")
          ) {
            if (sessionError) {
              console.error("Error fetching client secret", sessionError);
              setError("Failed to initialize Stripe. Please try again later.");
              return;
            }

            if (!data) {
              setError("No data received from Stripe session.");
              return;   
            }

            setStripeAccount(data.account);

            const instance = await loadConnectAndInitialize({
              publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
              fetchClientSecret: async () => data.clientSecret,
              appearance: {
                overlays: "dialog",
                variables: {
                  colorPrimary: "#625afa",
                },
              },
            });

            setStripeConnectInstance(instance);
            return; // Success! Exit the function
          }

          lastError = sessionError;

          // If this wasn't the last attempt, wait before retrying
          if (attempt < 2) {
            await delay(attempt);
          }
        } catch (err) {
          lastError = err;
          // If this wasn't the last attempt, wait before retrying
          if (attempt < 2) {
            await delay(attempt);
          }
        }
      }

      // If we got here, all retries failed
      console.error("All retry attempts failed", lastError);
      setError(
        "Failed to initialize Stripe after multiple attempts. Please try again later."
      );
    } catch (err) {
      console.error("Error initializing Stripe", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reinitializeStripe = async () => {
    setStripeConnectInstance(null);
    setStripeAccount(null);
    setError("");
    await initializeStripe();
  };

  useEffect(() => {
    if (isAuthenticated) initializeStripe();
  }, [initializeStripe, isAuthenticated]);

  return (
    <StripeContext.Provider
      value={{
        stripeConnectInstance,
        stripeAccount,
        loading,
        error,
        reinitializeStripe,
      }}
    >
      {children}
    </StripeContext.Provider>
  );
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error("useStripe must be used within a StripeProvider");
  }
  return context;
}
