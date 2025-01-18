import React, { useState } from 'react'
import { Filter, Calendar, Clock, Tag, Search } from 'lucide-react'

interface Activity {
  id: string
  type: string
  description: string
  created_at: string
  category: string
}

interface ActivityLogProps {
  activities: Activity[]
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const activityTypes = ['Check-in', 'Payment', 'Class', 'Note', 'Plan Change']
  const categories = ['Fitness', 'Classes', 'Billing', 'General']

  const filterActivities = (activities: Activity[]) => {
    return activities.filter(activity => {
      const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || activity.type === selectedType
      const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory
      
      let matchesDate = true
      if (dateRange !== 'all') {
        const activityDate = new Date(activity.created_at)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - activityDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        matchesDate = dateRange === 'today' ? diffDays <= 1 :
                     dateRange === 'week' ? diffDays <= 7 :
                     dateRange === 'month' ? diffDays <= 30 : true
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate
    })
  }

  const filteredActivities = filterActivities(activities)

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <button className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredActivities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No activities found
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {activity.type === 'Check-in' && (
                      <div className="p-1 bg-green-100 rounded">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'Payment' && (
                      <div className="p-1 bg-blue-100 rounded">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'Class' && (
                      <div className="p-1 bg-purple-100 rounded">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Tag className="h-3 w-3 mr-1" />
                        {activity.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}