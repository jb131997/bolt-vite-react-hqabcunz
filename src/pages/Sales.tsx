import { DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStripe } from "../context/StripeContext";

const Sales = () => {
  const navigate = useNavigate();
  const { stripeAccount } = useStripe();
  
  if (!stripeAccount?.charges_enabled || !stripeAccount.payouts_enabled)
    return (
      <div className="text-center max-w-2xl px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-gray-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Set up payment processing to start accepting payments
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Bill customers for one-off products or services, or set up
          subscriptions
        </p>

        <button
          className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-600 transition-colors"
          onClick={() => {
            navigate("/onboard-stripe");
          }}
        >
          Set up payments
        </button>
      </div>
    );

  return <div>Sales Page</div>;
};

export default Sales;
