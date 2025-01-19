import React from "react";
import {
  ConnectNotificationBanner,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { useStripe } from "../context/StripeContext";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  const { stripeConnectInstance, loading, error } = useStripe();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700">
            Initializing...
          </h1>
          <p className="text-gray-500 mt-2">
            Please wait while we set up your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Error</h1>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance!}>
      <div className="min-h-screen bg-gray-50">
        <ConnectNotificationBanner />
        <main className="p-6">{children}</main>
      </div>
    </ConnectComponentsProvider>
  );
}
