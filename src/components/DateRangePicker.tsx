import React, { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  isOpen: boolean
  onClose: () => void
  onApply: (startDate: Date, endDate: Date) => void
  defaultStartDate?: Date
  defaultEndDate?: Date
}

const PRESET_RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 4 weeks', days: 28 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 12 months', days: 365 },
  { label: 'Month to date', type: 'month' },
  { label: 'Quarter to date', type: 'quarter' },
  { label: 'Year to date', type: 'year' },
  { label: 'All time', type: 'all' }
]

export function DateRangePicker({ isOpen, onClose, onApply, defaultStartDate, defaultEndDate }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>(defaultStartDate || new Date())
  const [endDate, setEndDate] = useState<Date>(defaultEndDate || new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')

  const handlePresetClick = (preset: { label: string; days?: number; type?: string }) => {
    const end = new Date()
    let start = new Date()

    if (preset.days) {
      start.setDate(end.getDate() - preset.days)
    } else if (preset.type === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1)
    } else if (preset.type === 'quarter') {
      const quarter = Math.floor(end.getMonth() / 3)
      start = new Date(end.getFullYear(), quarter * 3, 1)
    } else if (preset.type === 'year') {
      start = new Date(end.getFullYear(), 0, 1)
    } else if (preset.type === 'all') {
      start = new Date(2020, 0, 1) // Or your business start date
    }

    setStartDate(start)
    setEndDate(end)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getMonthDays = (date: Date) => {
    const days = []
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i))
    }
    
    return days
  }

  const handleDayClick = (date: Date) => {
    if (selecting === 'start') {
      setStartDate(date)
      setSelecting('end')
    } else {
      if (date < startDate) {
        setStartDate(date)
        setEndDate(startDate)
      } else {
        setEndDate(date)
      }
      setSelecting('start')
    }
  }

  const isDateInRange = (date: Date) => {
    return date >= startDate && date <= endDate
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
          <div className="grid grid-cols-12 gap-6">
            {/* Presets */}
            <div className="col-span-3 border-r pr-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Quick select</h3>
              <div className="space-y-2">
                {PRESET_RANGES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="col-span-9">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start</label>
                    <input
                      type="text"
                      value={formatDate(startDate)}
                      readOnly
                      className="mt-1 block w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End</label>
                    <input
                      type="text"
                      value={formatDate(endDate)}
                      readOnly
                      className="mt-1 block w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentMonth)
                      newDate.setMonth(currentMonth.getMonth() - 1)
                      setCurrentMonth(newDate)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentMonth)
                      newDate.setMonth(currentMonth.getMonth() + 1)
                      setCurrentMonth(newDate)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {[0, 1].map((offset) => {
                  const monthDate = new Date(currentMonth)
                  monthDate.setMonth(monthDate.getMonth() + offset)
                  const days = getMonthDays(monthDate)

                  return (
                    <div key={offset}>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">
                        {monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="grid grid-cols-7 gap-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                            {day}
                          </div>
                        ))}
                        {days.map((date, i) => (
                          <div key={i}>
                            {date && (
                              <button
                                onClick={() => handleDayClick(date)}
                                className={`w-full aspect-square flex items-center justify-center text-sm rounded-full
                                  ${isDateInRange(date) ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
                                  ${date.getTime() === startDate.getTime() ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                  ${date.getTime() === endDate.getTime() ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                `}
                              >
                                {date.getDate()}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onApply(startDate, endDate)
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}