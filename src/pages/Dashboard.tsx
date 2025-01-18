import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, ArrowUpDown, Calendar } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { MetricCard } from '../components/MetricCard'
import { AddStatDialog } from '../components/AddStatDialog'
import { DateRangePicker } from '../components/DateRangePicker'
import { supabase } from '../lib/supabase'
import { Metric } from '../types'

const DEFAULT_TODAY_METRICS: Metric[] = [
  { id: 'checkins', title: 'Check-ins', value: '0' },
  { id: 'active-members', title: 'Active members', value: '0' },
  { id: 'new-members', title: 'New members', value: '0' },
  { id: 'retention-rate', title: 'Retention rate', value: '0%' }
]

const DEFAULT_OVERVIEW_METRICS: Metric[] = [
  { id: 'checkins-overview', title: 'Check-ins', value: '0', change: { value: 0, isPositive: true } },
  { id: 'active-members-overview', title: 'Active members', value: '0', change: { value: 0, isPositive: true } },
  { id: 'new-members-overview', title: 'New members', value: '0', change: { value: 0, isPositive: true } },
  { id: 'retention-rate-overview', title: 'Retention rate', value: '0%', change: { value: 0, isPositive: true } }
]

export function Dashboard() {
  const [isAddStatOpen, setIsAddStatOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date()
  })
  const [comparison, setComparison] = useState('Previous period')
  const [todayMetrics, setTodayMetrics] = useState(DEFAULT_TODAY_METRICS)
  const [overviewMetrics, setOverviewMetrics] = useState(DEFAULT_OVERVIEW_METRICS)
  const [removedMetrics, setRemovedMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError) throw authError
        if (!session) {
          window.location.href = '/'
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/'
          return
        }

        await loadDashboardConfig(user.id)
        await loadMetrics(user.id)
      } catch (err) {
        setError('Failed to load dashboard data. Please try refreshing the page.')
        console.error('Error initializing dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [dateRange])

  const loadDashboardConfig = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_config')
        .select('*')
        .eq('gym_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        // No config found, create default
        const { error: insertError } = await supabase
          .from('dashboard_config')
          .upsert({
            gym_id: userId,
            today_metrics: todayMetrics,
            overview_metrics: overviewMetrics,
            removed_metrics: []
          })
        if (insertError) throw insertError
      } else {
        setTodayMetrics(data.today_metrics)
        setOverviewMetrics(data.overview_metrics)
        setRemovedMetrics(data.removed_metrics || [])
      }
    } catch (error) {
      console.error('Error loading dashboard config:', error)
      throw error
    }
  }

  const loadMetrics = async (userId: string) => {
    try {
      // Load today's metrics
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      const { data: todayData, error: todayError } = await supabase
        .rpc('get_gym_metrics', {
          p_gym_id: userId,
          p_start_date: todayStart.toISOString(),
          p_end_date: todayEnd.toISOString()
        })

      if (todayError) throw todayError

      // Load overview metrics for the selected date range
      const { data: overviewData, error: overviewError } = await supabase
        .rpc('get_gym_metrics', {
          p_gym_id: userId,
          p_start_date: dateRange.start.toISOString(),
          p_end_date: dateRange.end.toISOString()
        })

      if (overviewError) throw overviewError

      // Update metrics with the fetched data
      if (todayData) {
        const newTodayMetrics = todayMetrics.map(metric => {
          const updatedMetric = { ...metric }
          // Update metric values based on todayData
          return updatedMetric
        })
        setTodayMetrics(newTodayMetrics)
      }

      if (overviewData) {
        const newOverviewMetrics = overviewMetrics.map(metric => {
          const updatedMetric = { ...metric }
          // Update metric values based on overviewData
          return updatedMetric
        })
        setOverviewMetrics(newOverviewMetrics)
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
      throw error
    }
  }

  const saveDashboardConfig = async (
    newTodayMetrics: Metric[],
    newOverviewMetrics: Metric[],
    newRemovedMetrics: Metric[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('dashboard_config')
        .upsert({
          gym_id: user.id,
          today_metrics: newTodayMetrics,
          overview_metrics: newOverviewMetrics,
          removed_metrics: newRemovedMetrics
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving dashboard config:', error)
      throw error
    }
  }

  const handleRemoveStat = (metricId: string, section: 'today' | 'overview') => {
    const metrics = section === 'today' ? todayMetrics : overviewMetrics
    const removedMetric = metrics.find(m => m.id === metricId)
    
    if (removedMetric) {
      const newMetrics = metrics.filter(m => m.id !== metricId)
      const newRemovedMetrics = [...removedMetrics, removedMetric]
      
      if (section === 'today') {
        setTodayMetrics(newMetrics)
      } else {
        setOverviewMetrics(newMetrics)
      }
      
      setRemovedMetrics(newRemovedMetrics)
      saveDashboardConfig(
        section === 'today' ? newMetrics : todayMetrics,
        section === 'overview' ? newMetrics : overviewMetrics,
        newRemovedMetrics
      )
    }
  }

  const handleAddStat = (metric: Metric, section: 'today' | 'overview') => {
    const newRemovedMetrics = removedMetrics.filter(m => m.id !== metric.id)
    
    if (section === 'today') {
      const newTodayMetrics = [...todayMetrics, metric]
      setTodayMetrics(newTodayMetrics)
      setRemovedMetrics(newRemovedMetrics)
      saveDashboardConfig(newTodayMetrics, overviewMetrics, newRemovedMetrics)
    } else {
      const newOverviewMetrics = [...overviewMetrics, metric]
      setOverviewMetrics(newOverviewMetrics)
      setRemovedMetrics(newRemovedMetrics)
      saveDashboardConfig(todayMetrics, newOverviewMetrics, newRemovedMetrics)
    }
  }

  const handleDateRangeApply = (start: Date, end: Date) => {
    setDateRange({ start, end })
  }

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }
    return `${dateRange.start.toLocaleDateString('en-US', options)} - ${dateRange.end.toLocaleDateString('en-US', options)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-200 rounded w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 w-[300px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Today</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddStatOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {todayMetrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  {...metric}
                  onRemove={() => handleRemoveStat(metric.id!, 'today')}
                  onColorChange={(color, gradient) => {
                    const newMetrics = todayMetrics.map(m => 
                      m.id === metric.id ? { ...m, color, gradient } : m
                    )
                    setTodayMetrics(newMetrics)
                    saveDashboardConfig(newMetrics, overviewMetrics, removedMetrics)
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDateRange()}
                </button>
                <select
                  value={comparison}
                  onChange={(e) => setComparison(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
                >
                  <option>Previous period</option>
                  <option>Same period last year</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewMetrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  {...metric}
                  onRemove={() => handleRemoveStat(metric.id!, 'overview')}
                  onColorChange={(color, gradient) => {
                    const newMetrics = overviewMetrics.map(m => 
                      m.id === metric.id ? { ...m, color, gradient } : m
                    )
                    setOverviewMetrics(newMetrics)
                    saveDashboardConfig(todayMetrics, newMetrics, removedMetrics)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddStatDialog
        isOpen={isAddStatOpen}
        onClose={() => setIsAddStatOpen(false)}
        onAddStat={handleAddStat}
        removedMetrics={removedMetrics}
      />

      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onApply={handleDateRangeApply}
        defaultStartDate={dateRange.start}
        defaultEndDate={dateRange.end}
      />
    </div>
  )
}