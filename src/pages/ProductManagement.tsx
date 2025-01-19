import { useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import { useStripe } from "../context/StripeContext";
import { Product } from "../types";

export default function ProductManagement() {
  const { stripeAccount } = useStripe();
  const [products, setProducts] = useState<Product[]>([]);

  if (!stripeAccount?.charges_enabled || !stripeAccount.payouts_enabled) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">
          Please complete your Stripe account setup first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-wrap">
        <div className="bg-white rounded-lg shadow-md p-6 flex-1 min-w-[400px]">
          <ProductForm setProducts={setProducts} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex-1 min-w-[400px]">
          <ProductList products={products} setProducts={setProducts} />
        </div>
      </div>
    </div>
  );
}
