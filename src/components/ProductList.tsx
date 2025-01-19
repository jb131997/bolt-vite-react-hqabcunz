import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Product } from "../types";

interface ProductListProps {
  setProducts: Dispatch<SetStateAction<Product[]>>;
  products: Product[];
}

export default function ProductList({products, setProducts}: ProductListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "membership" | "product" | "service"
  >("all");
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null); // Track loading product ID for status toggle

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
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
      setLoadingProductId(productId); // Set loading state for specific product
      const { error } = await supabase
        .from("products")
        .update({ active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;
      // Directly toggle status without refetching all products
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, active: !currentStatus }
            : product
        )
      );
    } catch (err) {
      console.error("Error toggling product status:", err);
      // Handle error state if needed
    } finally {
      setLoadingProductId(null); // Reset loading state for product
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

  console.log(products);

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
            <option value="product">Products</option>
            <option value="membership">Memberships</option>
            <option value="service">Services</option>
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

              {/* Adjusting description text handling */}
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
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.type}
                </span>
              </div>

              {/* Button for toggling product status */}
              <button
                onClick={() => toggleProductStatus(product.id, product.active)}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingProductId === product.id} // Disable button when toggling status
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
