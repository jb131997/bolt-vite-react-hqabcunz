import { ConnectAccountManagement } from "@stripe/react-connect-js";
import { useStripe } from "../context/StripeContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ManageStripe = () => {
  const {stripeAccount} = useStripe();
  const navigate = useNavigate();

  useEffect(() => {
    if (stripeAccount?.details_submitted === false) {
      navigate("/onboard-stripe");
    }
  }, [stripeAccount, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Manage Your Stripe Account
        </h1>

        <ConnectAccountManagement />
      </div>
    </div>
  );
};

export default ManageStripe;
