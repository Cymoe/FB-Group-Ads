import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare, X, Settings, MoreHorizontal, Search, Sun, Moon } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { List } from 'react-window'
import InlinePostComposer from './components/InlinePostComposer'
import { CompanySelector } from './components/CompanySelector'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RecentPostsPanel } from './components/RecentPostsPanel'
import { Dashboard } from './pages/Dashboard'
import { calculateGroupHealth } from './utils/groupHealth'
import type { Company, Group, Post, Lead, PostType } from './types/database'

// App Context
const AppContext = createContext<{
  companies: Company[]
  groups: Group[]
  posts: Post[]
  leads: Lead[]
  loading: boolean
  selectedCompanyId: string | null
  selectedGroupId: string | null
  setSelectedCompanyId: (id: string | null) => void
  setSelectedGroupId: (id: string | null) => void
  addPost: (post: Omit<Post, 'id' | 'created_at' | 'company' | 'group'>) => Promise<void>
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>
  addGroup: (group: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  addCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  deletePost: (id: string) => Promise<void>
  isDarkMode: boolean
  toggleTheme: () => void
}>({
  companies: [],
  groups: [],
  posts: [],
  leads: [],
  loading: true,
  selectedCompanyId: null,
  selectedGroupId: null,
  setSelectedCompanyId: () => {},
  setSelectedGroupId: () => {},
  addPost: async () => {},
  updatePost: async () => {},
  addGroup: async () => {},
  updateGroup: async () => {},
  deleteGroup: async () => {},
  addCompany: async () => {},
  updateCompany: async () => {},
  deleteCompany: async () => {},
  deletePost: async () => {},
  isDarkMode: true,
  toggleTheme: () => {}
})

export const useApp = () => useContext(AppContext)

// App Provider
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [leads] = useState<Lead[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true // Default to dark mode
  })

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('light', !newTheme)
  }

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDarkMode)
  }, [isDarkMode])

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch all data on mount
  useEffect(() => {
    let isMounted = true
    const fetchAllData = async () => {
      try {
        console.log('🔄 Fetching data from MongoDB...')
        
        // Wait a bit for authentication to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('token')
        console.log('🔍 Token check:', token ? 'Token found' : 'No token')
        console.log('🔍 Token value:', token ? token.substring(0, 50) + '...' : 'null')
        if (!token) {
          console.log('❌ No authentication token found - skipping data fetch')
          if (isMounted) setLoading(false)
          return
        }

        const headers = getAuthHeaders()
        
        try {
          // Fetch companies
          const companiesResponse = await fetch('http://localhost:3001/api/companies', { headers })
          const companiesData = await companiesResponse.json()
          console.log('✅ Successfully loaded companies from MongoDB:', Array.isArray(companiesData) ? companiesData.length : 'not an array')
          if (isMounted) {
            const companiesArray = Array.isArray(companiesData) ? companiesData : []
            setCompanies(companiesArray)
            
            // Auto-select the first company if none is selected
            if (companiesArray.length > 0 && !selectedCompanyId) {
              setSelectedCompanyId(companiesArray[0].id)
              console.log('🎯 Auto-selected first company:', companiesArray[0].name)
            }
          }

      // Fetch groups
          const groupsResponse = await fetch('http://localhost:3001/api/groups', { headers })
          const groupsData = await groupsResponse.json()
          console.log('✅ Successfully loaded groups from MongoDB:', Array.isArray(groupsData) ? groupsData.length : 'not an array')
          if (isMounted) setGroups(Array.isArray(groupsData) ? groupsData : [])

          // Fetch posts
          const postsResponse = await fetch('http://localhost:3001/api/posts', { headers })
          const postsData = await postsResponse.json()
          console.log('✅ Successfully loaded posts from MongoDB:', Array.isArray(postsData) ? postsData.length : 'not an array')
          if (isMounted) setPosts(Array.isArray(postsData) ? postsData : [])

          // Leads collection removed - not needed for this application
        } catch (networkError) {
          console.error('🌐 Network error:', networkError)
          // Set empty arrays on network error
          if (isMounted) {
    setCompanies([])
    setGroups([])
            setPosts([])
          }
        }

        if (isMounted) setLoading(false)
    } catch (error) {
        console.error('❌ Error fetching data:', error)
        if (isMounted) setLoading(false)
      }
    }

    fetchAllData()
    return () => { isMounted = false }
  }, [selectedCompanyId])

  // Reset selected group when company changes or group no longer exists
  useEffect(() => {
    if (selectedGroupId) {
      const selectedGroup = groups.find(g => g.id === selectedGroupId)
      // Reset if: group doesn't exist, OR company is selected and group doesn't belong to it
      if (!selectedGroup || (selectedCompanyId && selectedGroup.company_id !== selectedCompanyId)) {
        console.log('🔄 Resetting selected group because', !selectedGroup ? 'group no longer exists' : 'company changed')
        setSelectedGroupId(null)
      }
    }
  }, [selectedCompanyId, selectedGroupId, groups])

  const addPost = async (post: Omit<Post, 'id' | 'created_at' | 'company' | 'group'>, showToast = true) => {
    try {
      // Save to MongoDB via API
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(post)
      })
      
      if (response.ok) {
        const newPost = await response.json()
        setPosts(prev => [...prev, newPost])
        if (showToast) {
          toast.success('Post created successfully! 🎉')
        }
        return newPost
      } else {
        if (showToast) {
          toast.error('Failed to save post. Please try again.')
        }
        return null
      }
    } catch (error) {
      console.error('Error adding post:', error)
      if (showToast) {
        toast.error('Something went wrong. Please try again.')
      }
      return null
    }
  }

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      // Save to MongoDB via API
      const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(prev => prev.map(p => p.id === id ? updatedPost : p))
        
        // Show appropriate success message based on status change
        if (updates.status === 'ready_to_post') {
          toast.success('Post marked as ready! ✅')
        } else if (updates.status === 'posted') {
          toast.success('Post marked as posted! 🎉')
        } else {
          toast.success('Post updated successfully!')
        }
        
        // If status was updated and involves 'posted', refresh groups to get updated posting frequency
        if (updates.status && updatedPost.group_id) {
          // Small delay to ensure server has finished updating
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const groupsResponse = await fetch('http://localhost:3001/api/groups', {
            headers: getAuthHeaders()
          })
          if (groupsResponse.ok) {
            const updatedGroups = await groupsResponse.json()
            setGroups(Array.isArray(updatedGroups) ? updatedGroups : [])
          }
        }
      } else {
        toast.error('Failed to update post. Please try again.')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const addGroup = async (group: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Save to MongoDB via API
      const response = await fetch('http://localhost:3001/api/groups', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(group)
      })
      
      if (response.ok) {
        const newGroup = await response.json()
        setGroups(prev => [...prev, newGroup])
        toast.success('Group created successfully! 🎯')
      } else {
        toast.error('Failed to create group. Please try again.')
      }
    } catch (error) {
      console.error('Error adding group:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      // Save to MongoDB via API
      const response = await fetch(`http://localhost:3001/api/groups/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedGroup = await response.json()
        setGroups(prev => prev.map(g => g.id === id ? updatedGroup : g))
        toast.success('Group updated successfully! 📊')
      } else {
        toast.error('Failed to update group. Please try again.')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      // Delete from MongoDB via API
      const response = await fetch(`http://localhost:3001/api/groups/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setGroups(prev => prev.filter(g => g.id !== id))
        toast.success('Group deleted successfully')
      } else {
        toast.error('Failed to delete group. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const addCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Save to MongoDB via API
      const response = await fetch('http://localhost:3001/api/companies', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(company)
      })
      
      if (response.ok) {
        const newCompany = await response.json()
        setCompanies(prev => [...prev, newCompany])
        toast.success('Company created successfully! 🏢')
      } else {
        toast.error('Failed to create company. Please try again.')
      }
    } catch (error) {
      console.error('Error adding company:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      // Save to MongoDB via API
      const response = await fetch(`http://localhost:3001/api/companies/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedCompany = await response.json()
        setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c))
        toast.success('Company updated successfully! 🏢')
      } else {
        toast.error('Failed to update company. Please try again.')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      // Delete from MongoDB via API
      const response = await fetch(`http://localhost:3001/api/companies/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setCompanies(prev => prev.filter(c => c.id !== id))
        toast.success('Company deleted successfully')
      } else {
        toast.error('Failed to delete company. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const deletePost = async (id: string) => {
    try {
      // Delete from MongoDB via API
      const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
    setPosts(prev => prev.filter(p => p.id !== id))
        toast.success('Post deleted successfully')
      } else {
        toast.error('Failed to delete post. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <AppContext.Provider value={{ 
      companies, 
      groups,
      posts, 
      leads, 
      loading,
      selectedCompanyId, 
      selectedGroupId,
      setSelectedCompanyId, 
      setSelectedGroupId,
      addPost, 
      updatePost, 
      addGroup,
      updateGroup,
      deleteGroup,
      addCompany,
      updateCompany,
      deleteCompany,
      deletePost, 
      isDarkMode,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Posts Page Component
const PostsPage = ({ 
  showEditGroupModal, 
  setShowEditGroupModal, 
  editingGroup, 
  setEditingGroup,
  isRecentPostsCollapsed,
  setIsRecentPostsCollapsed
}: {
  showEditGroupModal: boolean
  setShowEditGroupModal: (show: boolean) => void
  editingGroup: Group | null
  setEditingGroup: (group: Group | null) => void
  isRecentPostsCollapsed: boolean
  setIsRecentPostsCollapsed: (collapsed: boolean) => void
}) => {
  const { 
    companies, 
    groups, 
    posts, 
    selectedCompanyId, 
    selectedGroupId,
    setSelectedGroupId,
    updatePost,
    updateGroup,
    addPost,
    deletePost,
    isDarkMode
  } = useApp()
  
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null)
  const [activeStatusTab, setActiveStatusTab] = useState('draft')
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowPostMenu(null)
    if (showPostMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showPostMenu])

  // Debug modal state
  useEffect(() => {
    console.log('🐛 PostsPage - showEditGroupModal:', showEditGroupModal, 'editingGroup:', editingGroup?.name)
  }, [showEditGroupModal, editingGroup])

  const updatePostStatus = async (id: string, status: string) => {
    try {
      await updatePost(id, { status: status as any })
    } catch (error) {
      console.error('Error updating post status:', error)
    }
  }

  // Filter posts - ONLY show posts for the selected group
  const filteredPosts = selectedGroupId 
    ? posts.filter(post => post.group_id === selectedGroupId)
    : []

  // Group posts by status
  const postsByStatus = {
    draft: filteredPosts.filter(p => p.status === 'draft'),
    ready: filteredPosts.filter(p => p.status === 'ready_to_post'),
    pending: filteredPosts.filter(p => p.status === 'pending_approval'),
    posted: filteredPosts.filter(p => p.status === 'posted')
  }

  // Debug logging
  console.log('📊 Posts Debug:', {
    totalPosts: posts.length,
    filteredPosts: filteredPosts.length,
    postsByStatus: {
      draft: postsByStatus.draft.length,
      ready: postsByStatus.ready.length,
      pending: postsByStatus.pending.length,
      posted: postsByStatus.posted.length
    },
    activeTab: activeStatusTab,
    selectedCompanyId,
    selectedGroupId
  })

  // Auto-select the first tab that has posts when a group is selected (only once per group change)
  useEffect(() => {
    if (selectedGroupId) {
      // Check which tabs have posts
      const tabsWithPosts = [
        { key: 'draft', count: postsByStatus.draft.length },
        { key: 'ready', count: postsByStatus.ready.length },
        { key: 'pending', count: postsByStatus.pending.length },
        { key: 'posted', count: postsByStatus.posted.length }
      ]
      
      const firstTabWithPosts = tabsWithPosts.find(tab => tab.count > 0)
      if (firstTabWithPosts) {
        console.log('🎯 Auto-selecting tab with posts:', firstTabWithPosts.key)
        setActiveStatusTab(firstTabWithPosts.key)
      } else {
        // If no posts exist, default to draft
        setActiveStatusTab('draft')
      }
    }
  }, [selectedGroupId])

  // Post type icons and info
const postTypeIcons = {
    value_post: '💡',
  warning_post: '⚠️',
  diy_guide: '🔧',
    behind_scenes: '🎬',
    cost_saver: '💰',
    local_alert: '📍',
  personal_story: '👤',
    special_offer: '🎁',
    quick_tip: '⚡',
    myth_buster: '🔍',
  community_intro: '👋',
    feature_friday: '🎉'
}

const postTypeInfo = {
    value_post: { engagement: 85, description: 'Helpful tips and value' },
    warning_post: { engagement: 92, description: 'Important alerts' },
    diy_guide: { engagement: 78, description: 'Simple DIY tips' },
    behind_scenes: { engagement: 88, description: 'Show authenticity' },
    cost_saver: { engagement: 95, description: 'Money-saving tips' },
    local_alert: { engagement: 90, description: 'Location-specific info' },
    personal_story: { engagement: 82, description: 'Share experiences' },
    special_offer: { engagement: 98, description: 'Limited promotions' },
    quick_tip: { engagement: 75, description: 'Brief, actionable advice' },
    myth_buster: { engagement: 87, description: 'Debunk misconceptions' },
    community_intro: { engagement: 80, description: 'Introduce yourself' },
    feature_friday: { engagement: 89, description: 'Weekly highlights' }
  }

  // Calculate workflow metrics
  
  return (
    <>
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      {/* Main Content Area */}
      <div className="flex-1">
      <div className="px-6 py-6">
        <div className={`mx-auto transition-all duration-300 ${isRecentPostsCollapsed ? 'max-w-7xl' : 'max-w-6xl'}`}>
          {/* Page Header - Only show when a group is selected */}
          {selectedGroupId ? (
            <div className="mb-6">
              {/* Health Status Card with Group Name */}
              {(() => {
                const selectedGroup = groups.find(g => g.id === selectedGroupId)
                if (!selectedGroup) return null
                const health = calculateGroupHealth(selectedGroup)
                
                return (
                  <div 
                    className="p-5 rounded-lg mb-4"
                    style={{ 
                      backgroundColor: 'var(--card-bg)',
                      border: `2px dotted ${health.color}`,
                      borderLeftWidth: '4px',
                      borderLeftStyle: 'solid'
                    }}
                  >
                    {/* Group Title Header inside card */}
                    <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: `1px dotted ${health.color}40` }}>
                <div className="flex items-center gap-3">
                        {/* Status indicator dot */}
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: health.color }}
                        />
                        <div>
                  <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                          {selectedGroup.name}
                  </h1>
                          {/* Company Label */}
                          {(() => {
                            const company = companies.find(c => c.id === selectedGroup.company_id)
                            return company && (
                              <div className="text-[10px] uppercase tracking-[0.5px] mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                                {company.name}
                              </div>
                            )
                          })()}
                        </div>
              </div>
                <button
                  onClick={() => {
                          setEditingGroup(selectedGroup)
                      setShowEditGroupModal(true)
                  }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5"
                  style={{ 
                    border: '1px solid var(--border-neutral)',
                    color: 'var(--text-secondary)'
                  }}
                  title="Edit group settings"
                >
                  <Settings size={16} />
                </button>
          </div>
          
                    {/* Content - Left aligned */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base" style={{ color: health.color }}>
                            {health.status === 'safe' ? 'Safe to Post' : health.status === 'caution' ? 'Proceed with Caution' : 'High Risk'}
                          </h3>
          </div>
          
                        <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                          {health.recommendationText}
                        </p>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                            <div style={{ color: 'var(--text-secondary)' }}>This Week</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {health.postsThisWeek}/3 posts
          </div>
        </div>

                          {health.daysSinceLastPost !== null && (
              <div>
                              <div style={{ color: 'var(--text-secondary)' }}>Last Posted</div>
                              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {health.daysSinceLastPost} day{health.daysSinceLastPost !== 1 ? 's' : ''} ago
              </div>
            </div>
                          )}
                          
                          {health.nextSafePostDate && (
              <div>
                              <div style={{ color: 'var(--text-secondary)' }}>Next Safe Date</div>
                              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {health.nextSafePostDate}
              </div>
            </div>
                          )}
                          
                    <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Recommended</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {selectedGroup.recommended_frequency || 3}/week
                  </div>
                </div>
            </div>
      </div>
    </div>
  )
              })()}
        </div>
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-[#336699]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-[#336699]" />
          </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select a Facebook Group
                    </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Choose a group from the sidebar to view and manage its posts
              </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>👈 Start by selecting a group</span>
        </div>
        </div>
      </div>
          )}
          
          {/* Only show post content when a group is selected */}
          {selectedGroupId && (
            <>
        
          {/* Inline Post Composer */}
          <div className="mb-6">
            <InlinePostComposer
              companies={companies}
              groups={groups}
              selectedCompanyId={selectedCompanyId}
              selectedGroupId={selectedGroupId}
              editingPost={editingPost}
              onPostCreated={addPost}
              onPostUpdated={updatePost}
              onCancelEdit={() => setEditingPost(null)}
              isDarkMode={isDarkMode}
              isRecentPostsCollapsed={isRecentPostsCollapsed}
            />
                  </div>
          
          {/* Edit mode now handled by InlinePostComposer above */}
          
          {/* Edit Group Modal */}
          {showEditGroupModal && editingGroup && (
            <EditGroupModal
              group={editingGroup}
              onSave={(updates) => {
                updateGroup(editingGroup.id, updates)
                setShowEditGroupModal(false)
                setEditingGroup(null)
              }}
              onCancel={() => {
                setShowEditGroupModal(false)
                setEditingGroup(null)
              }}
            />
          )}
          
          {/* Debug info - moved to useEffect */}
          
            
                {/* Status Tabs - Minimal Style */}
          <div className="mb-6">
            <div className="border-b" style={{ borderColor: 'var(--border-neutral)' }}>
              <div className="flex gap-6">
                {[
                  { key: 'draft', label: 'Drafts', count: postsByStatus.draft.length },
                  { key: 'ready', label: 'Ready', count: postsByStatus.ready.length },
                  { key: 'pending', label: 'Pending Approval', count: postsByStatus.pending.length },
                  { key: 'posted', label: 'Posted', count: postsByStatus.posted.length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      data-tab={key}
                      onClick={() => setActiveStatusTab(key)}
                      className="relative px-1 pb-3 text-sm font-medium transition-colors"
                      style={{
                        color: activeStatusTab === key ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                      <span>{label}</span>
                        <span 
                          className="px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: activeStatusTab === key ? 'var(--steel-blue)' : 'var(--concrete-gray)',
                            color: activeStatusTab === key ? 'white' : 'var(--text-secondary)'
                          }}
                        >
                        {count}
                      </span>
              </div>
                      {/* Active indicator */}
                      {activeStatusTab === key && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: 'var(--steel-blue)' }}
                        />
                      )}
                    </button>
                  ))}
              </div>
            </div>
            </div>

                
            {/* Posts List */}
            <div className="space-y-3">
              {postsByStatus[activeStatusTab as keyof typeof postsByStatus].length === 0 ? (
                <div className="rounded p-12 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
                  <div className="w-16 h-16 bg-[#336699]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeStatusTab === 'draft' && <MessageSquare size={32} className="text-[#336699]" />}
                    {activeStatusTab === 'ready' && <span className="text-3xl">✅</span>}
                    {activeStatusTab === 'pending' && <span className="text-3xl">⏳</span>}
                    {activeStatusTab === 'posted' && <span className="text-3xl">🎉</span>}
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    No {activeStatusTab} posts yet
                  </h3>
                  <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    {activeStatusTab === 'draft' && 'Start creating content for your Facebook groups using the composer above'}
                    {activeStatusTab === 'ready' && 'Mark draft posts as "ready" when they\'re polished and ready to publish'}
                    {activeStatusTab === 'pending' && 'Posts awaiting approval will appear here before going live'}
                    {activeStatusTab === 'posted' && 'Successfully posted content will show up here for tracking'}
                  </p>
                  {activeStatusTab === 'draft' && (
                    <p className="text-xs px-4 py-2 rounded inline-block" style={{ backgroundColor: 'var(--concrete-gray)', color: 'var(--text-secondary)' }}>
                      💡 Tip: Use the composer above to create your first post
                    </p>
                  )}
              </div>
                  ) : (
                <>
                {postsByStatus[activeStatusTab as keyof typeof postsByStatus].map(post => (
                  <div key={post.id} id={`post-${post.id}`} className="rounded overflow-hidden transition-colors" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: 'var(--concrete-gray)' }}>
                            <span className="text-sm">{postTypeIcons[post.post_type as keyof typeof postTypeIcons]}</span>
                            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                              {post.post_type.replace(/_/g, ' ')}
                            </span>
              </div>
                          <div className="flex-1">
                            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                            {/* Company Label */}
                            {(() => {
                              const company = companies.find(c => c.id === post.company_id)
                              return company && (
                                <div className="text-[9px] uppercase tracking-[0.5px] mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                                  {company.name}
                                </div>
                              )
                            })()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide ${
                              post.status === 'draft' ? 'bg-[#9E9E9E]/20 text-[#9E9E9E]' :
                              post.status === 'ready_to_post' ? 'bg-[#336699]/20 text-[#336699]' :
                              post.status === 'pending_approval' ? 'bg-[#F9D71C]/20 text-[#F9D71C]' :
                              post.status === 'posted' ? 'bg-[#388E3C]/20 text-[#388E3C]' :
                              'bg-[#9C27B0]/20 text-[#9C27B0]'
                      }`}>
                        {post.status.replace('_', ' ')}
                      </span>
                            <div className="relative">
              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowPostMenu(showPostMenu === post.id ? null : post.id)
                                }}
                                className="p-1.5 rounded text-xs font-medium transition-colors"
                                style={{
                                  backgroundColor: isDarkMode ? '#333333' : '#F3F4F6',
                                  border: isDarkMode ? '1px solid #555555' : '1px solid #D1D5DB',
                                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#E5E7EB'
                                  e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#F3F4F6'
                                  e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                                }}
                                title="Post options"
                              >
                                <MoreHorizontal size={14} />
              </button>
                              
                              {showPostMenu === post.id && (
                                <div 
                                  className="absolute right-0 top-full mt-1 rounded shadow-2xl z-[100] min-w-[120px]"
                                  style={{ 
                                    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                                    border: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
              <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingPost(post)
                                      setShowPostMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm transition-colors"
                                    style={{ 
                                      color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                      e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent'
                                      e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPostToDelete(post)
                                      setShowPostMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:text-red-400 transition-colors"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                  >
                                    Delete
              </button>
            </div>
                              )}
              </div>
                        </div>
                      </div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'var(--text-secondary)' }}>
                          {post.content}
                        </p>
                        
                  <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-disabled)' }}>
                            {/* Engagement metrics removed - would need real Facebook API data */}
                    </div>

                          <div className="flex items-center gap-2">
                    <>
                    {(() => {
                      if (post.status === 'draft') {
                        const canAdvance = post.title?.trim() && post.content?.trim() && post.group_id
                        if (canAdvance) {
                          return (
                                    <button 
                                      onClick={() => updatePostStatus(post.id, 'ready_to_post')} 
                                      className="px-2 py-1 rounded text-xs font-medium bg-[#336699] hover:bg-[#336699]/80 text-white transition-colors border border-[#555555]"
                                    >
                                      ✓ Mark Ready
                                    </button>
                          )
                        } else {
                          const missing: string[] = []
                          if (!post.title?.trim()) missing.push('title')
                          if (!post.content?.trim()) missing.push('content')
                          if (!post.group_id) missing.push('group')
                          return (
                                    <span className="px-2 py-1 rounded text-xs bg-[#F9D71C]/20 text-[#F9D71C] font-medium">
                                      ⚠ Needs: {missing.join(', ')}
                                    </span>
                          )
                        }
                      }
                      if (post.status === 'ready_to_post') {
                          return (
                                  <button 
                                    onClick={() => updatePostStatus(post.id, 'pending_approval')} 
                                    className="px-2 py-1 rounded text-xs font-medium bg-[#F9D71C] hover:bg-[#F9D71C]/80 text-black transition-colors border border-[#555555]"
                                  >
                                    ⏳ Submit for Approval
                                  </button>
                        )
                      }
                      if (post.status === 'pending_approval') {
                          return (
                                  <button 
                                    onClick={() => updatePostStatus(post.id, 'posted')} 
                                    className="px-2 py-1 rounded text-xs font-medium bg-[#388E3C] hover:bg-[#388E3C]/80 text-white transition-colors border border-[#555555]"
                                  >
                                    ✓ Mark Posted
                                  </button>
                        )
                      }
                      if (post.status === 'posted') {
                        return (
                                  <span className="px-2 py-1 rounded text-xs bg-[#388E3C]/20 text-[#388E3C] font-medium">
                                    ✓ Posted
                                  </span>
                        )
                      }
                      return null
                    })()}
                    </>
                  </div>
                </div>
          </div>
              </div>
              ))}
              </>
            )}
                </div>
          </>
          )}
          </div>
          </div>
        </div>
    </div>

    {/* Recent Posts Sidebar - Only on Posts Page */}
    <RecentPostsPanel
      posts={posts}
      groups={groups}
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      isCollapsed={isRecentPostsCollapsed}
      onToggleCollapse={setIsRecentPostsCollapsed}
      onSelectGroup={(groupId) => {
        console.log('🎯 Selecting group from recent posts:', groupId)
        setSelectedGroupId(groupId)
      }}
    />

    {/* Delete Confirmation Modal */}
    {postToDelete && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
          <h2 className="text-lg font-medium text-white/90 mb-2">
            Delete Post?
          </h2>
          <p className="text-sm text-white/70 mb-6">
            Are you sure you want to delete "{postToDelete.title}"? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setPostToDelete(null)}
              className="px-4 py-2 bg-[#333333] hover:bg-[#2A2A2A] text-white rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deletePost(postToDelete.id)
                setPostToDelete(null)
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
            >
              Delete Post
            </button>
                    </div>
        </div>
      </div>
    )}
    </>
  )
}

// Companies Page Component
const CompaniesPage = () => {
  const { companies, addCompany, updateCompany, deleteCompany, isDarkMode } = useApp()
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [showAddCompany, setShowAddCompany] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
                    <div>
            <h1 className="text-xl font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Companies</h1>
            <p className="text-xs uppercase tracking-[0.5px]" style={{ color: 'var(--text-secondary)' }}>
              Manage Your Business Entities
                      </p>
                    </div>
                  </div>

        {/* Companies Table */}
        <div className="rounded overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead 
                style={{ 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB',
                  borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB'
                }}
              >
                <tr>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>
                    Company Name
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>
                    Service Type
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>
                    Created
                  </th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr 
                    key={company.id} 
                    className="transition-colors"
                    style={{ 
                      borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{company.name}</div>
                      {company.description && (
                        <div className="text-xs mt-1 max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                          {company.description}
                    </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {company.service_type || 'Not specified'}
                  </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {company.location || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(company.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCompany(company)}
                          className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: isDarkMode ? '#333333' : '#F3F4F6',
                            border: isDarkMode ? '1px solid #555555' : '1px solid #D1D5DB',
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#E5E7EB'
                            e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#F3F4F6'
                            e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
                          }}
                          title="Edit company"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${company.name}"?`)) {
                              deleteCompany(company.id)
                            }
                          }}
                          className="w-8 h-8 rounded flex items-center justify-center text-red-500 hover:text-red-400 transition-colors"
                          style={{
                            backgroundColor: isDarkMode ? '#333333' : '#F3F4F6',
                            border: isDarkMode ? '1px solid #555555' : '1px solid #D1D5DB'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#F3F4F6'
                          }}
                          title="Delete company"
                        >
                          <X size={14} />
                        </button>
                </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
            </div>
          
          {companies.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#336699]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                No companies yet
              </h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Create your first company to start managing Facebook groups and posting content
              </p>
              <button
                onClick={() => setShowAddCompany(true)}
                className="h-10 px-6 bg-[#336699] text-white rounded text-sm font-medium uppercase tracking-[0.5px] hover:bg-[#336699]/80 transition-colors"
              >
                Add Company
              </button>
          </div>
        )}
      </div>
    </div>

      {/* Add Company Modal */}
      {showAddCompany && (
        <AddCompanyModal
          onSave={async (companyData) => {
            await addCompany(companyData)
            setShowAddCompany(false)
          }}
          onCancel={() => setShowAddCompany(false)}
        />
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onSave={(updates) => {
            updateCompany(editingCompany.id, updates)
            setEditingCompany(null)
          }}
          onCancel={() => setEditingCompany(null)}
        />
      )}
    </div>
  )
}

// Edit Post Modal Component - Removed in favor of using InlinePostComposer for editing

// Edit Company Modal Component
const EditCompanyModal = ({ company, onSave, onCancel }: {
  company: Company
  onSave: (updates: Partial<Company>) => void
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState({
    name: company.name,
    service_type: company.service_type,
    location: company.location,
    description: company.description
  })

  const handleSave = () => {
    if (!formData.name.trim()) return
    console.log('💾 Updating company:', formData)
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="rounded p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>Edit Company</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>
              
            <div className="space-y-3">
        <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Company Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="Enter company name"
            />
        </div>

                    <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Service Type
            </label>
            <input
              type="text"
              value={formData.service_type}
              onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="e.g., Plumbing, Painting, HVAC"
            />
        </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="e.g., Midland, TX"
            />
                  </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all resize-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="Enter company description"
              rows={3}
            />
                    </div>
                    </div>

        <div className="flex items-center justify-end gap-3 pt-6">
                  <button
            onClick={onCancel}
            className="h-10 px-4 rounded text-sm font-medium uppercase tracking-[0.5px] transition-colors hover:bg-white/5"
            style={{ border: '1px solid var(--border-neutral)', color: 'var(--text-secondary)' }}
          >
            Cancel
                    </button>
              <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="h-10 px-4 bg-[#336699] text-white rounded text-sm font-medium uppercase tracking-[0.5px] hover:bg-[#336699]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
            Save Changes
                  </button>
      </div>
              </div>
              </div>
  )
}

// Add Company Modal Component
const AddCompanyModal = ({ onSave, onCancel }: {
  onSave: (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    service_type: '',
    location: '',
    description: ''
  })

  const handleSave = () => {
    if (!formData.name.trim()) return
    console.log('💾 Saving company:', formData)
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="rounded p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>Add Company</h2>
              <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-secondary)' }}
              >
            <X size={14} />
              </button>
              </div>
              
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Company Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="Enter company name"
            />
                  </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Service Type
            </label>
            <input
              type="text"
              value={formData.service_type}
              onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="e.g., Plumbing, Painting, HVAC"
            />
                  </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="e.g., Midland, TX"
            />
                  </div>

                  <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all resize-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              placeholder="Enter company description"
              rows={3}
            />
                    </div>
                    </div>

        <div className="flex items-center justify-end gap-3 pt-6">
                    <button
            onClick={onCancel}
            className="h-10 px-4 rounded text-sm font-medium uppercase tracking-[0.5px] transition-colors hover:bg-white/5"
            style={{ border: '1px solid var(--border-neutral)', color: 'var(--text-secondary)' }}
              >
            Cancel
                    </button>
              <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="h-10 px-4 bg-[#336699] text-white rounded text-sm font-medium uppercase tracking-[0.5px] hover:bg-[#336699]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
            Add Company
              </button>
            </div>
              </div>
              </div>
  )
}

// Edit Group Modal Component
const EditGroupModal = ({ group, onSave, onCancel }: {
  group: Group
  onSave: (updates: Partial<Group>) => void
  onCancel: () => void
}) => {
  console.log('🎨 EditGroupModal rendered for group:', group.name)
  const { deleteGroup } = useApp()
  
  const [formData, setFormData] = useState({
    name: group.name,
    category: group.category || '',
    tier: group.tier || 'low',
    audience_size: group.audience_size || 0,
    status: group.status,
    company_id: group.company_id || ''
  })
  
  const [isClosing, setIsClosing] = useState(false)

  const handleSave = () => {
    onSave(formData)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      await deleteGroup(group.id)
      onCancel()
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onCancel()
    }, 200) // Faster animation duration
  }

                        return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`} 
        onClick={handleClose} 
      />
      
      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 shadow-2xl z-50 transform transition-transform duration-200 ease-out ${
        isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--card-bg)', borderLeft: '1px solid var(--border-neutral)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-neutral)' }}>
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Edit Group</h2>
              <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
              >
              <X size={16} />
              </button>
            </div>
                
          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/40 transition-all"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Category
                </label>
          <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/40 transition-all"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select category...</option>
                  <option value="General">General</option>
                  <option value="Buy & Sell">Buy & Sell</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Social Learning">Social Learning</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Work">Work</option>
                  <option value="Parenting">Parenting</option>
          </select>
        </div>

        <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as 'high' | 'medium' | 'low' }))}
                  className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/40 transition-all"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                      </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Audience Size
                </label>
          <input
                  type="number"
                  value={formData.audience_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience_size: parseInt(e.target.value) || 0 }))}
                  className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/40 transition-all"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                  placeholder="Enter audience size"
          />
        </div>
        
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/40 transition-all"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                    </div>
                  </div>
                </div>

          {/* Footer */}
          <div className="p-6 border-t" style={{ borderColor: 'var(--border-neutral)' }}>
            <div className="flex items-center justify-between">
              {/* Delete Button - Left Side */}
              <button
                onClick={handleDelete}
                className="h-10 px-4 text-sm font-medium transition-colors hover:bg-red-500/10 text-red-500 rounded-lg"
              >
                Delete Group
              </button>
              
              {/* Cancel & Save - Right Side */}
              <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                  className="h-10 px-4 text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="h-10 px-4 bg-[#336699] hover:bg-[#2B5A85] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
              </div>
                </div>
          </div>
        </div>
    </div>
    </>
  )
}


// Sidebar Component
const Sidebar = ({ onAddGroup, onEditGroup }: { 
  onAddGroup: () => void, 
  onEditGroup: (group: Group) => void
}) => {
  const { companies, groups, posts, selectedCompanyId, selectedGroupId, setSelectedGroupId } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [healthFilter, setHealthFilter] = useState<'all' | 'safe' | 'caution' | 'danger'>('all')
  const navigate = useNavigate()
  const location = useLocation()

  // Debug: Log companies when they change
  useEffect(() => {
    console.log('🏢 Companies in Sidebar:', companies.length, companies.map(c => c.name))
  }, [companies])

  // Scroll to selected group when it changes
  useEffect(() => {
    if (selectedGroupId) {
      const groupElement = document.getElementById(`group-${selectedGroupId}`)
      if (groupElement) {
        console.log('📍 Scrolling to selected group in sidebar')
        groupElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedGroupId])

  // Filter groups by company, search query, and health status
  const filteredGroups = groups
    .filter(group => !selectedCompanyId || group.company_id === selectedCompanyId)
    .filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(group => {
      if (healthFilter === 'all') return true
      const health = calculateGroupHealth(group)
      return health.status === healthFilter
    })
  
  // Get smart recommendations - groups that are safe to post to
  const safeGroups = filteredGroups
    .map(group => ({ group, health: calculateGroupHealth(group) }))
    .filter(({ health }) => health.status === 'safe')
    .sort((a, b) => {
      // Sort by days since last post (descending) - groups posted to longest ago first
      const aDays = a.health.daysSinceLastPost || 999
      const bDays = b.health.daysSinceLastPost || 999
      return bDays - aDays
    })
    .slice(0, 5)

  return (
    <aside className="w-80 border-r flex flex-col overflow-hidden fixed left-0 top-[65px] bottom-0 z-10" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-neutral)' }}>
      {/* Groups Header */}
      <div className="px-3 pt-4 pb-2 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--concrete-gray)' }}>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--sidebar-text)' }}>
          GROUPS ({filteredGroups.length})
        </h3>
          <button
            onClick={onAddGroup}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#336699] hover:bg-[#336699]/80 text-white text-[11px] font-medium uppercase tracking-[0.5px] rounded transition-colors"
          >
          <MessageSquare size={12} />
          ADD
          </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full h-8 pl-9 pr-3 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/40 transition-all"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Health Status Filter */}
      <div className="px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--concrete-gray)' }}>
        <div className="flex gap-1">
          <button
            onClick={() => setHealthFilter('all')}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide rounded transition-all ${
              healthFilter === 'all' 
                ? 'bg-[#336699] text-white' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            style={{ 
              color: healthFilter === 'all' ? '#fff' : 'var(--sidebar-text-secondary)'
            }}
          >
            All
          </button>
          <button
            onClick={() => setHealthFilter('safe')}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide rounded transition-all ${
              healthFilter === 'safe' 
                ? 'bg-[#10B981] text-white' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            style={{ 
              color: healthFilter === 'safe' ? '#fff' : 'var(--sidebar-text-secondary)'
            }}
          >
            Safe
          </button>
          <button
            onClick={() => setHealthFilter('caution')}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide rounded transition-all ${
              healthFilter === 'caution' 
                ? 'bg-[#F59E0B] text-white' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            style={{ 
              color: healthFilter === 'caution' ? '#fff' : 'var(--sidebar-text-secondary)'
            }}
          >
            Caution
          </button>
          <button
            onClick={() => setHealthFilter('danger')}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide rounded transition-all ${
              healthFilter === 'danger' 
                ? 'bg-[#EF4444] text-white' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            style={{ 
              color: healthFilter === 'danger' ? '#fff' : 'var(--sidebar-text-secondary)'
            }}
          >
            Risk
          </button>
        </div>
      </div>
            
      {/* Groups List */}
      <div className="flex-1 overflow-hidden">
        {filteredGroups.length === 0 ? (
          <div className="px-3 py-12 text-center">
            <div className="w-12 h-12 bg-[#336699]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-[#336699]" />
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              {healthFilter !== 'all' 
                ? `No ${healthFilter} groups` 
                : searchQuery 
                  ? 'No groups found'
                  : selectedCompanyId 
                    ? 'No groups yet' 
                    : 'No groups found'}
            </div>
            <div className="text-xs mb-4" style={{ color: 'var(--sidebar-text-secondary)' }}>
              {healthFilter !== 'all'
                ? `No groups match the "${healthFilter}" health status`
                : searchQuery 
                  ? 'Try a different search term or clear filters'
                  : selectedCompanyId 
                    ? 'Create your first Facebook group to start posting' 
                    : 'Select a company to view its groups'}
            </div>
            {selectedCompanyId && !searchQuery && healthFilter === 'all' && (
              <button
                onClick={onAddGroup}
                className="text-xs px-3 py-1.5 rounded transition-colors"
                style={{ 
                  backgroundColor: 'var(--steel-blue)', 
                  color: 'white'
                }}
              >
                + Add Group
              </button>
            )}
          </div>
        ) : (
          <List
            defaultHeight={window.innerHeight - 300}
            rowCount={filteredGroups.length}
            rowHeight={150}
            rowProps={{}}
            rowComponent={({ index, style }) => {
              const group = filteredGroups[index]
            const isSelected = selectedGroupId === group.id
            const groupPosts = posts.filter(p => p.group_id === group.id)
            const company = companies.find(c => c.id === group.company_id)
            const health = calculateGroupHealth(group)
                                  
            return (
              <div style={style} className="px-1 py-1">
              <div
                key={group.id}
                id={`group-${group.id}`}
                onClick={() => {
                  setSelectedGroupId(group.id)
                  // Navigate to posts page if not already there
                  if (location.pathname !== '/posts') {
                    navigate('/posts')
                  }
                }}
                className={`
                    group relative px-2 py-2 rounded cursor-pointer transition-all duration-150 border-l-4
                  ${isSelected 
                    ? 'bg-[#336699]/12 border-l-[#336699]' 
                    : 'border-l-transparent hover:bg-[#336699]/5'
                  }
                `}
              >
                  {/* Health Indicator Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: health.color }}
                      title={health.message}
                    />
                  </div>

                  {/* Group Name */}
                  <div className="font-medium text-sm mb-1 transition-colors pr-8 truncate" style={{ color: 'var(--sidebar-text)' }}>
                  {group.name}
                </div>
                  
                  {/* Category and Tier Row */}
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div style={{ color: 'var(--sidebar-text-secondary)' }}>
                      {group.category || 'No category'}
                    </div>
                    
                    {group.tier && (
                      <span className={`
                        px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide
                        ${group.tier === 'high' ? 'bg-green-500/20 text-green-400' :
                          group.tier === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }
                      `}>
                        {group.tier === 'high' ? 'T1' :
                         group.tier === 'medium' ? 'T2' :
                         'T3'}
                      </span>
                    )}
                  </div>
                  
                  {/* Audience Size and Posts Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div style={{ color: 'var(--sidebar-text-secondary)' }}>
                      {group.audience_size ? `${group.audience_size.toLocaleString()} members` : 'No size data'}
                    </div>
                    
                    <div style={{ color: 'var(--sidebar-text-secondary)' }}>
                  {groupPosts.length} posts
                    </div>
                </div>
                
                  {/* Company Name */}
                {company && (
                    <div className="text-xs mt-1 transition-colors" style={{ color: 'var(--sidebar-text-disabled)' }}>
                    {company.name}
                  </div>
                )}

                  {/* Posting Health Status - Simple indicator */}
                  <div 
                    className="text-xs mt-2 px-2 py-1 rounded flex items-center gap-1.5"
                    style={{ 
                      backgroundColor: `${health.color}15`,
                      borderLeft: `2px solid ${health.color}`
                    }}
                  >
                    <span>{health.icon}</span>
                    <span style={{ color: health.color, fontSize: '11px', fontWeight: 500 }}>
                      {health.postsThisWeek} post{health.postsThisWeek !== 1 ? 's' : ''} this week
                    </span>
                  </div>
              </div>
          </div>
            )
            }}
          />
        )}
      </div>
    </aside>
  )
}

// Top Navigation Component
const TopNavigation = ({ onAddCompany }: { onAddCompany: () => void }) => {
  const { companies, groups, posts, selectedCompanyId, setSelectedCompanyId, isDarkMode, toggleTheme } = useApp()
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate contextual metrics based on selected company
  const contextualMetrics = React.useMemo(() => {
    if (selectedCompanyId) {
      // Show metrics for selected company only
      const companyGroups = groups.filter(g => g.company_id === selectedCompanyId)
      const companyPosts = posts.filter(p => p.company_id === selectedCompanyId)
      
      return {
        groupCount: companyGroups.length,
        postCount: companyPosts.length
      }
    } else {
      // When no company selected, show global metrics
      return {
        groupCount: groups.length,
        postCount: posts.length
      }
    }
  }, [selectedCompanyId, groups, posts])

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div 
      className="sticky top-0 z-40 border-b backdrop-blur-sm" 
      style={{ 
        backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
        borderColor: 'var(--border-neutral)',
        boxShadow: isDarkMode 
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left Section - Company Selector & Navigation */}
        <div className="flex items-center gap-8 h-full">
          {/* Company Selector - Compact */}
          <div className="w-64">
            <CompanySelector
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              onAddCompany={onAddCompany}
              isDarkMode={isDarkMode}
            />
          </div>
          
          {/* Navigation Tabs - Minimal with bottom border */}
          <div className="flex items-center gap-6 h-full">
          <Link 
            to="/" 
              className="relative h-full flex items-center text-sm font-medium transition-all hover:text-white/90 px-1"
            style={{ 
                color: location.pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              DASHBOARD
              {location.pathname === '/' && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--steel-blue)' }}
                />
              )}
          </Link>
          <Link 
            to="/posts" 
              className="relative h-full flex items-center text-sm font-medium transition-all hover:text-white/90 px-1"
            style={{ 
                color: location.pathname === '/posts' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              POSTS
              {location.pathname === '/posts' && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--steel-blue)' }}
                />
              )}
          </Link>
        </div>
              </div>

        {/* Right Section - Stats & User */}
        <div className="flex items-center gap-6">
          {/* Compact Stats with Labels */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></div>
              <span style={{ color: 'var(--text-primary)' }}>{contextualMetrics.groupCount}</span>
              <span style={{ color: 'var(--text-secondary)' }}>groups</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9C27B0]"></div>
              <span style={{ color: 'var(--text-primary)' }}>{contextualMetrics.postCount}</span>
              <span style={{ color: 'var(--text-secondary)' }}>posts</span>
            </div>
          </div>
          
          {/* Subtle Divider */}
          <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-neutral)' }}></div>
          
          {/* User Avatar */}
          {isAuthenticated && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-8 h-8 rounded flex items-center justify-center transition-all hover:bg-white/5"
                style={{ 
                  backgroundColor: 'var(--steel-blue)',
                  border: '1px solid var(--border-neutral)'
                }}
              >
                <span className="text-white font-medium text-xs uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-48 rounded shadow-2xl z-50"
                  style={{ 
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                    border: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB'
                  }}
                >
                  <div className="p-3 border-b" style={{ borderColor: isDarkMode ? '#333333' : '#E5E7EB' }}>
                    <p className="text-sm font-medium truncate" style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}>
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs truncate" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        navigate('/companies')
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Manage Companies
                    </button>
                    
                    <button
                      onClick={() => {
                        toggleTheme()
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun size={14} />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon size={14} />
                          <span>Dark Mode</span>
            </>
          )}
                    </button>
                    
                    <div className="my-1 border-t" style={{ borderColor: isDarkMode ? '#333333' : '#E5E7EB' }}></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm transition-colors text-red-500"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Sign Out
                    </button>
          </div>
        </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add Group Modal Component
const AddGroupModal = ({ isOpen, onClose, onEditGroup, editingGroup }: {
  isOpen: boolean
  onClose: () => void
  onEditGroup: (groupData: any) => void
  editingGroup: any
}) => {
  const { companies } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company_id: '',
    category: '',
    tier: 'medium',
    audience_size: 0
  })

  const { selectedCompanyId } = useApp()

  useEffect(() => {
    if (editingGroup) {
      setFormData({
        name: editingGroup.name || '',
        description: editingGroup.description || '',
        company_id: editingGroup.company_id || '',
        category: editingGroup.category || '',
        tier: editingGroup.tier || 'medium',
        audience_size: editingGroup.audience_size || 0
      })
      } else {
      setFormData({
        name: '',
        description: '',
        company_id: selectedCompanyId || '',
        category: '',
        tier: 'medium',
        audience_size: 0
      })
    }
  }, [editingGroup, selectedCompanyId])

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }))
    
    // Auto-assign tier based on category and audience size
    let tier = 'medium'
    if (category === 'Real Estate' || category === 'Business') {
      tier = 'high'
    } else if (category === 'Community' || category === 'Local') {
      tier = formData.audience_size > 1000 ? 'high' : 'medium'
    } else if (category === 'General' || category === 'Social') {
      tier = formData.audience_size > 2000 ? 'high' : formData.audience_size > 500 ? 'medium' : 'low'
    }
    
    setFormData(prev => ({ ...prev, tier }))
  }

  const handleAudienceSizeChange = (audience_size: number) => {
    setFormData(prev => ({ ...prev, audience_size }))
    
    // Auto-adjust tier based on audience size
    let tier = 'low'
    if (audience_size > 2000) tier = 'high'
    else if (audience_size > 500) tier = 'medium'
    
    setFormData(prev => ({ ...prev, tier }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditGroup(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="rounded p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>
            {editingGroup ? 'Edit Group' : 'Add New Group'}
          </h2>
        <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-secondary)' }}
        >
            <X size={14} />
        </button>
      </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Company Selection */}
            <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Company</label>
            {selectedCompanyId ? (
              <div className="h-10 px-3 rounded flex items-center" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {companies.find(c => c.id === selectedCompanyId)?.name || 'Selected Company'}
                </span>
              </div>
            ) : (
              <select
                value={formData.company_id}
                onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                required
              >
                <option value="">Select a company...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Group Name</label>
              <input
                type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name..."
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
                required
              />
            </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter group description..."
              rows={3}
              className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all resize-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              required
            >
              <option value="">Select a category...</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Business">Business</option>
              <option value="Community">Community</option>
              <option value="Local">Local</option>
              <option value="General">General</option>
              <option value="Social">Social</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Technology">Technology</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Parenting">Parenting</option>
              <option value="Pets">Pets</option>
              <option value="Automotive">Automotive</option>
              <option value="Home & Garden">Home & Garden</option>
            </select>
          </div>

          {/* Audience Size */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Audience Size</label>
            <input
              type="number"
              value={formData.audience_size}
              onChange={(e) => handleAudienceSizeChange(parseInt(e.target.value) || 0)}
              placeholder="Enter audience size..."
              min="0"
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          {/* Tier Display */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Tier (Auto-assigned)</label>
            <div className="h-10 px-3 rounded flex items-center" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {formData.tier.toUpperCase()} - Based on category and audience size
              </span>
            </div>
          </div>
        
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded text-sm font-medium uppercase tracking-[0.5px] transition-colors hover:bg-white/5"
              style={{ border: '1px solid var(--border-neutral)', color: 'var(--text-secondary)' }}
            >
                Cancel
              </button>
            <button
              type="submit"
              className="h-10 px-4 bg-[#336699] text-white rounded text-sm font-medium uppercase tracking-[0.5px] hover:bg-[#336699]/80 transition-colors"
            >
              {editingGroup ? 'UPDATE' : 'CREATE'}
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}

// Layout Component
const Layout = ({ 
  showEditGroupModal, 
  setShowEditGroupModal, 
  editingGroup, 
  setEditingGroup
}: {
  showEditGroupModal: boolean
  setShowEditGroupModal: (show: boolean) => void
  editingGroup: Group | null
  setEditingGroup: (group: Group | null) => void
}) => {
  // ✅ ALL HOOKS MUST BE AT THE TOP (before any returns)
  const { addGroup, updateGroup, addCompany, updateCompany, loading, posts, groups, selectedCompanyId, setSelectedGroupId } = useApp()
  const location = useLocation()
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showEditCompany, setShowEditCompany] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  
  // Recent Posts Panel collapse state
  const [isRecentPostsCollapsed, setIsRecentPostsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('recentPostsPanelCollapsed')
    return saved === 'true'
  })

  const isPostsPage = location.pathname === '/posts'

  const handleAddGroup = () => {
    setEditingGroup(null)
    setShowAddGroup(true)
  }

  const handleAddCompany = () => {
    setShowAddCompany(true)
  }


  const handleEditGroup = async (groupData: any) => {
    if (editingGroup) {
      // Update existing group
      await updateGroup(editingGroup.id, groupData)
    } else {
      // Create new group
      await addGroup(groupData)
    }
    setShowAddGroup(false)
    setEditingGroup(null)
  }

  if (loading) {
  return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--carbon-black)' }}>
        <div className="flex flex-col items-center gap-6">
          {/* Logo/Brand Area */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#336699] to-[#2B5A85] rounded-lg flex items-center justify-center shadow-lg">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>FB Group Ads Manager</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Construction Industry Edition</p>
          </div>
        </div>
        
          {/* Modern Loading Spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-4 rounded-full" style={{ borderColor: 'var(--border-neutral)' }}></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#336699] border-t-transparent rounded-full animate-spin"></div>
              </div>

          {/* Loading Text */}
          <div className="text-center">
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Setting up your workspace</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading companies and groups...</div>
            </div>

          {/* Progress Dots */}
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#336699] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#336699] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#336699] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      {/* Top Navigation - Always full width on all pages */}
      <TopNavigation onAddCompany={handleAddCompany} />
      
      <div className="flex flex-1">
        {/* Sidebar - Only show on Posts page */}
        {isPostsPage && (
      <Sidebar 
        onAddGroup={handleAddGroup} 
        onEditGroup={(group) => {
          console.log('📝 Layout onEditGroup called with:', group.name)
          setEditingGroup(group)
          setShowEditGroupModal(true)
          console.log('📝 Modal state should now be true')
        }}
          />
        )}
        
        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${isPostsPage ? 'ml-80' : ''} ${isRecentPostsCollapsed ? 'mr-12' : 'mr-80'}`}>
          <Routes>
              <Route path="/" element={<Dashboard 
                groups={groups}
                posts={posts}
                selectedCompanyId={selectedCompanyId}
                onSelectGroup={setSelectedGroupId}
              />} />
              <Route path="/posts" element={<PostsPage 
                showEditGroupModal={showEditGroupModal}
                setShowEditGroupModal={setShowEditGroupModal}
                editingGroup={editingGroup}
                setEditingGroup={setEditingGroup}
                isRecentPostsCollapsed={isRecentPostsCollapsed}
                setIsRecentPostsCollapsed={setIsRecentPostsCollapsed}
              />} />
              <Route path="/companies" element={<CompaniesPage />} />
          </Routes>
        </main>
      </div>

      {/* Add Group Modal */}
      <AddGroupModal 
        isOpen={showAddGroup}
        onClose={() => setShowAddGroup(false)}
        onEditGroup={handleEditGroup}
        editingGroup={editingGroup}
      />
      
      {/* Add Company Modal */}
      {showAddCompany && (
        <AddCompanyModal
          onSave={async (company) => {
            console.log('🎯 Layout: Adding company via context')
            await addCompany(company)
            console.log('🎯 Layout: Company added, closing modal')
            setShowAddCompany(false)
          }}
          onCancel={() => setShowAddCompany(false)}
        />
      )}
      
      {/* Edit Company Modal */}
      {showEditCompany && editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onSave={async (updates) => {
            await updateCompany(editingCompany.id, updates)
            setShowEditCompany(false)
            setEditingCompany(null)
          }}
          onCancel={() => {
            setShowEditCompany(false)
            setEditingCompany(null)
          }}
        />
      )}
      
    </div>
  )
}

// Main App Component
const EnhancedApp = () => {
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  return (
    <AuthProvider>
    <AppProvider>
      <BrowserRouter>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-neutral)',
            },
            success: {
              iconTheme: {
                primary: '#388E3C',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#D32F2F',
                secondary: '#fff',
              },
            },
          }}
        />
        
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <Layout 
                    showEditGroupModal={showEditGroupModal}
                    setShowEditGroupModal={setShowEditGroupModal}
                    editingGroup={editingGroup}
                    setEditingGroup={setEditingGroup}
                  />
                </ProtectedRoute>
              } 
            />
          </Routes>
      </BrowserRouter>
    </AppProvider>
    </AuthProvider>
  )
}

export default EnhancedApp