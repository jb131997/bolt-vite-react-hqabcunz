import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Product } from "../types";
import { useAuth } from "../context/AuthContext";

interface ProductListProps {
  setProducts: Dispatch<SetStateAction<Product[]>>;
  products: Product[];
}

export default function ProductList({
  products,
  setProducts,
}: ProductListProps) {
  console.log(products);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "one-time" | "recurring">("all");
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("gym_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      setLoadingProductId(productId);
      const { error } = await supabase
        .from("products")
        .update({ active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, active: !currentStatus }
            : product
        )
      );
    } catch (err) {
      console.error("Error toggling product status:", err);
    } finally {
      setLoadingProductId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    filter === "all" ? true : product.type === filter
  );

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Your Products</h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="one-time">One-Time</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No products found.</p>
      ) : (
        <div className="flex gap-4 flex-wrap justify-center items-center">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-72"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    product.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>

              <p
                className={`text-sm text-gray-600 mb-2 ${
                  !product.description ? "italic" : ""
                }`}
              >
                {product.description?.length > 0
                  ? product.description
                  : "No description available."}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold text-gray-900">
                  {product.currency} {product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.type}
                </span>
              </div>

              {product.type === "recurring" && (
                <div className="text-sm text-gray-500 mb-3">
                  Every {product.interval_count} {product.interval_unit}
                </div>
              )}

              <button
              disabled={!product.stripe_payment_link || !product.active}
                onClick={() =>
                  window.open(product.stripe_payment_link, "_blank")
                }
                className="w-full px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Buy
              </button>

              <button
                onClick={() => toggleProductStatus(product.id, product.active)}
                className="w-full mt-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingProductId === product.id}
              >
                {loadingProductId === product.id ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : product.active ? (
                  "Deactivate"
                ) : (
                  "Activate"
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
