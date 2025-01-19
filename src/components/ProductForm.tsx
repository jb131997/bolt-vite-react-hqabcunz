import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import React, { Dispatch, SetStateAction, useState } from "react";
import { CURRENCIES } from "../lib/constants";
import { createProduct } from "../lib/supabase";
import { Product, ProductFormData } from "../types";

interface ProductFormProps {
  setProducts: Dispatch<SetStateAction<Product[]>>;
}

const formInitialState = {
  name: "",
  description: "",
  price: 0,
  type: "recurring",
  currency: "USD",
  intervalUnit: "months",
  intervalCount: 1,
} as const;

export default function ProductForm({ setProducts }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [billingError, setBillingError] = useState("");

  // Internal form state
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(formInitialState);

  // Billing period options
  const billingPeriods = [
    { label: "Daily", unit: "days", count: 1 },
    { label: "Weekly", unit: "weeks", count: 1 },
    { label: "Monthly", unit: "months", count: 1 },
    { label: "Every 3 months", unit: "months", count: 3 },
    { label: "Every 6 months", unit: "months", count: 6 },
    { label: "Yearly", unit: "years", count: 1 },
    { label: "Custom", unit: "custom", count: 0 },
  ];

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === formData.currency) || CURRENCIES[0];

  const validateBillingPeriod = (unit: string, count: number): boolean => {
    const startDate = new Date();
    let endDate: Date;

    // Calculate the end date based on the interval unit and count
    switch (unit) {
      case "days":
        endDate = addDays(startDate, count);
        break;
      case "weeks":
        endDate = addWeeks(startDate, count);
        break;
      case "months":
        endDate = addMonths(startDate, count);
        break;
      case "years":
        endDate = addYears(startDate, count);
        break;
      default:
        return false;
    }

    // Calculate the difference in days
    const diffInDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if the period is between 1 day and 3 years (1095 days)
    return diffInDays >= 1 && diffInDays <= 1095;
  };

  const handleBillingPeriodChange = (period: string) => {
    const selectedPeriod = billingPeriods.find((p) => p.label === period);
    if (!selectedPeriod) return;

    if (selectedPeriod.unit === "custom") {
      setIsCustomPeriod(true);
      return;
    }

    setIsCustomPeriod(false);
    const newIntervalUnit = selectedPeriod.unit as
      | "days"
      | "weeks"
      | "months"
      | "years";
    const newIntervalCount = selectedPeriod.count;

    setFormData((prev) => ({
      ...prev,
      intervalUnit: newIntervalUnit,
      intervalCount: newIntervalCount,
    }));

    if (!validateBillingPeriod(newIntervalUnit, newIntervalCount)) {
      setBillingError("Billing period must be between 1 day and 3 years");
    } else {
      setBillingError("");
    }
  };

  const handleCustomPeriodChange = (
    value: number | string,
    unit?: "days" | "weeks" | "months" | "years"
  ) => {
    const count = typeof value === "string" ? parseInt(value) : value;
    const newUnit = unit || formData.intervalUnit;

    // Always update the form state
    setFormData((prev) => ({
      ...prev,
      intervalUnit: newUnit,
      intervalCount: count,
    }));

    // Then validate and show error if needed
    if (!validateBillingPeriod(newUnit!, count)) {
      setBillingError("Billing period must be between 1 day and 3 years");
    } else {
      setBillingError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.type === "recurring" &&
      !validateBillingPeriod(formData.intervalUnit!, formData.intervalCount!)
    ) {
      setBillingError("Billing period must be between 1 day and 3 years");
      return;
    }

    console.log(formData);
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data, error } = await createProduct(formData);
      console.log({ data });
      if (error) {
        throw new Error(error || "Failed to create product");
      }
      setProducts((prev) => [data.product, ...prev]);
      setMessage({ type: "success", text: "Product created successfully!" });

      // Reset form
      setFormData(formInitialState);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to create product",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Add a product
        </h2>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Previous form fields remain the same */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <div className="text-sm text-gray-500">
              Name of the product or service, visible to customers.
            </div>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <div className="text-sm text-gray-500">
              Appears at checkout, on the customer portal, and in quotes.
            </div>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, type: "recurring" }))
              }
              className={`flex-1 py-2 px-4 rounded-md border ${
                formData.type === "recurring"
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              Recurring
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, type: "one_time" }))
              }
              className={`flex-1 py-2 px-4 rounded-md border ${
                formData.type === "one_time"
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              One-off
            </button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {selectedCurrency.symbol}
                  </span>
                </div>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full pl-12 pr-24 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="h-full py-2 pl-3 pr-8 border border-l-0 border-gray-300 rounded-r-md bg-white text-gray-700 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {formData.type === "recurring" && (
            <div className="space-y-2">
              <label
                htmlFor="billingPeriod"
                className="block text-sm font-medium text-gray-700"
              >
                Billing period
              </label>
              <select
                id="billingPeriod"
                value={
                  billingPeriods.find(
                    (p) =>
                      p.unit === formData.intervalUnit &&
                      p.count === formData.intervalCount
                  )?.label || "Custom"
                }
                onChange={(e) => handleBillingPeriodChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {billingPeriods.map((period) => (
                  <option key={period.label} value={period.label}>
                    {period.label}
                  </option>
                ))}
              </select>

              {billingError && (
                <div className="text-red-600 text-sm mt-1">{billingError}</div>
              )}

              {isCustomPeriod && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">every</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.intervalCount}
                      onChange={(e) =>
                        handleCustomPeriodChange(parseInt(e.target.value))
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={formData.intervalUnit}
                    onChange={(e) =>
                      handleCustomPeriodChange(
                        formData.intervalCount!,
                        e.target.value as "days" | "weeks" | "months" | "years"
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {["days", "weeks", "months", "years"].map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!billingError}
            className={`w-full py-3 px-4 text-white font-medium rounded-md ${
              loading || !!billingError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
