import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Camera, Activity, CreditCard, Calendar, Clock, Tag, Search, Filter, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Sidebar } from '../components/Sidebar'
import { ActivityLog } from '../components/ActivityLog'
import { AddNoteDialog } from '../components/AddNoteDialog'
import { UpdatePaymentDialog } from '../components/UpdatePaymentDialog'
import { EditMemberDialog } from '../components/EditMemberDialog'

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  plan: string
  created_at: string
  last_visit: string
  street: string
  city: string
  state: string
  zip_code: string
}

interface Activity {
  id: string
  type: string
  description: string
  created_at: string
  category: string
  metadata?: Record<string, any>
}

interface Note {
  id: string
  content: string
  category: string
  created_at: string
}

export function MemberProfile() {
  const { id } = useParams()
  const [member, setMember] = useState<Member | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'activities'>('overview')

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch member details
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .eq('gym_id', user.id)
          .single()

        if (memberError) throw memberError
        setMember(memberData)

        // Fetch member notes
        const { data: notesData, error: notesError } = await supabase
          .from('member_notes')
          .select('*')
          .eq('member_id', id)
          .order('created_at', { ascending: false })

        if (notesError) throw notesError
        setNotes(notesData || [])

        // Fetch activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('member_activities')
          .select('*')
          .eq('member_id', id)
          .order('created_at', { ascending: false })

        if (activitiesError) throw activitiesError
        setActivities(activitiesData || [])

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleAddNote = async (note: { content: string; category: string }) => {
    if (!id || !member) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error: noteError } = await supabase
      .from('member_notes')
      .insert({
        member_id: id,
        content: note.content,
        category: note.category,
        created_by: user.id
      })

    if (noteError) throw noteError

    // Add activity for the new note
    const { error: activityError } = await supabase
      .from('member_activities')
      .insert({
        member_id: id,
        type: 'Note',
        description: `Added a note in ${note.category}`,
        category: note.category,
        metadata: { note_content: note.content }
      })

    if (activityError) throw activityError

    // Refresh data
    const { data: newNotes } = await supabase
      .from('member_notes')
      .select('*')
      .eq('member_id', id)
      .order('created_at', { ascending: false })

    const { data: newActivities } = await supabase
      .from('member_activities')
      .select('*')
      .eq('member_id', id)
      .order('created_at', { ascending: false })

    setNotes(newNotes || [])
    setActivities(newActivities || [])
  }

  const refreshData = async () => {
    if (!id) return
    
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()

    if (!memberError && memberData) {
      setMember(memberData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error: {error || 'Member not found'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link to="/members" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Members
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {member.first_name} {member.last_name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2 inline-block" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsUpdatePaymentOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Update Payment Method
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{member.email}</p>
                  <p className="text-sm text-gray-900">{member.phone}</p>
                  <div className="pt-2">
                    <p className="text-sm text-gray-900">{member.street}</p>
                    <p className="text-sm text-gray-900">
                      {member.city}, {member.state} {member.zip_code}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Membership Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 mr-2">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">Plan: {member.plan || 'No Plan'}</p>
                  <p className="text-sm text-gray-900">
                    Last Visit: {member.last_visit ? new Date(member.last_visit).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'activities'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity Log
              </button>
            </nav>
          </div>

          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="mb-4 last:mb-0">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className={`p-1 rounded ${
                            activity.type === 'Check-in' ? 'bg-green-100' :
                            activity.type === 'Payment' ? 'bg-blue-100' :
                            activity.type === 'Note' ? 'bg-purple-100' :
                            'bg-gray-100'
                          }`}>
                            {activity.type === 'Check-in' && <Calendar className="h-4 w-4 text-green-600" />}
                            {activity.type === 'Payment' && <CreditCard className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'Note' && <Tag className="h-4 w-4 text-purple-600" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                    <button
                      onClick={() => setIsAddNoteOpen(true)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  </div>
                  {notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="mb-4 last:mb-0 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{note.content}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">{note.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                  <button
                    onClick={() => setIsAddNoteOpen(true)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
                
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500">No notes yet</p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">{note.category}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white rounded-lg shadow-sm">
                <ActivityLog activities={activities} />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddNoteDialog
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onSave={handleAddNote}
      />

      <UpdatePaymentDialog
        isOpen={isUpdatePaymentOpen}
        onClose={() => setIsUpdatePaymentOpen(false)}
        onUpdate={async (data) => {
          console.log('Update payment method:', data)
          // Implement Stripe integration here
        }}
        defaultName={`${member.first_name} ${member.last_name}`}
      />

      <EditMemberDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={refreshData}
        member={member}
      />
    </div>
  )
}