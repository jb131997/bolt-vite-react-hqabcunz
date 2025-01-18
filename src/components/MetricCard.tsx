import React, { useState } from 'react'
import { MoreVertical, Palette, X, Trash2 } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  color?: string
  gradient?: string
  onColorChange?: (color: string | null, gradient: string | null) => void
  onRemove?: () => void
}

interface ColorOption {
  color: string
  gradient?: string
}

const SOLID_COLORS: ColorOption[] = [
  { color: '#000000' }, { color: '#2C3E50' }, { color: '#34495E' }, 
  { color: '#95A5A6' }, { color: '#BDC3C7' }, { color: '#E74C3C' },
  { color: '#E57373' }, { color: '#E91E63' }, { color: '#9C27B0' }, 
  { color: '#673AB7' }, { color: '#3F51B5' }, { color: '#00BCD4' },
  { color: '#4DD0E1' }, { color: '#81D4FA' }, { color: '#64B5F6' }, 
  { color: '#4285F4' }, { color: '#1976D2' }, { color: '#4CAF50' },
  { color: '#81C784' }, { color: '#CDDC39' }, { color: '#FFEB3B' }, 
  { color: '#FFA726' }, { color: '#FF9800' }
]

const GRADIENTS: ColorOption[] = [
  { color: '#000000', gradient: 'linear-gradient(135deg, #000000, #434343)' },
  { color: '#BA8B02', gradient: 'linear-gradient(135deg, #BA8B02, #181818)' },
  { color: '#000046', gradient: 'linear-gradient(135deg, #000046, #1CB5E0)' },
  { color: '#8E9EAB', gradient: 'linear-gradient(135deg, #8E9EAB, #FFFFFF)' },
  { color: '#FFF0F0', gradient: 'linear-gradient(135deg, #FFF0F0, #FFE4E4)' },
  { color: '#E0EAFC', gradient: 'linear-gradient(135deg, #E0EAFC, #CFDEF3)' },
  { color: '#FF0844', gradient: 'linear-gradient(135deg, #FF0844, #FFB199)' },
  { color: '#8E2DE2', gradient: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' },
  { color: '#7F00FF', gradient: 'linear-gradient(135deg, #7F00FF, #E100FF)' },
  { color: '#4776E6', gradient: 'linear-gradient(135deg, #4776E6, #8E54E9)' },
  { color: '#00C6FB', gradient: 'linear-gradient(135deg, #00C6FB, #005BEA)' },
  { color: '#0093E9', gradient: 'linear-gradient(135deg, #0093E9, #80D0C7)' },
  { color: '#4CA1AF', gradient: 'linear-gradient(135deg, #4CA1AF, #2C3E50)' },
  { color: '#00B09B', gradient: 'linear-gradient(135deg, #00B09B, #96C93D)' },
  { color: '#FDC830', gradient: 'linear-gradient(135deg, #FDC830, #F37335)' },
  { color: '#FFB75E', gradient: 'linear-gradient(135deg, #FFB75E, #ED8F03)' },
  { color: '#FF9A9E', gradient: 'linear-gradient(135deg, #FF9A9E, #FAD0C4)' },
  { color: '#FF512F', gradient: 'linear-gradient(135deg, #FF512F, #DD2476)' }
]

export function MetricCard({ 
  title, 
  value, 
  change, 
  color = '#000000', 
  gradient,
  onColorChange,
  onRemove 
}: MetricCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState(color)
  const [selectedGradient, setSelectedGradient] = useState(gradient)

  const handleColorSelect = (option: ColorOption) => {
    setSelectedColor(option.color)
    setSelectedGradient(option.gradient || null)
    onColorChange?.(option.color, option.gradient || null)
    setShowColorPicker(false)
    setShowMenu(false)
  }

  const valueStyle = {
    background: selectedGradient || 'none',
    WebkitBackgroundClip: selectedGradient ? 'text' : 'unset',
    WebkitTextFillColor: selectedGradient ? 'transparent' : 'unset',
    color: !selectedGradient ? selectedColor : undefined
  }

  return (
    <div className="relative group">
      <div className="bg-white p-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {title}
          </h3>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-black/10 rounded"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-semibold" style={valueStyle}>{value}</p>
          {change && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm ${
                change.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
          )}
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-0 right-0 mt-8 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
          <button
            onClick={() => {
              setShowColorPicker(true)
              setShowMenu(false)
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Palette className="h-4 w-4 mr-2" />
            Change Color
          </button>
          <button
            onClick={() => {
              onRemove?.()
              setShowMenu(false)
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove from Dashboard
          </button>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowColorPicker(false)} />
            
            <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Choose Color</h3>
                <button onClick={() => setShowColorPicker(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Solid colors</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {SOLID_COLORS.map((option) => (
                      <button
                        key={option.color}
                        onClick={() => handleColorSelect(option)}
                        className={`w-10 h-10 rounded-full border-2 border-white ring-2 ${
                          selectedColor === option.color && !selectedGradient ? 'ring-blue-500' : 'ring-transparent'
                        } hover:ring-blue-500 transition-all duration-200`}
                        style={{ background: option.color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Gradients</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {GRADIENTS.map((option) => (
                      <button
                        key={option.gradient}
                        onClick={() => handleColorSelect(option)}
                        className={`w-10 h-10 rounded-full border-2 border-white ring-2 ${
                          selectedGradient === option.gradient ? 'ring-blue-500' : 'ring-transparent'
                        } hover:ring-blue-500 transition-all duration-200`}
                        style={{ background: option.gradient }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}