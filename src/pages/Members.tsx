import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, ArrowUpDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { AddMemberDialog } from '../components/AddMemberDialog'
import { Member } from '../types'
import { supabase } from '../lib/supabase'

export function Members() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'first_name' | 'status' | 'plan' | 'created_at' | 'last_visit'>('first_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])

  const fetchMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('gym_id', user.id)
      .order(sortField, { ascending: sortDirection === 'asc' })

    if (!error && data) {
      setMembers(data.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email || '',
        phone: member.phone || '',
        status: member.status,
        plan: member.plan || 'No Plan',
        joinDate: new Date(member.created_at).toLocaleDateString(),
        lastVisit: member.last_visit ? new Date(member.last_visit).toLocaleDateString() : 'Never'
      })))
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [sortField, sortDirection])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortButton = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </button>
  )

  const handleMemberClick = (memberId: string) => {
    navigate(`/members/${memberId}`)
  }

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.phone.includes(searchQuery)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Members</h1>

          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left">
                      <SortButton field="first_name" label="Name" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="status" label="Status" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="plan" label="Plan" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="created_at" label="Join Date" />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <SortButton field="last_visit" label="Last Visit" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No members found. Add your first member to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        onClick={() => handleMemberClick(member.id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            <div className="text-sm text-gray-500">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{member.plan}</td>
                        <td className="px-6 py-4 text-gray-500">{member.joinDate}</td>
                        <td className="px-6 py-4 text-gray-500">{member.lastVisit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <AddMemberDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSuccess={() => {
              fetchMembers()
              setIsAddDialogOpen(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}