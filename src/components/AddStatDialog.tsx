import React from 'react'
import { X } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { Metric } from '../types'

interface Category {
  name: string
  metrics: Metric[]
}

interface AddStatDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddStat: (metric: Metric, section: 'today' | 'overview') => void
  removedMetrics: Metric[]
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    name: 'Membership',
    metrics: [
      { id: 'new-leads', title: 'New Leads', value: '93', change: { value: 15, isPositive: true }, color: '#000000' },
      { id: 'churned-members', title: 'Churned Members', value: '1', change: { value: 50, isPositive: false }, color: '#000000' },
      { id: 'conversion-rate', title: 'Conversion Rate', value: '68%', change: { value: 12, isPositive: true }, color: '#000000' },
      { id: 'referrals', title: 'Referrals', value: '28', change: { value: 33, isPositive: true }, color: '#000000' }
    ]
  },
  {
    name: 'Engagement',
    metrics: [
      { id: 'class-attendees', title: 'Class Attendees', value: '32', color: '#000000' },
      { id: 'achievements', title: 'Achievements', value: '156', color: '#000000' },
      { id: 'personal-records', title: 'Personal Records', value: '47', color: '#000000' },
      { id: 'social-shares', title: 'Social Shares', value: '89', color: '#000000' }
    ]
  },
  {
    name: 'Fitness',
    metrics: [
      { id: 'avg-session', title: 'Avg. Session Length', value: '47m', color: '#000000' },
      { id: 'fitness-goals', title: 'Fitness Goals', value: '284', color: '#000000' },
      { id: 'workouts-completed', title: 'Workouts Completed', value: '1,893', color: '#000000' },
      { id: 'calories-burned', title: 'Calories Burned', value: '127k', color: '#000000' }
    ]
  },
  {
    name: 'Performance',
    metrics: [
      { id: 'retention-rate', title: 'Retention Rate', value: '89%', change: { value: 5, isPositive: true }, color: '#000000' },
      { id: 'peak-hours', title: 'Peak Hours', value: '5-7pm', color: '#000000' },
      { id: 'equipment-usage', title: 'Equipment Usage', value: '78%', change: { value: 8, isPositive: true }, color: '#000000' },
      { id: 'trainer-utilization', title: 'Trainer Utilization', value: '92%', change: { value: 3, isPositive: true }, color: '#000000' }
    ]
  }
]

export function AddStatDialog({ isOpen, onClose, onAddStat, removedMetrics }: AddStatDialogProps) {
  // Filter out metrics that are already on the dashboard
  const getAvailableMetrics = (categoryMetrics: Metric[]) => {
    return categoryMetrics.filter(metric => 
      !removedMetrics.some(removed => removed.id === metric.id)
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative w-full max-w-[90rem] bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Add Stat to Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Recently Removed Section */}
            {removedMetrics.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Removed</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {removedMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                      onClick={() => {
                        onAddStat(metric, 'today')
                        onClose()
                      }}
                    >
                      <div className="shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-shadow duration-200 rounded-lg">
                        <MetricCard {...metric} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Metrics */}
            {DEFAULT_CATEGORIES.map((category) => {
              const availableMetrics = getAvailableMetrics(category.metrics)
              if (availableMetrics.length === 0) return null

              return (
                <div key={category.name}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {availableMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                        onClick={() => {
                          onAddStat(metric, 'today')
                          onClose()
                        }}
                      >
                        <div className="shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-shadow duration-200 rounded-lg">
                          <MetricCard {...metric} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}