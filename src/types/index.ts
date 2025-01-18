export interface User {
  id: string
  email: string
  full_name: string
  gym_name?: string
  stripe_account_id?: string
  stripe_customer_id?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  gym_id: string
  stripe_product_id?: string
  stripe_price_id?: string
  type: 'membership' | 'service' | 'product'
  active: boolean
  created_at: string
}

export interface Metric {
  id?: string
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  color?: string
  gradient?: string
}

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  plan: string
  joinDate: string
  lastVisit: string
}