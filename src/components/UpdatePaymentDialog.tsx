import React, { useState } from 'react'
import { X, CreditCard } from 'lucide-react'

interface UpdatePaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: PaymentMethodData) => Promise<void>
  defaultName?: string
}

interface PaymentMethodData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  billingAddress: string
  autoRenew: boolean
}

export function UpdatePaymentDialog({ isOpen, onClose, onUpdate, defaultName }: UpdatePaymentDialogProps) {
  const [formData, setFormData] = useState<PaymentMethodData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: defaultName || '',
    billingAddress: '',
    autoRenew: true
  })
  const [loading, setLoading] = useState(false)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onUpdate(formData)
      onClose()
    } catch (error) {
      console.error('Error updating payment method:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Update Payment Method</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    cardNumber: formatCardNumber(e.target.value)
                  })}
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    expiryDate: formatExpiryDate(e.target.value)
                  })}
                  maxLength={5}
                  placeholder="MM/YY"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => setFormData({
                    ...formData,
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 3)
                  })}
                  maxLength={3}
                  placeholder="123"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cardholder Name
              </label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => setFormData({
                  ...formData,
                  cardholderName: e.target.value
                })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Billing Address
              </label>
              <textarea
                value={formData.billingAddress}
                onChange={(e) => setFormData({
                  ...formData,
                  billingAddress: e.target.value
                })}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-renew"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({
                    ...formData,
                    autoRenew: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-renew" className="ml-2 block text-sm text-gray-700">
                  Auto-renew Membership
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Payment Method'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}