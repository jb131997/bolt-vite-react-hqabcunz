import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { useNavigate } from "react-router-dom";
import { useStripe } from "../context/StripeContext";
import { useEffect } from "react";

const OnboardStripe = () => {
  const navigate = useNavigate();
  const { reinitializeStripe, stripeAccount } = useStripe();

  // if details are already submitted, navigate back to /manage-stripe
  useEffect(() => {
    if (stripeAccount?.details_submitted) navigate("/manage-stripe");
  }, [navigate, stripeAccount]);

  const handleExit = () => {
    console.log("The account has exited onboarding");
    reinitializeStripe();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Complete Stripe Onboarding
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Follow the steps below to set up your account and start accepting
          payments.
        </p>

        <ConnectAccountOnboarding
          onExit={handleExit}
          collectionOptions={{
            fields: "eventually_due",
            // futureRequirements: "include",
          }}
        />
      </div>
    </div>
  );
};

export default OnboardStripe;
