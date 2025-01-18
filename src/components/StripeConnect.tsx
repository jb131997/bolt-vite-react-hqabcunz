import React from 'react'
import { CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { User } from '../types'

interface StripeConnectProps {
  user: User | null
  onConnect: () => void
}

export function StripeConnect({ user, onConnect }: StripeConnectProps) {
  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: { user_id: user?.id }
      })

      if (error) throw error

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url
    } catch (error) {
      console.error('Error connecting to Stripe:', error)
    }
  }

  if (!user?.gym_name) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Accept Payments</h3>
            <p className="text-sm text-gray-600">
              Connect your Stripe account to start accepting payments
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Stripe
        </button>
      </div>
    </div>
  )
}