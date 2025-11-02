import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, Filter, Download, ChevronDown, X, Plus, CheckCircle2, ExternalLink, Trash2, Award } from 'lucide-react'
import { useApp } from '../EnhancedApp'
import { calculateGroupHealth } from '../utils/groupHealth'
import { exportToCSV, exportToJSON, exportToExcel, formatGroupForExport } from '../utils/exportUtils'
import type { Group, GlobalGroup } from '../types/database'
import { InlineSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../config/api'
import { FB_GROUP_CATEGORIES } from '../constants/categories'

interface GroupsPageProps {
  onEditGroup: (group: Group) => void
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ onEditGroup }) => {
  const { groups, companies, posts, setSelectedGroupId, isDarkMode, selectedCompanyId, refreshGroups } = useApp()
  const navigate = useNavigate()
  
  // View state
  const [groupFilter, setGroupFilter] = useState<'my' | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Group | 'company' | 'posts' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Export state
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  
  // Global groups state
  const [globalGroups, setGlobalGroups] = useState<GlobalGroup[]>([])
  const [addingGroupIds, setAddingGroupIds] = useState<Set<string>>(new Set())
  
  // Add group confirmation modal
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false)
  const [groupToAdd, setGroupToAdd] = useState<GlobalGroup | null>(null)
  
  // Delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<GlobalGroup | null>(null)
  const [deleteImpact, setDeleteImpact] = useState<{
    organizationsUsing: number
    scheduledPosts: number
    organizations: Array<{id: string, name: string}>
    canDelete: boolean
  } | null>(null)
  const [isDeletingGlobally, setIsDeletingGlobally] = useState(false)
  
  // Get current user ID from token
  const getCurrentUserId = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId
    } catch {
      return null
    }
  }, [])
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [memberCountRange, setMemberCountRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [qualityRatingRange, setQualityRatingRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [privacyFilter, setPrivacyFilter] = useState<string[]>([])

  // Use master category list for filters
  const uniqueCategories = useMemo(() => {
    return [...FB_GROUP_CATEGORIES].sort()
  }, [])

  const uniqueStates = useMemo(() => {
    const states = new Set<string>()
    groups.forEach(g => g.target_state && states.add(g.target_state))
    return Array.from(states).sort()
  }, [groups])

  // Check if a global group is already added to the SELECTED company's groups
  const isGroupAdded = useCallback((globalGroupName: string) => {
    if (!selectedCompanyId) return false
    return groups.some(g => g.name === globalGroupName && g.company_id === selectedCompanyId)
  }, [selectedCompanyId, groups])

  // Filter groups: My Groups vs All Groups
  const filteredByOwnership = useMemo(() => {
    if (groupFilter === 'my') {
      // Show only groups from user's companies
      const userCompanyIds = companies.map(c => c.id)
      return groups.filter(g => g.company_id && userCompanyIds.includes(g.company_id))
    } else {
      // Show all groups
      return groups
    }
  }, [groups, companies, groupFilter])

  // Filter by search query
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return filteredByOwnership
    
    const query = searchQuery.toLowerCase()
    return filteredByOwnership.filter(group => {
      const company = companies.find(c => c.id === group.company_id)
      return (
        group.name.toLowerCase().includes(query) ||
        group.category?.toLowerCase().includes(query) ||
        group.target_city?.toLowerCase().includes(query) ||
        group.target_state?.toLowerCase().includes(query) ||
        company?.name.toLowerCase().includes(query)
      )
    })
  }, [filteredByOwnership, searchQuery, companies])

  // Apply advanced filters
  const filteredByAdvanced = useMemo(() => {
    let filtered = filteredBySearch

    // Member count filter
    if (memberCountRange.min || memberCountRange.max) {
      const min = memberCountRange.min ? parseInt(memberCountRange.min) : 0
      const max = memberCountRange.max ? parseInt(memberCountRange.max) : Infinity
      filtered = filtered.filter(g => {
        const size = g.audience_size || 0
        return size >= min && size <= max
      })
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(g => g.category && selectedCategories.includes(g.category))
    }

    // State filter
    if (selectedStates.length > 0) {
      filtered = filtered.filter(g => g.target_state && selectedStates.includes(g.target_state))
    }

    // Quality rating filter
    if (qualityRatingRange.min || qualityRatingRange.max) {
      const min = qualityRatingRange.min ? parseFloat(qualityRatingRange.min) : 0
      const max = qualityRatingRange.max ? parseFloat(qualityRatingRange.max) : 10
      filtered = filtered.filter(g => {
        const rating = g.quality_rating || 0
        return rating >= min && rating <= max
      })
    }

    // Privacy filter
    if (privacyFilter.length > 0) {
      filtered = filtered.filter(g => g.privacy && privacyFilter.includes(g.privacy))
    }

    return filtered
  }, [filteredBySearch, memberCountRange, selectedCategories, selectedStates, qualityRatingRange, privacyFilter])

  // Create display groups - show ALL global groups with "added" status
  const displayGroups = useMemo(() => {
    return globalGroups.map(globalGroup => {
      const isAdded = isGroupAdded(globalGroup.name)
      const userGroup = groups.find(g => g.name === globalGroup.name && g.company_id === selectedCompanyId)
      const company = userGroup ? companies.find(c => c.id === userGroup.company_id) : null
      
      return {
        id: globalGroup.id,
        name: globalGroup.name,
        category: globalGroup.category,
        target_city: globalGroup.location.city,
        target_state: globalGroup.location.state,
        privacy: globalGroup.privacy,
        quality_score: globalGroup.quality_score, // Keep original 0-100 scale
        audience_size: globalGroup.member_count,
        companyName: company?.name || '-',
        isAdded,
        globalGroupData: globalGroup
      }
    })
  }, [globalGroups, groups, companies, selectedCompanyId, isGroupAdded])
  
  // Filter display groups by "My Groups" vs "All Groups"
  const filteredByGroupFilter = useMemo(() => {
    if (groupFilter === 'my') {
      // Show only groups that are added to the selected company
      return displayGroups.filter(g => g.isAdded)
    } else {
      // Show all global groups
      return displayGroups
    }
  }, [displayGroups, groupFilter])

  // Filter display groups by search
  const filteredDisplayGroupsBySearch = useMemo(() => {
    if (!searchQuery) return filteredByGroupFilter
    const query = searchQuery.toLowerCase()
    return filteredByGroupFilter.filter(g => 
      g.name.toLowerCase().includes(query) ||
      g.category?.toLowerCase().includes(query) ||
      g.target_city?.toLowerCase().includes(query) ||
      g.target_state?.toLowerCase().includes(query)
    )
  }, [filteredByGroupFilter, searchQuery])

  // Apply advanced filters to display groups
  const filteredDisplayGroups = useMemo(() => {
    let filtered = filteredDisplayGroupsBySearch

    // Member count filter
    if (memberCountRange.min || memberCountRange.max) {
      const min = memberCountRange.min ? parseInt(memberCountRange.min) : 0
      const max = memberCountRange.max ? parseInt(memberCountRange.max) : Infinity
      filtered = filtered.filter(g => {
        const size = g.audience_size || 0
        return size >= min && size <= max
      })
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(g => g.category && selectedCategories.includes(g.category))
    }

    // State filter
    if (selectedStates.length > 0) {
      filtered = filtered.filter(g => g.target_state && selectedStates.includes(g.target_state))
    }

    // Quality rating filter (convert 0-100 scale to 1-10 for comparison)
    if (qualityRatingRange.min || qualityRatingRange.max) {
      const min = qualityRatingRange.min ? parseFloat(qualityRatingRange.min) : 0
      const max = qualityRatingRange.max ? parseFloat(qualityRatingRange.max) : 5
      filtered = filtered.filter(g => {
        // Convert quality_score (0-100) to 1-5 scale for filtering
        const rating = g.quality_score ? (g.quality_score / 20) : 0
        return rating >= min && rating <= max
      })
    }

    // Privacy filter
    if (privacyFilter.length > 0) {
      filtered = filtered.filter(g => g.privacy && privacyFilter.includes(g.privacy))
    }

    return filtered
  }, [filteredDisplayGroupsBySearch, memberCountRange, selectedCategories, selectedStates, qualityRatingRange, privacyFilter])

  // Sort display groups for table and card views
  const sortedDisplayGroups = useMemo(() => {
    if (!sortColumn) return filteredDisplayGroups

    return [...filteredDisplayGroups].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortColumn === 'company') {
        aValue = a.companyName
        bValue = b.companyName
      } else if (sortColumn === 'posts') {
        aValue = 0 // Global groups don't have post count
        bValue = 0
      } else {
        aValue = a[sortColumn as keyof typeof a]
        bValue = b[sortColumn as keyof typeof b]
      }

      // Handle null/undefined values
      if (aValue == null) aValue = ''
      if (bValue == null) bValue = ''

      // Sort comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection === 'asc' 
          ? (aValue > bValue ? 1 : -1)
          : (bValue > aValue ? 1 : -1)
      }
    })
  }, [filteredDisplayGroups, sortColumn, sortDirection])
  
  // Add computed data (company name, post count, health) - for user's own groups only
  const groupsWithData = useMemo(() => {
    return filteredByAdvanced.map(group => {
      const company = companies.find(c => c.id === group.company_id)
      const groupPosts = posts.filter(p => p.group_id === group.id)
      const health = calculateGroupHealth(group)
      
      return {
        ...group,
        companyName: company?.name || 'No Company',
        postsCount: groupPosts.length,
        health
      }
    })
  }, [filteredByAdvanced, companies, posts])

  // Sort groups
  const sortedGroups = useMemo(() => {
    if (!sortColumn) return groupsWithData

    return [...groupsWithData].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortColumn === 'company') {
        aValue = a.companyName
        bValue = b.companyName
      } else if (sortColumn === 'posts') {
        aValue = a.postsCount
        bValue = b.postsCount
      } else {
        aValue = a[sortColumn]
        bValue = b[sortColumn]
      }

      // Handle null/undefined values
      if (aValue == null) aValue = ''
      if (bValue == null) bValue = ''

      // Sort comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection === 'asc' 
          ? (aValue > bValue ? 1 : -1)
          : (bValue > aValue ? 1 : -1)
      }
    })
  }, [groupsWithData, sortColumn, sortDirection])

  const handleSort = (column: keyof Group | 'company' | 'posts') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId)
    navigate('/posts')
  }

  // Fetch global groups
  const fetchGlobalGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No token found, cannot fetch global groups')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/global-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Fetched global groups:', data.length)
        setGlobalGroups(Array.isArray(data) ? data : [])
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch global groups:', response.status, errorText)
        toast.error('Failed to load global groups')
      }
    } catch (error) {
      console.error('❌ Error fetching global groups:', error)
      toast.error('Error loading global groups. Please refresh the page.')
    }
  }, [])

  useEffect(() => {
    fetchGlobalGroups()
  }, [fetchGlobalGroups])

  // Show confirmation modal for adding group
  const handleAddGroupClick = (globalGroup: GlobalGroup) => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first')
      return
    }
    setGroupToAdd(globalGroup)
    setShowAddConfirmModal(true)
  }

  // Actually add the group after confirmation
  const confirmAddGroup = async () => {
    if (!groupToAdd || !selectedCompanyId) return

    setShowAddConfirmModal(false)
    setAddingGroupIds(prev => new Set(prev).add(groupToAdd.id))

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please log in to add groups')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/global-groups/${groupToAdd.id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company_id: selectedCompanyId })
      })

      if (response.ok) {
        toast.success(`Added "${groupToAdd.name}" to your groups!`)
        await refreshGroups()
        await fetchGlobalGroups() // Refresh to show the newly added group
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add group')
      }
    } catch (error) {
      console.error('Error adding group:', error)
      toast.error('Failed to add group')
    } finally {
      setAddingGroupIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(groupToAdd.id)
        return newSet
      })
      setGroupToAdd(null)
    }
  }

  // Handle delete globally button click
  const handleDeleteGloballyClick = async (globalGroup: GlobalGroup) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please log in')
      return
    }

    try {
      // Fetch impact data
      const response = await fetch(`${API_BASE_URL}/api/global-groups/${globalGroup.id}/impact`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const impact = await response.json()
        setDeleteImpact(impact)
        setGroupToDelete(globalGroup)
        setShowDeleteConfirmModal(true)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to fetch impact data')
      }
    } catch (error) {
      console.error('Error fetching impact:', error)
      toast.error('Failed to fetch impact data')
    }
  }

  // Confirm delete globally
  const confirmDeleteGlobally = async () => {
    if (!groupToDelete || !deleteImpact) return

    if (!deleteImpact.canDelete) {
      toast.error('This group is used by 5+ organizations and cannot be deleted')
      return
    }

    setIsDeletingGlobally(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please log in')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/global-groups/${groupToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Deleted "${groupToDelete.name}" globally. Affected ${result.affected.organizations} organizations and ${result.affected.posts} posts.`)
        
        // Refresh global groups and user's groups
        fetchGlobalGroups()
        await refreshGroups()
        
        setShowDeleteConfirmModal(false)
        setGroupToDelete(null)
        setDeleteImpact(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Failed to delete group')
    } finally {
      setIsDeletingGlobally(false)
    }
  }

  // Export functions
  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    const groupsToExport = selectedGroups.size > 0
      ? sortedGroups.filter(g => selectedGroups.has(g.id))
      : sortedGroups

    if (groupsToExport.length === 0) {
      toast.error('No groups selected to export')
      return
    }

    setIsExporting(true)
    setShowExportMenu(false)

    try {
      const formattedData = groupsToExport.map(group => 
        formatGroupForExport(group, group.companyName, group.postsCount, group.health.status)
      )

      const filename = `groups-export-${groupFilter === 'my' ? 'my' : 'all'}`

      // Small delay to show loading state for large exports
      await new Promise(resolve => setTimeout(resolve, 100))

      switch (format) {
        case 'csv':
          exportToCSV(formattedData, filename)
          break
        case 'json':
          exportToJSON(formattedData, filename)
          break
        case 'excel':
          exportToExcel(formattedData, filename)
          break
      }

      toast.success(`Exported ${groupsToExport.length} group${groupsToExport.length !== 1 ? 's' : ''} as ${format.toUpperCase()}`)
      
      // Reset selection after export
      if (selectedGroups.size > 0) {
        setSelectedGroups(new Set())
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedGroups.size === sortedGroups.length) {
      setSelectedGroups(new Set())
    } else {
      setSelectedGroups(new Set(sortedGroups.map(g => g.id)))
    }
  }

  const handleSelectGroup = (groupId: string) => {
    const newSelection = new Set(selectedGroups)
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId)
    } else {
      newSelection.add(groupId)
    }
    setSelectedGroups(newSelection)
  }

  // Check if all filters are cleared
  const hasActiveFilters = 
    memberCountRange.min || memberCountRange.max ||
    selectedCategories.length > 0 ||
    selectedStates.length > 0 ||
    qualityRatingRange.min || qualityRatingRange.max ||
    privacyFilter.length > 0

  const clearAllFilters = () => {
    setMemberCountRange({ min: '', max: '' })
    setSelectedCategories([])
    setSelectedStates([])
    setQualityRatingRange({ min: '', max: '' })
    setPrivacyFilter([])
    setHealthFilter([])
  }

  const getPrivacyBadge = (privacy?: string) => {
    if (!privacy) return null
    
    const styles = {
      public: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '🌐', label: 'Public' },
      private: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: '🔒', label: 'Private' },
      closed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '🔐', label: 'Closed' }
    }
    
    const style = styles[privacy as keyof typeof styles] || styles.public
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${style.bg} ${style.text}`}>
        <span className="mr-1">{style.icon}</span>
        <span>{style.label}</span>
      </span>
    )
  }

  const getHealthBadge = (health: ReturnType<typeof calculateGroupHealth>) => {
    const color = health.color
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs capitalize" style={{ color }}>
          {health.status}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 md:p-6" style={{ backgroundColor: 'var(--carbon-black)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Discover Groups
              </h1>
              <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Browse and add groups from our curated database
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-[#EAB308] hover:bg-[#D97706] text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <InlineSpinner />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Export</span>
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
                
                {showExportMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
                      <div className="py-1">
                        <button
                          onClick={() => handleExport('csv')}
                          className="w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport('excel')}
                          className="w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Export as Excel
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Export as JSON
                        </button>
                      </div>
                      {selectedGroups.size > 0 && (
                        <div className="border-t px-4 py-1.5 text-xs" style={{ borderColor: 'var(--border-neutral)', color: 'var(--text-secondary)' }}>
                          Exporting {selectedGroups.size} selected {selectedGroups.size === 1 ? 'group' : 'groups'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* My Groups / All Groups Toggle */}
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1 p-1 rounded-lg w-full sm:w-auto" 
                style={{ 
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', 
                  border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db'
                }}
              >
                <button
                  onClick={() => setGroupFilter('my')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded text-xs font-medium transition-colors flex-1 sm:flex-initial ${
                    groupFilter === 'my' 
                      ? 'bg-[#336699] text-white' 
                      : isDarkMode 
                        ? 'text-white/60 hover:text-white'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ minWidth: '120px' }}
                >
                  My Groups ({selectedCompanyId ? groups.filter(g => g.company_id === selectedCompanyId).length : 0})
                </button>
                <button
                  onClick={() => setGroupFilter('all')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded text-xs font-medium transition-colors flex-1 sm:flex-initial ${
                    groupFilter === 'all' 
                      ? 'bg-[#336699] text-white' 
                      : isDarkMode 
                        ? 'text-white/60 hover:text-white'
                        : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  All ({globalGroups.length})
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 relative min-w-0">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                size={16}
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full h-10 sm:h-10 pl-10 pr-4 rounded-lg text-sm"
                style={{ 
                  backgroundColor: isDarkMode ? '#242424' : '#ffffff', 
                  border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db', 
                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.95)'
                }}
              />
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors h-10 sm:h-auto ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-[#336699] text-white'
                  : isDarkMode
                    ? 'bg-[#1a1a1a] text-white/60 border border-[#555555]'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {hasActiveFilters && <span className="mr-1">●</span>}
              Advanced Filters
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div 
              className="mt-4 p-3 md:p-4 rounded-lg shadow-sm overflow-x-auto" 
              style={{ 
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', 
                border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db',
                boxShadow: isDarkMode ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)' }}>Advanced Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs hover:text-[#336699] transition-colors"
                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}
                  >
                    <X size={14} />
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Member Count Range */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                    Member Count
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={memberCountRange.min}
                      onChange={(e) => setMemberCountRange({ ...memberCountRange, min: e.target.value })}
                      placeholder="Min"
                      className="w-full h-9 px-3 rounded text-sm"
                      style={{ 
                        backgroundColor: isDarkMode ? '#242424' : '#ffffff', 
                        border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db', 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.95)'
                      }}
                    />
                    <span className="text-xs" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>to</span>
                    <input
                      type="number"
                      value={memberCountRange.max}
                      onChange={(e) => setMemberCountRange({ ...memberCountRange, max: e.target.value })}
                      placeholder="Max"
                      className="w-full h-9 px-3 rounded text-sm"
                      style={{ 
                        backgroundColor: isDarkMode ? '#242424' : '#ffffff', 
                        border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db', 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.95)'
                      }}
                    />
                  </div>
                </div>

                {/* Category Multi-Select */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          if (selectedCategories.includes(cat)) {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat))
                          } else {
                            setSelectedCategories([...selectedCategories, cat])
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedCategories.includes(cat)
                            ? 'bg-[#336699] text-white'
                            : isDarkMode
                              ? 'bg-white/5 text-white/60 hover:bg-white/10'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Multi-Select */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                    State
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {uniqueStates.map(state => (
                      <button
                        key={state}
                        onClick={() => {
                          if (selectedStates.includes(state)) {
                            setSelectedStates(selectedStates.filter(s => s !== state))
                          } else {
                            setSelectedStates([...selectedStates, state])
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedStates.includes(state)
                            ? 'bg-[#336699] text-white'
                            : isDarkMode
                              ? 'bg-white/5 text-white/60 hover:bg-white/10'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Rating Range */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                    Quality Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={qualityRatingRange.min}
                      onChange={(e) => setQualityRatingRange({ ...qualityRatingRange, min: e.target.value })}
                      placeholder="Min"
                      className="w-full h-9 px-3 rounded text-sm"
                      style={{ 
                        backgroundColor: isDarkMode ? '#242424' : '#ffffff', 
                        border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db', 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.95)'
                      }}
                    />
                    <span className="text-xs" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>to</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={qualityRatingRange.max}
                      onChange={(e) => setQualityRatingRange({ ...qualityRatingRange, max: e.target.value })}
                      placeholder="Max"
                      className="w-full h-9 px-3 rounded text-sm"
                      style={{ 
                        backgroundColor: isDarkMode ? '#242424' : '#ffffff', 
                        border: isDarkMode ? '1px solid #555555' : '1px solid #d1d5db', 
                        color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.95)'
                      }}
                    />
                  </div>
                </div>

                {/* Privacy Filter */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
                    Privacy
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['public', 'private', 'closed'].map(privacy => (
                      <button
                        key={privacy}
                        onClick={() => {
                          if (privacyFilter.includes(privacy)) {
                            setPrivacyFilter(privacyFilter.filter(p => p !== privacy))
                          } else {
                            setPrivacyFilter([...privacyFilter, privacy])
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors capitalize ${
                          privacyFilter.includes(privacy)
                            ? 'bg-[#336699] text-white'
                            : isDarkMode
                              ? 'bg-white/5 text-white/60 hover:bg-white/10'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {privacy}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Selection Summary Banner */}
        {selectedGroups.size > 0 && (
          <div className="mb-4 p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: '#60A5FA' }}>
                {selectedGroups.size} {selectedGroups.size === 1 ? 'group' : 'groups'} selected
              </span>
            </div>
            <button
              onClick={() => setSelectedGroups(new Set())}
              className="text-xs hover:text-[#336699] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
          <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-medium)', borderBottom: '1px solid var(--border-neutral)' }}>
                    <th className="px-2 md:px-4 py-1.5 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-medium uppercase tracking-wide hover:text-[#336699] transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span className="hidden sm:inline">Group </span>Name
                        {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </button>
                    </th>
                    <th className="px-4 py-1.5 text-left min-w-[120px]">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide hover:text-[#336699] transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Category
                        {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </button>
                    </th>
                    <th className="px-4 py-1.5 text-left">
                      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Location
                      </span>
                    </th>
                    <th className="px-4 py-1.5 text-left">
                      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Privacy
                      </span>
                    </th>
                    <th className="px-4 py-1.5 text-left">
                      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Quality
                      </span>
                    </th>
                    <th className="px-4 py-1.5 text-left">
                      <button
                        onClick={() => handleSort('audience_size')}
                        className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide hover:text-[#336699] transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Members
                        {sortColumn === 'audience_size' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </button>
                    </th>
                    <th className="px-4 py-1.5 text-center">
                      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Link
                      </span>
                    </th>
                    <th className="px-4 py-1.5 text-center">
                      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Added
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDisplayGroups.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {searchQuery 
                            ? 'No groups match your search' 
                            : groupFilter === 'my' 
                              ? 'No groups added yet. Click "All" to browse available groups.' 
                              : 'No groups found'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedDisplayGroups.map((group) => (
                      <tr
                        key={group.id}
                        className="group/row hover:bg-white/5 transition-colors border-b border-white/5"
                      >
                        <td className="px-4 py-1.5">
                          <div className="font-medium text-sm inline" style={{ color: 'var(--text-primary)' }}>
                            {group.name}
                            {(() => {
                              const currentUserId = getCurrentUserId()
                              const isContributor = group.globalGroupData?.contributed_by === currentUserId || group.globalGroupData?.contributed_by === 'system'
                              
                              return isContributor && (
                                <span className="inline-flex items-center gap-1 ml-2 align-middle">
                                  <span className="relative group/tooltip inline-block">
                                    <Award 
                                      size={14} 
                                      style={{ color: '#FCD34D' }}
                                      className="cursor-help inline-block"
                                    />
                                    <span 
                                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50"
                                      style={{
                                        backgroundColor: 'rgba(251, 191, 36, 0.95)',
                                        color: '#000000',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                      }}
                                    >
                                      You contributed this group
                                      <span 
                                        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                                        style={{
                                          borderLeft: '4px solid transparent',
                                          borderRight: '4px solid transparent',
                                          borderTop: '4px solid rgba(251, 191, 36, 0.95)'
                                        }}
                                      />
                                    </span>
                                  </span>
                                  {group.globalGroupData && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteGloballyClick(group.globalGroupData!)
                                      }}
                                      className="inline-flex items-center justify-center p-1 rounded transition-all duration-200 opacity-0 group-hover/row:opacity-40 hover:!opacity-100 align-middle"
                                      style={{
                                        color: 'var(--text-secondary)'
                                      }}
                                      title="Delete this group from the global database"
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#EF4444'
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-secondary)'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </span>
                              )
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-1.5 min-w-[120px]">
                          {group.category && (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap" 
                              style={{ 
                                backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                                color: '#60A5FA',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                              }}
                              title={group.category}
                            >
                              {group.category}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-1.5">
                          {(group.target_city || group.target_state) && (
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {group.target_city}{group.target_city && group.target_state ? ', ' : ''}{group.target_state}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap">
                          {getPrivacyBadge(group.privacy)}
                        </td>
                        <td className="px-4 py-1.5">
                          {group.quality_score !== undefined && (
                            <span className="text-yellow-400">
                              {'⭐'.repeat(Math.min(Math.round(group.quality_score / 20), 5))}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-1.5">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {group.audience_size?.toLocaleString() || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-1.5 text-center">
                          {group.globalGroupData?.facebook_url ? (
                            <a
                              href={group.globalGroupData.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors"
                              title="View on Facebook"
                            >
                              <ExternalLink size={16} style={{ color: '#3B82F6' }} />
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>-</span>
                          )}
                        </td>
                        <td className="px-4 py-1.5 text-center">
                          {group.isAdded ? (
                            <div className="flex items-center justify-center gap-1 text-green-400">
                              <CheckCircle2 size={16} />
                              <span className="text-xs font-medium">Added</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddGroupClick(group.globalGroupData)
                              }}
                              disabled={addingGroupIds.has(group.id)}
                              className="flex items-center justify-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                              style={{
                                backgroundColor: '#EAB308',
                                color: '#000000'
                              }}
                            >
                              {addingGroupIds.has(group.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent"></div>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus size={14} />
                                  Add
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        {/* Add Group Confirmation Modal */}
        {showAddConfirmModal && groupToAdd && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-md rounded-lg p-6"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Add Group to Your Organization?
              </h2>

              {/* Group Preview */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-medium)', border: '1px solid var(--border-neutral)' }}>
                <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
                  {groupToAdd.name}
                </h3>
                
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{groupToAdd.location.city}, {groupToAdd.location.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{groupToAdd.member_count.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">
                      {'⭐'.repeat(Math.min(Math.round(groupToAdd.quality_score / 20), 5))}
                    </span>
                    <span>Quality Score: {groupToAdd.quality_score}</span>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: '#60A5FA' }}>
                  This group will be added to:
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  • {companies.find(c => c.id === selectedCompanyId)?.name}
                </p>
                <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                  You'll be able to create and schedule posts to this group from your dashboard.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddConfirmModal(false)
                    setGroupToAdd(null)
                  }}
                  className="flex-1 px-4 py-1.5 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-neutral)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddGroup}
                  className="flex-1 px-4 py-1.5 rounded text-sm font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: '#EAB308',
                    color: '#000000'
                  }}
                >
                  Add Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Globally Confirmation Modal */}
        {showDeleteConfirmModal && groupToDelete && deleteImpact && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-lg p-6"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#EF4444' }}>
                ⚠️ Delete "{groupToDelete.name}" Globally?
              </h2>

              {/* Impact Warning */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-sm font-bold mb-3" style={{ color: '#EF4444' }}>
                  This group is currently being used:
                </p>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <div className="flex items-center gap-2">
                    <span>🏢</span>
                    <span>{deleteImpact.organizationsUsing} {deleteImpact.organizationsUsing === 1 ? 'organization' : 'organizations'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{deleteImpact.scheduledPosts} scheduled {deleteImpact.scheduledPosts === 1 ? 'post' : 'posts'}</span>
                  </div>
                </div>
                
                {deleteImpact.organizations.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Organizations using this group:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {deleteImpact.organizations.map(org => (
                        <span 
                          key={org.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
                        >
                          {org.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What Will Happen */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-medium)', border: '1px solid var(--border-neutral)' }}>
                <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  This action will:
                </p>
                <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li>❌ Remove from global discovery database</li>
                  <li>❌ Remove from all {deleteImpact.organizationsUsing} {deleteImpact.organizationsUsing === 1 ? 'organization' : 'organizations'}</li>
                  {deleteImpact.scheduledPosts > 0 && (
                    <li>❌ Cancel {deleteImpact.scheduledPosts} scheduled {deleteImpact.scheduledPosts === 1 ? 'post' : 'posts'}</li>
                  )}
                </ul>
                <p className="text-xs font-bold mt-3" style={{ color: '#EF4444' }}>
                  ⚠️ THIS CANNOT BE UNDONE
                </p>
              </div>

              {/* Cannot Delete Warning */}
              {!deleteImpact.canDelete && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  <p className="text-sm font-medium" style={{ color: '#FCD34D' }}>
                    🛡️ This group is used by 5+ organizations and cannot be deleted. Contact support if you need assistance.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false)
                    setGroupToDelete(null)
                    setDeleteImpact(null)
                  }}
                  className="flex-1 px-4 py-1.5 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-neutral)',
                    color: 'var(--text-secondary)'
                  }}
                  disabled={isDeletingGlobally}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteGlobally}
                  disabled={!deleteImpact.canDelete || isDeletingGlobally}
                  className="flex-1 px-4 py-1.5 rounded text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#ffffff'
                  }}
                >
                  {isDeletingGlobally ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

