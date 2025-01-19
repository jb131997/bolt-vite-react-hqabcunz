import { ConnectAccountManagement } from "@stripe/react-connect-js";

const ManageStripe = () => {
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
