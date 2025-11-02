import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare, X, Settings, MoreHorizontal, Search, Sun, Moon, Menu, Home, FileText, Compass, Building, Sparkles, Plus, Pencil } from 'lucide-react'
import { aiTemplateStructure } from './components/aiTemplates'
import toast, { Toaster } from 'react-hot-toast'
import { List } from 'react-window'
import InlinePostComposer from './components/InlinePostComposer'
import { CompanySelector } from './components/CompanySelector'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import type { Company, Group, Post, Lead } from './types/database'
import { API_BASE_URL } from './config/api'

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

// Enhanced Group Health Function with Real Data
const getGroupHealthWithRealData = (group: Group, posts: Post[]) => {
  const groupPosts = posts.filter(p => p.group_id === group.id && p.status === 'posted')
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Count posts this week
  const postsThisWeek = groupPosts.filter(post => {
    const postDate = new Date(post.posted_at || post.created_at)
    return postDate >= oneWeekAgo
  }).length
  
  // Find most recent post
  const sortedPosts = groupPosts.sort((a, b) => {
    const dateA = new Date(a.posted_at || a.created_at)
    const dateB = new Date(b.posted_at || b.created_at)
    return dateB.getTime() - dateA.getTime()
  })
  
  const lastPost = sortedPosts[0]
  const daysSinceLastPost = lastPost 
    ? Math.floor((now.getTime() - new Date(lastPost.posted_at || lastPost.created_at).getTime()) / (24 * 60 * 60 * 1000))
    : null
  
  // Determine health status
  const recommendedFreq = group.recommended_frequency || 3
  let status: 'safe' | 'caution' | 'danger' = 'safe'
  let color = '#10B981' // Green
  let icon = '✅'
  let message = 'Healthy posting frequency'
  let recommendationText = 'Your posting frequency is within recommended limits.'
  
  if (postsThisWeek >= recommendedFreq + 2) {
    status = 'danger'
    color = '#EF4444' // Red
    icon = '🚨'
    message = 'Posting too frequently - risk of spam detection'
    recommendationText = `You've posted ${postsThisWeek} times this week. Consider reducing frequency to avoid spam detection.`
  } else if (postsThisWeek >= recommendedFreq) {
    status = 'caution'
    color = '#F59E0B' // Yellow
    icon = '⚠️'
    message = 'Approaching posting limit'
    recommendationText = `You've posted ${postsThisWeek} times this week. Consider spacing out future posts.`
  } else if (daysSinceLastPost && daysSinceLastPost > 7) {
    status = 'caution'
    color = '#F59E0B'
    icon = '⏰'
    message = 'Haven\'t posted recently'
    recommendationText = `It's been ${daysSinceLastPost} days since your last post. Consider posting soon to maintain engagement.`
  }
  
  // Calculate next safe posting date
  let nextSafePostDate: string | null = null
  if (postsThisWeek >= recommendedFreq) {
    const nextWeek = new Date(now.getTime() + (7 - now.getDay()) * 24 * 60 * 60 * 1000)
    nextSafePostDate = nextWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return {
    status,
    color,
    icon,
    message,
    recommendationText,
    postsThisWeek,
    daysSinceLastPost,
    nextSafePostDate
  }
}

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
          const companiesResponse = await fetch(`${API_BASE_URL}/api/companies`, { headers })
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
          const groupsResponse = await fetch(`${API_BASE_URL}/api/groups`, { headers })
          const groupsData = await groupsResponse.json()
          console.log('✅ Successfully loaded groups from MongoDB:', Array.isArray(groupsData) ? groupsData.length : 'not an array')
          if (isMounted) setGroups(Array.isArray(groupsData) ? groupsData : [])

          // Fetch posts
          const postsResponse = await fetch(`${API_BASE_URL}/api/posts`, { headers })
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
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
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
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
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
          
          const groupsResponse = await fetch(`${API_BASE_URL}/api/groups`, {
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
      const response = await fetch(`${API_BASE_URL}/api/groups`, {
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
      const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/companies`, {
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
      const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
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
  setPendingAIContent,
  setPendingCompanyId,
  setPendingGroupId,
  showComposeDrawer
}: {
  showEditGroupModal: boolean
  setShowEditGroupModal: (show: boolean) => void
  editingGroup: Group | null
  setEditingGroup: (group: Group | null) => void
  setPendingAIContent?: (content: string | null) => void
  setPendingCompanyId?: (id: string | null) => void
  setPendingGroupId?: (id: string | null) => void
  showComposeDrawer?: boolean
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

  // AI Generation States
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

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

  // Calculate workflow metrics
  
  return (
    <>
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      {/* Main Content Area */}
      <div className="flex-1">
      <div className="px-6 py-6">
        <div className={`mx-auto transition-all duration-300 ${
          showComposeDrawer ? 'max-w-4xl' : 'max-w-6xl'
        }`}>
          {/* Page Header - Only show when a group is selected */}
          {selectedGroupId ? (
            <>
            <div className="mb-6">
              {/* Health Status Card with Group Name */}
              {(() => {
                const selectedGroup = groups.find(g => g.id === selectedGroupId)
                if (!selectedGroup) return null
                const health = getGroupHealthWithRealData(selectedGroup, posts)
                
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

            {/* AI Post Generator - Directly under group info */}
            <div className="mb-6 max-w-2xl">
            {/* STEP 1: Select Industry - TWO COLUMN LAYOUT */}
            {!selectedIndustry && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(aiTemplateStructure).map(([key, industry]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedIndustry(key)}
                    className="p-4 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-neutral)'
                    }}
                  >
                    <div className="text-2xl mb-2">{industry.icon}</div>
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {industry.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {industry.description}
                    </p>
                  </button>
                ))}
      </div>
          )}
          
            {/* STEP 2: Select Service Type */}
            {selectedIndustry && !selectedServiceType && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Select Service Type
                  </h3>
                    <button
                    onClick={() => setSelectedIndustry(null)}
                    className="text-sm px-4 py-2 rounded-lg transition-colors"
                      style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-neutral)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    ← Back
                  </button>
                </div>
                <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(aiTemplateStructure as any)[selectedIndustry].icon} {(aiTemplateStructure as any)[selectedIndustry].name}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
                  {Object.entries((aiTemplateStructure as any)[selectedIndustry].serviceTypes || {}).map(([key, serviceType]: [string, any]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedServiceType(key)}
                      className="p-3 rounded-lg text-left transition-all hover:border-[#EAB308]"
                          style={{
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--border-neutral)'
                          }}
                        >
                      <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {serviceType.name}
              </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {serviceType.description}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 3: Choose Your Goal */}
            {selectedIndustry && selectedServiceType && !selectedGoal && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Choose Your Goal
                  </h3>
                  <button
                    onClick={() => setSelectedServiceType(null)}
                    className="text-sm px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-neutral)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    ← Back
                  </button>
                </div>
                <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(aiTemplateStructure as any)[selectedIndustry].name} → {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].name}
                  </span>
              </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries((aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals).map(([key, goal]: [string, any]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedGoal(key)}
                      className="p-4 rounded-lg text-left transition-all hover:border-[#EAB308]"
                    style={{ 
                        backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-neutral)'
                      }}
                    >
                      <div className="text-xl mb-2">{goal.icon}</div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {goal.name}
                      </div>
                                  </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 4: Select Template */}
            {selectedIndustry && selectedServiceType && selectedGoal && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Select Template
                  </h3>
                                      <button
                    onClick={() => {
                      setSelectedGoal(null)
                      setSelectedTemplateId(null)
                    }}
                    className="text-sm px-4 py-2 rounded-lg transition-colors"
                                        style={{ 
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-neutral)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    ← Back
                                      </button>
                                    </div>
                <div className="mb-3 p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(aiTemplateStructure as any)[selectedIndustry].name}
                                    </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>→</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].name}
                                    </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>→</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[selectedGoal].name}
                  </span>
                              </div>

                {/* Loading Indicator */}
                {isGeneratingAI && (
                  <div className="mb-4 p-4 rounded-lg flex items-center justify-center gap-3" style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                  }}>
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#EAB308' }} />
                    <span className="text-sm font-medium" style={{ color: '#EAB308' }}>
                      Generating your post...
                                      </span>
                  </div>
                )}

                {/* Two-Column Layout: Templates List + Detail Panel */}
                {!isGeneratingAI && (
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* LEFT: Template List (60%) */}
                    <div className="flex-1 lg:flex-[6]">
                      <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
                        {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[selectedGoal].templates.map((template: any) => {
                          const isSelected = selectedTemplateId === template.id
                                        return (
                                            <button 
                              key={template.id}
                              onMouseEnter={() => setSelectedTemplateId(template.id)}
                              onClick={() => {
                                const company = companies.find(c => c.id === selectedCompanyId)
                                const companyName = company?.name || 'Your Company'
                                
                                setIsGeneratingAI(true)
                                
                                setTimeout(async () => {
                                  // Mock content - replace with actual AI API call
                                  const mockContent = `🏠 ${companyName} - Premium Service Alert!

Experience top-quality service that exceeds your expectations.

✨ Why choose us?
• Professional & certified team
• Fast, reliable service
• Customer satisfaction guaranteed

Call us today for a free quote!

#HomeServices #LocalBusiness #QualityService`
                                  
                                  if (setPendingAIContent) {
                                    setPendingAIContent(mockContent)
                                  }
                                  if (setPendingCompanyId && selectedCompanyId) {
                                    setPendingCompanyId(selectedCompanyId)
                                  }
                                  if (setPendingGroupId && selectedGroupId) {
                                    setPendingGroupId(selectedGroupId)
                                  }
                                  
                                  toast.success('✨ Post generated! Opening drawer for customization...')
                                  setIsGeneratingAI(false)
                                  
                                  // Clear selections after generation
                                  setSelectedIndustry(null)
                                  setSelectedServiceType(null)
                                  setSelectedGoal(null)
                                  setSelectedTemplateId(null)
                                }, 2000)
                              }}
                              disabled={isGeneratingAI}
                              className="p-3 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed h-20 flex flex-col justify-between"
                              style={{
                                backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--input-bg)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: isSelected ? '#EAB308' : 'var(--border-neutral)',
                                boxShadow: isSelected ? '0 0 0 1px #EAB308, 0 2px 8px rgba(234, 179, 8, 0.2)' : 'none'
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{template.icon}</span>
                                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {template.name}
                                </span>
                              </div>
                              <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                {template.prompt.split('.')[0]}...
                              </p>
                                          </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* RIGHT: Template Detail Panel (40%) */}
                    <div className="flex-1 lg:flex-[4]">
                      {selectedTemplateId ? (
                        (() => {
                          const template = (aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[selectedGoal].templates.find((t: any) => t.id === selectedTemplateId)
                          if (!template) return null
                          
                          const company = companies.find(c => c.id === selectedCompanyId)
                          const companyName = company?.name || 'Your Company'
                          const samplePrompt = template.prompt.replace('{company}', companyName)
                          
                                      return (
                            <div className="sticky top-0 p-4 rounded-lg" style={{
                              backgroundColor: 'var(--input-bg)',
                              border: '2px solid #EAB308'
                            }}>
                              {/* Template Header */}
                              <div className="flex items-start gap-2.5 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-neutral)' }}>
                                <span className="text-2xl">{template.icon}</span>
                                <div className="flex-1">
                                  <h3 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                    {template.name}
                                  </h3>
                                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Click to generate your post
                                  </p>
                                </div>
                              </div>

                              {/* Template Preview */}
                              <div className="mb-3">
                                <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                  Template Preview
                                </div>
                                <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-neutral)' }}>
                                  <p className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                    {samplePrompt}
                                  </p>
                                </div>
                              </div>

                              {/* Action Button */}
                                          <button
                                onClick={() => {
                                  const company = companies.find(c => c.id === selectedCompanyId)
                                  const companyName = company?.name || 'Your Company'
                                  
                                  setIsGeneratingAI(true)
                                  
                                  setTimeout(async () => {
                                    const mockContent = `🏠 ${companyName} - Premium Service Alert!

Experience top-quality service that exceeds your expectations.

✨ Why choose us?
• Professional & certified team
• Fast, reliable service
• Customer satisfaction guaranteed

Call us today for a free quote!

#HomeServices #LocalBusiness #QualityService`
                                    
                                    if (setPendingAIContent) {
                                      setPendingAIContent(mockContent)
                                    }
                                    if (setPendingCompanyId && selectedCompanyId) {
                                      setPendingCompanyId(selectedCompanyId)
                                    }
                                    if (setPendingGroupId && selectedGroupId) {
                                      setPendingGroupId(selectedGroupId)
                                    }
                                    
                                    toast.success('✨ Post generated! Opening drawer for customization...')
                                    setIsGeneratingAI(false)
                                    
                                    // Clear selections after generation
                                    setSelectedIndustry(null)
                                    setSelectedServiceType(null)
                                    setSelectedGoal(null)
                                    setSelectedTemplateId(null)
                                  }, 2000)
                                }}
                                disabled={isGeneratingAI || !selectedCompanyId || !selectedGroupId}
                                className="w-full h-10 rounded-lg font-medium text-sm transition-all disabled:opacity-50 hover:opacity-90"
                                            style={{
                                  backgroundColor: '#EAB308',
                                  color: '#000000'
                                            }}
                                          >
                                Generate Post
                                          </button>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="p-4 rounded-lg border-2 border-dashed flex items-center justify-center h-full" style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--border-neutral)'
                        }}>
                          <div className="text-center">
                            <span className="text-3xl mb-2 block">👈</span>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Hover over a template to see details
                            </p>
                              </div>
                            </div>
                      )}
                          </div>
                        </div>
                )}
              </>
            )}
                      </div>
            </>
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
          </div>
          </div>
        </div>
    </div>


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
const Sidebar = ({ onAddGroup, onEditGroup: _onEditGroup }: { 
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
      const health = getGroupHealthWithRealData(group, posts)
      return health.status === healthFilter
    })

  return (
    <aside 
      className={`w-80 border-r flex flex-col overflow-hidden fixed left-16 top-0 bottom-0 z-50 transform transition-transform duration-300 ease-out`}
      style={{ 
        backgroundColor: '#111111', 
        borderColor: '#1A1A1A', 
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.5)',
        overscrollBehavior: 'contain' 
      }}
    >
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

      {/* Health Status Filter - Simple compact version */}
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
      <div className="flex-1 overflow-hidden" style={{ overscrollBehavior: 'contain' }}>
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
            const health = getGroupHealthWithRealData(group, posts)
                                  
            return (
              <div style={style} className="px-2 py-1">
              <div
                key={group.id}
                id={`group-${group.id}`}
                onClick={() => {
                  setSelectedGroupId(group.id)
                  // Only navigate to /posts if we're not already on /posts
                  if (location.pathname !== '/posts') {
                    navigate('/posts')
                  } else {
                    // Scroll to top when already on posts page
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                    document.documentElement.scrollTop = 0
                    document.body.scrollTop = 0
                    const mainElement = document.getElementById('main-content')
                    if (mainElement) {
                      mainElement.scrollTop = 0
                    }
                  }
                }}
                className={`
                    group relative p-3 cursor-pointer transition-all duration-200 rounded-lg border
                  ${isSelected 
                    ? 'bg-[#336699]/20 border-[#336699] shadow-lg' 
                    : 'border-transparent hover:bg-white/5 hover:border-white/10'
                  }
                `}
                style={{
                  height: 'calc(100% - 8px)',
                  backgroundColor: isSelected ? 'rgba(51, 102, 153, 0.15)' : '#1A1A1A',
                  borderColor: isSelected ? '#336699' : '#2A2A2A'
                }}
              >
                  {/* Group Name with Health Dot */}
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: health.color }}
                      title={health.message}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white/90 truncate">
                  {group.name}
                  </div>
                      </div>
                  </div>
                  
                  {/* Location & Privacy */}
                  <div className="flex items-center gap-2 mb-2 text-xs text-white/50">
                    {(group.target_city || group.target_state) && (
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        <span className="truncate max-w-[80px]">{group.target_city}{group.target_city && group.target_state ? ', ' : ''}{group.target_state}</span>
                      </span>
                    )}
                    {group.privacy && (
                      <span className="flex items-center gap-1">
                        {group.privacy === 'public' ? '🌐' : group.privacy === 'private' ? '🔒' : '🔐'}
                        <span className="capitalize">{group.privacy}</span>
                    </span>
                    )}
                </div>
                
                  {/* Stats & Health */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      {group.audience_size && group.audience_size >= 1000 ? `${(group.audience_size/1000).toFixed(0)}k` : group.audience_size || '-'} members
                        </span>
                    <span className="font-medium px-1.5 py-0.5 rounded" style={{ 
                      backgroundColor: `${health.color}20`, 
                      color: health.color 
                    }}>
                      {health.postsThisWeek}/3 this week
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

// Left Navigation Component - Sleek Vertical Sidebar
const LeftNavigation = ({ onAddCompany, onToggleSidebar }: { onAddCompany: () => void, onToggleSidebar?: () => void }) => {
  const { companies, selectedCompanyId, setSelectedCompanyId, isDarkMode, toggleTheme } = useApp()
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)
  const companySelectorRef = React.useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (companySelectorRef.current && !companySelectorRef.current.contains(event.target as Node)) {
        setIsCompanySelectorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/posts', icon: <FileText size={20} />, label: 'Posts' },
    { path: '/groups', icon: <Compass size={20} />, label: 'Discover' },
    { path: '/companies', icon: <Building size={20} />, label: 'Companies' },
  ]

  return (
    <div 
      className="fixed top-0 left-0 bottom-0 z-[100] border-r flex flex-col transition-all duration-300 ease-out" 
      style={{ 
        width: isHovered ? '224px' : '64px',
        backgroundColor: '#0A0A0A',
        borderColor: '#1A1A1A',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.5)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Section - User Avatar */}
      <div className={`flex flex-col ${isHovered ? 'items-start px-4' : 'items-center'} py-4 border-b`} style={{ borderColor: '#1A1A1A' }}>
        {isAuthenticated && (
          <div className="relative w-full" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`${isHovered ? 'w-full px-3 justify-start gap-3' : 'w-10 mx-auto justify-center'} h-10 rounded-full flex items-center transition-all hover:ring-2 ring-[#336699] mb-2`}
              style={{ 
                backgroundColor: '#336699',
              }}
              title={isHovered ? undefined : (user?.name || 'User')}
            >
              <span className="text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              {isHovered && (
                <span className="text-white text-sm font-medium truncate">
                  {user?.name || 'User'}
                </span>
              )}
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute left-full top-0 ml-2 w-56 rounded shadow-2xl z-[110]"
                style={{ 
                  backgroundColor: '#1E1E1E',
                  border: '1px solid #333333'
                }}
              >
                <div className="p-3 border-b" style={{ borderColor: '#333333' }}>
                  <p className="text-sm font-medium truncate text-white/90">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs truncate text-white/60">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
            <button
              onClick={() => {
                      handleLogout()
                      setIsHovered(false)
              }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors text-red-500 hover:bg-red-500/10"
            >
                    Sign Out
            </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sidebar Toggle for Mobile */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`${isHovered ? 'w-full px-3 justify-start gap-3' : 'w-10 mx-auto justify-center'} h-10 flex items-center rounded-lg transition-all hover:bg-white/10`}
            style={{ color: '#888888' }}
            title={isHovered ? undefined : 'Toggle Sidebar'}
          >
            <Menu size={20} className="flex-shrink-0" />
            {isHovered && (
              <span className="text-sm text-white/70">Menu</span>
            )}
          </button>
        )}
          </div>
          
      {/* Middle Section - Navigation Icons */}
      <div className={`flex-1 flex flex-col ${isHovered ? 'items-stretch px-3' : 'items-center px-0'} py-6 gap-2`}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
          <Link 
              key={item.path}
              to={item.path}
              onClick={() => setIsHovered(false)}
              className={`relative ${isHovered ? 'w-full px-3 justify-start gap-3' : 'w-12 mx-auto justify-center'} h-12 flex items-center rounded-lg transition-all group`}
            style={{ 
                backgroundColor: isActive ? '#336699' : 'transparent',
                color: isActive ? '#FFFFFF' : '#888888'
              }}
              title={isHovered ? undefined : item.label}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span className="flex-shrink-0">
                {item.icon}
              </span>
              {isHovered && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <div 
                  className={`absolute ${isHovered ? 'left-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 h-8 rounded-r`}
                  style={{ backgroundColor: '#60A5FA' }}
                />
              )}
          </Link>
          )
        })}
      </div>

      {/* Bottom Section - Company Selector & Settings */}
      <div className={`flex flex-col ${isHovered ? 'items-stretch px-3' : 'items-center px-0'} py-3 border-t gap-2`} style={{ borderColor: '#1A1A1A' }}>
        {/* Company Selector Icon */}
        <div className="relative w-full" ref={companySelectorRef}>
          <button
            onClick={() => {
              setIsCompanySelectorOpen(!isCompanySelectorOpen)
            }}
            className={`${isHovered ? 'w-full px-3 justify-start gap-3' : 'w-10 mx-auto justify-center'} h-10 rounded-lg flex items-center transition-all hover:bg-white/10`}
            style={{ 
              color: '#888888',
              backgroundColor: selectedCompanyId ? 'rgba(51, 102, 153, 0.2)' : 'transparent'
            }}
            title={isHovered ? undefined : 'Select Company'}
          >
            <Building size={20} className="flex-shrink-0" />
            {isHovered && (
              <span className="text-sm text-white/70 truncate">
                {selectedCompanyId ? companies.find(c => c.id === selectedCompanyId)?.name || 'Select Company' : 'Select Company'}
              </span>
            )}
          </button>

          {/* Company Selector Dropdown */}
          {isCompanySelectorOpen && (
            <div 
              className="absolute left-full bottom-0 ml-2 w-64 rounded shadow-2xl z-[110]"
            style={{ 
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333'
              }}
            >
              <CompanySelector
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={(id) => {
                  setSelectedCompanyId(id)
                  setIsCompanySelectorOpen(false)
                  setIsHovered(false)
                }}
                onAddCompany={() => {
                  onAddCompany()
                  setIsCompanySelectorOpen(false)
                  setIsHovered(false)
                }}
                isDarkMode={true}
              />
            </div>
          )}
              </div>

        {/* Settings Icon */}
        <button
          onClick={toggleTheme}
          className={`${isHovered ? 'w-full px-3 justify-start gap-3' : 'w-10 mx-auto justify-center'} h-10 rounded-lg flex items-center transition-all hover:bg-white/10`}
          style={{ color: '#888888' }}
          title={isHovered ? undefined : (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
        >
          <span className="flex-shrink-0">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </span>
          {isHovered && (
            <span className="text-sm text-white/70">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
            </div>
            </div>
  )
}

// Quick Compose Drawer Component - Twitter/X Style
const QuickComposeDrawer = ({ onClose, onPostCreated, companies, groups, selectedCompanyId, selectedGroupId, initialContent, initialCompanyId, initialGroupId, posts, isDarkMode = true, updatePost, deletePost, editingPost, setEditingPost }: {
  onClose: () => void
  onPostCreated: (post: Post) => void
  companies: Company[]
  groups: Group[]
  selectedCompanyId: string | null
  selectedGroupId: string | null
  initialContent?: string
  initialCompanyId?: string | null
  initialGroupId?: string | null
  posts?: Post[]
  isDarkMode?: boolean
  updatePost?: (id: string, updates: any) => void
  deletePost?: (id: string) => void
  editingPost?: Post | null
  setEditingPost?: (post: Post | null) => void
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'drafts' | 'scheduled' | 'sent'>('compose')
  const [content, setContent] = useState(initialContent || '')
  const [companyId, setCompanyId] = useState(initialCompanyId || selectedCompanyId || '')
  const [groupId, setGroupId] = useState(initialGroupId || selectedGroupId || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  
  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent)
    }
    if (initialCompanyId) {
      setCompanyId(initialCompanyId)
    }
    if (initialGroupId) {
      setGroupId(initialGroupId)
    }
  }, [initialContent, initialCompanyId, initialGroupId])

  // Keep companyId in sync with selectedCompanyId from context
  useEffect(() => {
    if (selectedCompanyId) {
      setCompanyId(selectedCompanyId)
    }
  }, [selectedCompanyId])
  
  // Advanced options
  const [autoRetweet, setAutoRetweet] = useState(false)
  const [retweetInterval, setRetweetInterval] = useState('8')
  const [retweetTimes, setRetweetTimes] = useState('1')

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handlePost = async () => {
    if (!content.trim() || !groupId || !companyId) {
      toast.error('Please fill in all required fields')
      return
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title: 'Untitled Post',
      content: content.trim(),
      group_id: groupId,
      company_id: companyId,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onPostCreated(newPost)
    toast.success('Draft created!')
  }

  const handleAddToQueue = () => {
    toast('Queue functionality coming soon!', { icon: 'ℹ️' })
  }

  return (
    <>
      {/* Right Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full max-w-sm z-[201] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isClosing ? 'translate-x-full' : 'translate-x-0 animate-slide-in-right'
        }`}
            style={{ 
          backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', 
          borderLeft: `1px solid ${isDarkMode ? '#333333' : '#E5E7EB'}` 
        }}
      >
        {/* Header with Tabs */}
        <div className="flex-shrink-0">
          {/* Top Bar */}
          <div 
            className="flex items-center justify-between px-3 py-2 border-b" 
            style={{ borderColor: isDarkMode ? '#333333' : '#E5E7EB' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                className="hover:opacity-90 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <button 
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
              className="hover:opacity-90 transition-colors" 
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: isDarkMode ? '#333333' : '#E5E7EB' }}>
            {[
              { key: 'compose', label: 'Compose' },
              { key: 'drafts', label: 'Drafts' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'sent', label: 'Sent' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className="flex-1 px-2 py-2 text-xs font-medium transition-colors relative"
                  style={{ 
                  color: activeTab === tab.key 
                    ? (isDarkMode ? '#FFFFFF' : '#000000')
                    : (isDarkMode ? '#888888' : '#666666')
                }}
              >
                {tab.label}
                {activeTab === tab.key && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: '#336699' }}
                />
              )}
              </button>
            ))}
        </div>
              </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'compose' && (
            <>
              {/* Your content label */}
              <div className="flex items-center justify-between mb-3">
                <h3 
                  className="font-medium text-sm"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
                >
                  Your content
                </h3>
                    <button
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                  className="text-xs hover:opacity-90 flex items-center gap-1"
                >
                  <span>+</span>
                  <span className="underline">New draft</span>
                </button>
            </div>

              {/* Group Selector */}
              <div className="mb-3">
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-2 py-2 rounded text-xs"
                  style={{ 
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB', 
                    border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`, 
                    color: isDarkMode ? '#FFFFFF' : '#000000' 
                  }}
                >
                  <option value="">Select Group</option>
                  {groups
                    .filter(g => !selectedCompanyId || g.company_id === selectedCompanyId)
                    .map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write here.&#10;&#10;&#10;Skip 3 lines to start a thread."
                className="w-full h-48 p-3 rounded-lg resize-none text-sm placeholder:opacity-40"
                      style={{ 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB', 
                  border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`,
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                      }}
                maxLength={280}
              />

              {/* Character Count & Tools */}
              <div className="flex items-center justify-between mt-2 mb-3">
                <div 
                  className="flex items-center gap-2 text-xs"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                >
                  <span>{content.length} / 280</span>
                  <span>saved ✓</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="hover:opacity-90 p-1.5" 
                    title="AI"
                  >⚡</button>
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="hover:opacity-90 p-1.5" 
                    title="Media"
                  >🖼️</button>
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="hover:opacity-90 p-1.5" 
                    title="Text"
                  >T</button>
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="hover:opacity-90 p-1.5" 
                    title="Poll"
                  >📊</button>
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="hover:opacity-90 p-1.5" 
                    title="Emoji"
                  >😊</button>
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="hover:opacity-90 p-1.5" 
                    title="Schedule"
                  >📅</button>
            </div>
          </div>
          
              {/* Action Buttons */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                    <button
                    onClick={handlePost}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1"
                    style={{ 
                      backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB', 
                      color: isDarkMode ? '#888888' : '#666666', 
                      border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}` 
                    }}
                  >
                    Save Draft
                  </button>
                  <button 
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    className="px-2 py-1.5 hover:opacity-90"
                  >
                    <Search size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToQueue}
                  className="w-full px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between"
                  style={{ backgroundColor: '#336699', color: '#FFFFFF' }}
                >
                  <span>Add to Queue</span>
                  <span className="text-[10px] opacity-80">Feb 28th, 11:57 AM</span>
                </button>
              </div>

              <button
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                className="text-xs hover:opacity-90 underline mb-3"
              >
                Edit queue
              </button>

              {/* Advanced Options */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-2 rounded-lg mb-2 transition-colors"
                style={{ 
                  border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`,
                  backgroundColor: isDarkMode ? 'transparent' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div>
                  <div 
                    className="font-medium text-left text-xs"
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
                  >
                    Advanced Options
                  </div>
                  <div 
                    className="text-[10px] text-left"
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                  >
                    enabled: auto-retweet, tweet delay
                  </div>
                </div>
                <span 
                  className="text-xs transition-transform"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                >
                  {showAdvanced ? '▲' : '▼'}
                </span>
              </button>

              {showAdvanced && (
                <div 
                  className="p-2 rounded-lg space-y-3" 
                  style={{ backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB' }}
                >
                  <div 
                    className="p-2 rounded flex items-center gap-2 text-xs" 
                    style={{ backgroundColor: 'rgba(51, 102, 153, 0.2)', color: '#60A5FA' }}
                  >
                    <span>ℹ️</span>
                    <span>These settings will affect this post only</span>
                  </div>

                  {/* Auto retweet */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs"
                        style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                      >?</span>
                      <span 
                        className="text-xs"
                        style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
                      >
                        Auto retweet
                      </span>
                    </div>
                    <button
                      onClick={() => setAutoRetweet(!autoRetweet)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${autoRetweet ? 'bg-blue-500' : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}`}
                    >
                      <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${autoRetweet ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
          </div>

                  {autoRetweet && (
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      <div>
                        <label 
                          className="text-xs block mb-1"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                        >
                          Interval
                        </label>
                        <select
                          value={retweetInterval}
                          onChange={(e) => setRetweetInterval(e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-xs"
                  style={{ 
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                            border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`, 
                            color: isDarkMode ? '#FFFFFF' : '#000000' 
                          }}
                        >
                          <option value="8">8 hours</option>
                          <option value="12">12 hours</option>
                          <option value="24">24 hours</option>
                        </select>
                  </div>
                      <div>
                        <label 
                          className="text-xs block mb-1"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                        >
                          # of times
                        </label>
                        <select
                          value={retweetTimes}
                          onChange={(e) => setRetweetTimes(e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-xs"
                          style={{ 
                            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', 
                            border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`, 
                            color: isDarkMode ? '#FFFFFF' : '#000000' 
                          }}
                        >
                          <option value="1">1 time</option>
                          <option value="2">2 times</option>
                          <option value="3">3 times</option>
                        </select>
                      </div>
            </div>
          )}
        </div>
              )}
            </>
          )}

          {activeTab === 'drafts' && (
            <div>
              {(() => {
                const draftPosts = (posts || []).filter(p => 
                  p.status === 'draft' && (!selectedGroupId || p.group_id === selectedGroupId)
                )
                if (draftPosts.length === 0) {
                  return (
                    <div 
                      className="text-center py-12"
                      style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    >
                      <p className="text-xs">No drafts yet</p>
                    </div>
                  )
                }
                return (
                  <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                    {draftPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-2 rounded border cursor-pointer transition-colors relative"
                      style={{ 
                          backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                          borderColor: isDarkMode ? '#404040' : '#E5E7EB'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#336699'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isDarkMode ? '#404040' : '#E5E7EB'
                        }}
                        onClick={() => {
                          setContent(post.content || '')
                          setCompanyId(post.company_id || '')
                          setGroupId(post.group_id || '')
                          setActiveTab('compose')
                          if (setEditingPost) {
                            setEditingPost(post)
                          }
                        }}
                      >
                        {/* Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPostMenu(showPostMenu === post.id ? null : post.id)
                          }}
                          className="absolute top-1 right-1 p-1 rounded hover:bg-white/10"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                        >
                          <MoreHorizontal size={12} />
                    </button>
                    
                        {showPostMenu === post.id && (
                          <div 
                            className="absolute top-6 right-1 rounded shadow-lg z-50 min-w-[100px]"
                            style={{ 
                              backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                              border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {updatePost && (
                    <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setContent(post.content || '')
                                  setCompanyId(post.company_id || '')
                                  setGroupId(post.group_id || '')
                                  setActiveTab('compose')
                                  if (setEditingPost) setEditingPost(post)
                                  setShowPostMenu(null)
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs transition-colors"
                      style={{ 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                      }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {deletePost && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPostToDelete(post)
                                  setShowPostMenu(null)
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs text-red-500 transition-colors"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Delete
                    </button>
                            )}
                          </div>
                        )}

                        <p 
                          className="text-xs line-clamp-3 mb-1 pr-6"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
                        >
                          {post.content}
                        </p>
                        <div 
                          className="flex items-center justify-between text-[10px]"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                        >
                          <span>{groups.find(g => g.id === post.group_id)?.name || 'Unknown'}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div>
              {(() => {
                const scheduledPosts = (posts || []).filter(p => 
                  (p.status === 'ready_to_post' || p.status === 'pending_approval') && (!selectedGroupId || p.group_id === selectedGroupId)
                )
                if (scheduledPosts.length === 0) {
                  return (
                    <div 
                      className="text-center py-12"
                      style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    >
                      <p className="text-xs">No scheduled posts</p>
                    </div>
                  )
                }
                return (
                  <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                    {scheduledPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-2 rounded border cursor-pointer transition-colors relative"
                        style={{
                          backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                          borderColor: isDarkMode ? '#404040' : '#E5E7EB'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#336699'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isDarkMode ? '#404040' : '#E5E7EB'
                        }}
                        onClick={() => {
                          setContent(post.content || '')
                          setCompanyId(post.company_id || '')
                          setGroupId(post.group_id || '')
                          setActiveTab('compose')
                          if (setEditingPost) {
                            setEditingPost(post)
                          }
                        }}
                      >
                        {/* Menu Button */}
                    <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPostMenu(showPostMenu === post.id ? null : post.id)
                          }}
                          className="absolute top-1 right-1 p-1 rounded hover:bg-white/10"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                        >
                          <MoreHorizontal size={12} />
                    </button>
                        
                        {showPostMenu === post.id && (
                          <div 
                            className="absolute top-6 right-1 rounded shadow-lg z-50 min-w-[100px]"
                            style={{ 
                              backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                              border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {updatePost && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setContent(post.content || '')
                                  setCompanyId(post.company_id || '')
                                  setGroupId(post.group_id || '')
                                  setActiveTab('compose')
                                  if (setEditingPost) setEditingPost(post)
                                  setShowPostMenu(null)
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs transition-colors"
                                style={{ 
                                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {deletePost && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPostToDelete(post)
                                  setShowPostMenu(null)
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs text-red-500 transition-colors"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Delete
                              </button>
              )}
            </div>
          )}

                        <p 
                          className="text-xs line-clamp-3 mb-1 pr-6"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
                        >
                          {post.content}
                        </p>
                        <div 
                          className="flex items-center justify-between text-[10px]"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                        >
                          <span>{groups.find(g => g.id === post.group_id)?.name || 'Unknown'}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              {(() => {
                const sentPosts = (posts || []).filter(p => 
                  p.status === 'posted' && (!selectedGroupId || p.group_id === selectedGroupId)
                )
                if (sentPosts.length === 0) {
                  return (
                    <div 
                      className="text-center py-12"
                      style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                    >
                      <p className="text-xs">No sent posts</p>
                    </div>
                  )
                }
                return (
                  <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                    {sentPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-2 rounded border cursor-pointer transition-colors relative"
            style={{ 
                          backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                          borderColor: isDarkMode ? '#404040' : '#E5E7EB'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#336699'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isDarkMode ? '#404040' : '#E5E7EB'
                        }}
                        onClick={() => {
                          setContent(post.content || '')
                          setCompanyId(post.company_id || '')
                          setGroupId(post.group_id || '')
                          setActiveTab('compose')
                          if (setEditingPost) {
                            setEditingPost(post)
                          }
                        }}
                      >
                        {/* Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPostMenu(showPostMenu === post.id ? null : post.id)
                          }}
                          className="absolute top-1 right-1 p-1 rounded hover:bg-white/10"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                        >
                          <MoreHorizontal size={12} />
                        </button>
                        
                        {showPostMenu === post.id && (
                          <div 
                            className="absolute top-6 right-1 rounded shadow-lg z-50 min-w-[100px]"
                style={{ 
                              backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                              border: `1px solid ${isDarkMode ? '#404040' : '#E5E7EB'}`
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {updatePost && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setContent(post.content || '')
                                  setCompanyId(post.company_id || '')
                                  setGroupId(post.group_id || '')
                                  setActiveTab('compose')
                                  if (setEditingPost) setEditingPost(post)
                                  setShowPostMenu(null)
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs transition-colors"
                style={{ 
                                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {deletePost && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPostToDelete(post)
                                  setShowPostMenu(null)
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs text-red-500 transition-colors"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Delete
                              </button>
                            )}
            </div>
                        )}

                        <p 
                          className="text-xs line-clamp-3 mb-1 pr-6"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
                        >
                          {post.content}
                        </p>
                        <div 
                          className="flex items-center justify-between text-[10px]"
                          style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                        >
                          <span>{groups.find(g => g.id === post.group_id)?.name || 'Unknown'}</span>
                          <span>{post.posted_at ? new Date(post.posted_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
          </div>
        )}
      </div>
    </div>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[250]">
          <div 
            className="rounded-lg p-4 w-full max-w-xs mx-4 shadow-2xl"
            style={{ 
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF', 
              border: `1px solid ${isDarkMode ? '#333333' : '#E5E7EB'}` 
            }}
          >
            <h2 
              className="text-sm font-medium mb-2"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
            >
              Delete Post?
            </h2>
            <p 
              className="text-xs mb-4"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{ 
                  backgroundColor: isDarkMode ? '#333333' : '#F3F4F6', 
                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletePost && postToDelete) {
                    deletePost(postToDelete.id)
                    setPostToDelete(null)
                  }
                }}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors text-white"
                style={{ backgroundColor: '#EF4444' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
    audience_size: 0,
    privacy: 'public',
    target_city: '',
    target_state: '',
    quality_rating: 5,
    qa_status: 'new'
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
        audience_size: editingGroup.audience_size || 0,
        privacy: editingGroup.privacy || 'public',
        target_city: editingGroup.target_city || '',
        target_state: editingGroup.target_state || '',
        quality_rating: editingGroup.quality_rating || 5,
        qa_status: editingGroup.qa_status || 'new'
      })
      } else {
      setFormData({
        name: '',
        description: '',
        company_id: selectedCompanyId || '',
        category: '',
        tier: 'medium',
        audience_size: 0,
        privacy: 'public',
        target_city: '',
        target_state: '',
        quality_rating: 5,
        qa_status: 'new'
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

          {/* Privacy */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Privacy</label>
            <select
              value={formData.privacy}
              onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Location Fields - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Target City */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Target City</label>
              <input
                type="text"
                value={formData.target_city}
                onChange={(e) => setFormData(prev => ({ ...prev, target_city: e.target.value }))}
                placeholder="e.g. Phoenix"
                className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Target State */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>Target State</label>
              <input
                type="text"
                value={formData.target_state}
                onChange={(e) => setFormData(prev => ({ ...prev, target_state: e.target.value }))}
                placeholder="e.g. AZ"
                maxLength={2}
                className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all uppercase"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Quality Rating ({formData.quality_rating}/10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.quality_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, quality_rating: parseInt(e.target.value) }))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{ 
                  background: `linear-gradient(to right, #EAB308 0%, #EAB308 ${(formData.quality_rating - 1) * 11.11}%, var(--input-bg) ${(formData.quality_rating - 1) * 11.11}%, var(--input-bg) 100%)`
                }}
              />
              <div className="text-lg font-bold" style={{ color: '#EAB308', minWidth: '40px', textAlign: 'center' }}>
                {'⭐'.repeat(Math.min(formData.quality_rating, 10))}
              </div>
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Rate based on engagement, lead quality, and group responsiveness
            </p>
          </div>

          {/* QA Status */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--text-primary)' }}>QA Status</label>
            <select
              value={formData.qa_status}
              onChange={(e) => setFormData(prev => ({ ...prev, qa_status: e.target.value }))}
              className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/40 transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)', color: 'var(--text-primary)' }}
            >
              <option value="new">New - Just Added</option>
              <option value="pending_approval">Pending Approval - Waiting to Join</option>
              <option value="approved">Approved - Ready to Post</option>
              <option value="rejected">Rejected - Can't Post Here</option>
            </select>
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
  const { addGroup, updateGroup, addCompany, updateCompany, loading, posts, groups, selectedCompanyId, setSelectedGroupId, addPost, updatePost, deletePost, selectedGroupId: contextSelectedGroupId, companies, isDarkMode } = useApp()
  const location = useLocation()
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showEditCompany, setShowEditCompany] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [showComposeDrawer, setShowComposeDrawer] = useState(false)
  const [pendingAIContent, setPendingAIContent] = useState<string | null>(null)
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null)
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const isPostsPage = location.pathname === '/posts'

  // Auto-open drawer when pendingAIContent is set
  useEffect(() => {
    if (pendingAIContent) {
      setShowComposeDrawer(true)
    }
  }, [pendingAIContent])

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
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Group Caster</h1>
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

  const handlePostCreated = async (post: Post) => {
    await addPost(post)
    toast.success('Post created!')
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      {/* Left Navigation - Always visible on all pages */}
      <LeftNavigation onAddCompany={handleAddCompany} />
      
      <div className="flex flex-1 ml-16">
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
        
        {/* Main Content Area - Adjusts for drawer */}
        <main 
          id="main-content"
          className={`flex-1 transition-all duration-300 ${isPostsPage ? 'ml-80' : ''} ${
            showComposeDrawer ? 'mr-96' : ''
          }`}
        >
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
                setPendingAIContent={setPendingAIContent}
                setPendingCompanyId={setPendingCompanyId}
                setPendingGroupId={setPendingGroupId}
                showComposeDrawer={showComposeDrawer}
              />} />
              <Route path="/companies" element={<CompaniesPage />} />
          </Routes>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-3">
        {/* Quick Compose Button */}
        <button
          onClick={() => setShowComposeDrawer(true)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: '#3B82F6' }}
          title="Quick Compose"
        >
          <Pencil size={24} className="text-white" />
        </button>
        
        {/* Draft Counter Badge (if there are drafts) */}
        {(() => {
          const draftCount = posts.filter(p => p.status === 'draft').length
          if (draftCount > 0) {
            return (
              <div 
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: '#EAB308', color: '#000000' }}
                title={`${draftCount} drafts`}
              >
                {draftCount}
              </div>
            )
          }
          return null
        })()}
      </div>

      {/* Quick Compose Drawer */}
      {showComposeDrawer && (
        <QuickComposeDrawer
          onClose={() => {
            setShowComposeDrawer(false)
            setPendingAIContent(null)
            setPendingCompanyId(null)
            setPendingGroupId(null)
            setEditingPost(null)
          }}
          onPostCreated={handlePostCreated}
          companies={companies}
          groups={groups}
          selectedCompanyId={selectedCompanyId}
          selectedGroupId={contextSelectedGroupId}
          initialContent={pendingAIContent || undefined}
          initialCompanyId={pendingCompanyId || undefined}
          initialGroupId={pendingGroupId || undefined}
          posts={posts}
          isDarkMode={isDarkMode}
          updatePost={updatePost}
          deletePost={deletePost}
          editingPost={editingPost}
          setEditingPost={setEditingPost}
        />
      )}

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