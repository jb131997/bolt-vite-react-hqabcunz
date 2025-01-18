import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, BarChart2, DollarSign, Calendar, Users2, Settings } from 'lucide-react'

export function Sidebar() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: DollarSign, label: 'Sales', path: '/sales' },
    { icon: Calendar, label: 'Classes', path: '/classes' },
    { icon: Users2, label: 'Staff', path: '/staff' },
  ]

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Max Fitness</h1>
      </div>
      
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg mb-1 ${
              isActive(item.path)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <Link
          to="/settings"
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
            isActive('/settings')
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>
      </div>
    </div>
  )
}