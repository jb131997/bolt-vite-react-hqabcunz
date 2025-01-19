export interface User {
  id: string;
  email: string;
  full_name: string;
  gym_name?: string;
  stripe_account_id?: string;
  stripe_customer_id?: string;
}

export type ProductType = "one_time" | "recurring";
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  gym_id: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  stripe_payment_link?: string;
  type: ProductType;
  active: boolean;
  created_at: string;
  updated_at: string;
  currency: string;
  interval_unit: string | null;
  interval_count: number | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  type: ProductType;
  currency: string;
  intervalUnit?: "days" | "weeks" | "months" | "years";
  intervalCount?: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// interface ProductFormData {
//   name: string;
//   description: string;
//   price: number;
//   currency: string;
//   isRecurring: boolean;
//   billingPeriod: string;
//   customBillingNumber?: number;
//   customBillingUnit?: string;
//   type: "product" | "membership" | "service";
// }

export interface Metric {
  id?: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  gradient?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  plan: string;
  joinDate: string;
  lastVisit: string;
}
