import { useState, useEffect, useRef } from 'react'
import { Plus, X, Send, AlertTriangle, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { List } from 'react-window'
import type { Company, Group, Post } from '../types/database'
import { calculateGroupHealth } from '../utils/groupHealth'
import { API_BASE_URL } from '../config/api'
import { InlineSpinner } from './LoadingSpinner'

interface InlinePostComposerProps {
  companies: Company[]
  groups: Group[]
  posts: Post[]
  selectedCompanyId: string | null
  selectedGroupId?: string | null
  editingPost?: Post | null
  onPostCreated: (post: any, showToast?: boolean) => Promise<any>
  onPostUpdated?: (id: string, updates: any) => void
  onCancelEdit?: () => void
  onClose?: () => void
  isDarkMode?: boolean
}

export default function InlinePostComposer({ 
  companies, 
  groups, 
  posts,
  selectedCompanyId,
  selectedGroupId,
  editingPost,
  onPostCreated,
  onPostUpdated,
  onCancelEdit,
  isDarkMode = true
}: InlinePostComposerProps) {
  const navigate = useNavigate()
  const composerRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [selectedPostType, setSelectedPostType] = useState('value_post')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  
  // Helper function to calculate real-time group health based on actual posted posts
  const getGroupHealthWithRealData = (group: Group) => {
    const groupPosts = posts.filter(p => p.group_id === group.id)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const postedPosts = groupPosts.filter(p => p.status === 'posted')
    const postsThisWeek = postedPosts.filter(p => {
      const postDate = new Date(p.created_at || p.posted_at || Date.now())
      return postDate >= oneWeekAgo
    }).length
    
    const lastPostedPost = postedPosts.length > 0
      ? postedPosts.reduce((latest, post) => {
          const postDate = new Date(post.posted_at || post.created_at || 0)
          const latestDate = new Date(latest.posted_at || latest.created_at || 0)
          return postDate > latestDate ? post : latest
        })
      : null
    
    const groupWithUpdatedData = {
      ...group,
      posts_this_week: postsThisWeek,
      last_post_date: lastPostedPost ? (lastPostedPost.posted_at || lastPostedPost.created_at) : undefined
    }
    
    return calculateGroupHealth(groupWithUpdatedData)
  }
  const [createdPost, setCreatedPost] = useState<any>(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [isDuplicating, setIsDuplicating] = useState(false)
  
  // Undo functionality for bulk operations
  const [recentBulkPosts, setRecentBulkPosts] = useState<Array<{ id: string, groupName: string }>>([])
  const [showUndoBanner, setShowUndoBanner] = useState(false)
  const [isUndoing, setIsUndoing] = useState(false)
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  
  const isEditMode = !!editingPost

  // Auto-suggest post type based on content
  const suggestPostType = (text: string) => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('save') || lowerText.includes('money') || lowerText.includes('cost')) return 'cost_saver'
    if (lowerText.includes('tip') || lowerText.includes('quick')) return 'quick_tip'
    if (lowerText.includes('warning') || lowerText.includes('alert') || lowerText.includes('danger')) return 'warning_post'
    if (lowerText.includes('diy') || lowerText.includes('how to') || lowerText.includes('guide')) return 'diy_guide'
    if (lowerText.includes('story') || lowerText.includes('experience')) return 'personal_story'
    if (lowerText.includes('offer') || lowerText.includes('deal') || lowerText.includes('special')) return 'special_offer'
    return 'value_post'
  }

  // Pre-fill form when editing a post
  useEffect(() => {
    if (editingPost) {
      setIsExpanded(true)
      
      // Clean up old "Generated:" lines from content
      let cleanContent = editingPost.content || ''
      cleanContent = cleanContent.replace(/^[^\n]*Generated:[^\n]*\n\n?/i, '') // Remove "Generated: ..." line at start
      
      setContent(cleanContent)
      setSelectedPostType(editingPost.post_type)
      
      // Scroll to composer
      if (composerRef.current) {
        composerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [editingPost])

  // Auto-suggest groups when post type changes (only in create mode)
  // Auto-recommendation removed - posts go to the currently selected group only

  // Auto-suggest post type when content changes (only in create mode)
  useEffect(() => {
    if (!isEditMode && content.length > 20) {
      const suggested = suggestPostType(content)
      setSelectedPostType(suggested)
    }
  }, [content, isEditMode])


  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }, [])

  // Start undo timer (30 seconds)
  const startUndoTimer = (posts: Array<{ id: string, groupName: string }>) => {
    setRecentBulkPosts(posts)
    setShowUndoBanner(true)
    
    // Clear any existing timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
    }
    
    // Hide banner after 30 seconds
    undoTimerRef.current = setTimeout(() => {
      setShowUndoBanner(false)
      setRecentBulkPosts([])
    }, 30000)
  }

  // Handle bulk undo
  const handleBulkUndo = async () => {
    if (recentBulkPosts.length === 0 || isUndoing) return
    
    setIsUndoing(true)
    const count = recentBulkPosts.length
    let deletedCount = 0
    
    try {
      for (const post of recentBulkPosts) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          if (response.ok) deletedCount++
        } catch (error) {
          console.error(`Failed to delete post from ${post.groupName}:`, error)
        }
      }
      
      if (deletedCount === count) {
        toast.success(`🎉 Undone! Deleted ${count} post${count !== 1 ? 's' : ''}`)
      } else if (deletedCount > 0) {
        toast.success(`⚠️ Deleted ${deletedCount}/${count} posts`)
      } else {
        toast.error('Failed to undo posts. Please delete manually.')
      }
      
      // Force refresh by reloading the page
      window.location.reload()
    } catch (error) {
      toast.error('Failed to undo. Please try again.')
    } finally {
      setIsUndoing(false)
      setShowUndoBanner(false)
      setRecentBulkPosts([])
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }

  const handleSavePost = async () => {
    if (!content.trim() || !selectedGroupId) return

    setIsGenerating(true)
    
    try {
      if (isEditMode && editingPost && onPostUpdated) {
        // Update existing post
        const updates = {
          title: content.substring(0, 50) + '...',
          content: content.trim(),
          post_type: selectedPostType,
          group_id: selectedGroupId // Keep the same group
        }
        
        await onPostUpdated(editingPost.id, updates)
        
        // Reset form
        setContent('')
        setIsExpanded(false)
        
        if (onCancelEdit) onCancelEdit()
      } else {
        // Create new post for the current group
        if (!selectedGroupId) {
          console.error('No group selected')
          return
        }

        const newPost = {
          company_id: selectedCompanyId,
          group_id: selectedGroupId,
          post_type: selectedPostType,
          title: content.substring(0, 50) + '...',
          content: content.trim(),
          status: 'draft' as const,
          leads_count: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Create post
        await onPostCreated(newPost)
        
        // Store created post and show duplicate modal
        setCreatedPost(newPost)
        setShowDuplicateModal(true)

        // Reset form
        setContent('')
        setIsExpanded(false)
      }
      
    } catch (error) {
      console.error('Error saving post:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleCancel = () => {
    setContent('')
    setIsExpanded(false)
    if (isEditMode && onCancelEdit) {
      onCancelEdit()
    }
  }


  const selectedCompany = companies?.find(c => c.id === selectedCompanyId)

  if (!selectedCompanyId) {
    return (
      <div className="rounded p-4 mb-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus size={20} className="text-white" />
          </div>
          <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Select a Company First</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose a company from the sidebar to start creating posts</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={composerRef} className="rounded-lg mb-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: '#EAB308' }}
              title="Create new post"
            >
              <Plus size={18} className="text-black" />
            </button>
            <input
              type="text"
              placeholder={`What's on your mind, ${selectedCompany?.name}? Start typing to create a post...`}
              className="flex-1 border-none outline-none text-sm h-10"
              style={{ 
                backgroundColor: 'var(--post-composer-bg)', 
                color: 'var(--post-composer-text)',
                border: '1px solid var(--post-composer-border)',
                borderRadius: '8px',
                padding: '0 16px'
              }}
              onFocus={() => setIsExpanded(true)}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Expanded State - Full Screen Modal Overlay */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleCancel}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4">
            <div 
              className={`w-full ${isEditMode ? 'h-auto sm:max-h-[80vh]' : 'h-full sm:h-[90vh]'} ${isEditMode ? 'sm:max-w-3xl' : 'sm:max-w-5xl'} overflow-y-auto sm:rounded-lg shadow-2xl`}
              style={{ backgroundColor: 'var(--card-bg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-neutral)' }}>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  {isEditMode ? 'Edit Post' : 'Create New Post'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>for {selectedCompany?.name}</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
              title="Close composer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Manual Post Composer */}
          <div>
              {/* Simple Manual Composer */}
              {!isEditMode && !content && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4" style={{ 
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-neutral)'
                  }}>
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare size={20} style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Write Your Post
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Type your post content below, or use{' '}
                                      <button
                            onClick={() => navigate('/post-creation')}
                            className="text-[#EAB308] hover:underline bg-transparent border-none p-0 cursor-pointer"
                            style={{ textDecoration: 'underline' }}
                          >
                            AI Generation
                          </button>{' '}
                          for AI-powered posts
                                            </p>
                                          </div>
                                        </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`What's on your mind, ${selectedCompany?.name}? Start typing to create a post...`}
                      className="w-full min-h-[200px] px-4 py-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#336699]/40 transition-all resize-none"
                                        style={{ 
                        backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-neutral)',
                        color: 'var(--text-primary)'
                              }}
                    />
                          </div>
                          </div>
              )}

              {/* Content Editor (shown when editing or when content exists) */}
              {(isEditMode || content) && (
              <div className="space-y-4">

          {/* Content Input */}
          <div className="flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${selectedCompany?.name}? Start typing to create a post...`}
              className={`w-full ${isEditMode ? 'min-h-[200px]' : 'min-h-[300px] flex-1'} px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#336699]/40 transition-all resize-none`}
              style={{
                backgroundColor: 'var(--input-bg)',
                border: content.length > 2000 ? '1px solid #dc2626' : content.length > 1500 ? '1px solid #f59e0b' : '1px solid var(--input-border)',
                color: 'var(--text-primary)'
              }}
            />
            {/* Character Count */}
            <div className="mt-2 text-right">
              <span className="text-xs" style={{ color: content.length > 2000 ? '#dc2626' : content.length > 1500 ? '#f59e0b' : 'var(--text-secondary)' }}>
                {content.length}/2000
              </span>
            </div>
          </div>

          {/* Posting To - Simple info showing current group */}
            <div>
                  {selectedGroupId ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  Posting to:
                </span>
                <span 
                  className="text-sm font-medium flex-1" 
                  style={{ 
                    color: 'var(--text-primary)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflow: 'visible'
                  }}
                  title={groups.find(g => g.id === selectedGroupId)?.name || 'Unknown Group'}
                >
                  {groups.find(g => g.id === selectedGroupId)?.name || 'Unknown Group'}
                </span>
              </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 rounded" style={{ backgroundColor: isDarkMode ? '#FEF3C7' : '#FEF3C7', border: '1px solid #FCD34D' }}>
                      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">Select a group to post to</p>
                        <p className="text-xs text-amber-700">Choose a group from the sidebar to enable posting</p>
              </div>
            </div>
          )}
                </div>
              </div>
              )}
              {/* End Content Editor */}

            </div>
            {/* End Layout */}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 mt-4" style={{ borderTop: '1px solid var(--border-neutral)' }}>
            <button
              onClick={handleCancel}
              className="px-4 h-10 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
              style={{ 
                backgroundColor: 'transparent',
                border: '1px solid var(--border-neutral)',
                color: 'var(--text-secondary)' 
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSavePost}
              disabled={!content.trim() || !selectedGroupId || isGenerating}
              className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed hover:opacity-90"
              style={{
                backgroundColor: (!content.trim() || !selectedGroupId || isGenerating) ? 'var(--input-bg)' : '#EAB308',
                color: (!content.trim() || !selectedGroupId || isGenerating) ? 'var(--text-secondary)' : '#000000',
                opacity: (!content.trim() || !selectedGroupId || isGenerating) ? 0.5 : 1
              }}
            >
              {isGenerating ? (
                <>
                  <InlineSpinner />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{isEditMode ? 'Update Post' : 'Create Post'}</span>
                </>
              )}
            </button>
          </div>
            {/* End Action Buttons */}

        </div>
          {/* End p-6 padding div */}
        </div>
        {/* End max-w-6xl modal container */}
      </div>
      {/* End fixed z-[110] modal wrapper */}
    </>
  )}
  {/* End isExpanded conditional */}

      {/* Duplicate to Other Groups Modal */}
      {showDuplicateModal && createdPost && (() => {
        const availableGroups = groups.filter(g => g.company_id === selectedCompanyId && g.id !== selectedGroupId)
        // Only include safe groups (non-at-risk) for "Select All"
        const safeGroups = availableGroups.filter(g => {
          const health = getGroupHealthWithRealData(g)
          return health.status !== 'danger'
        })
        const allGroupIds = safeGroups.map(g => g.id)
        const allSelected = selectedGroupIds.length === safeGroups.length && safeGroups.length > 0
        
        return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="w-full h-full sm:h-auto sm:rounded-lg sm:max-w-2xl sm:max-h-[85vh] flex flex-col shadow-2xl"
            style={{ 
              backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
              border: '1px solid var(--border-neutral)',
              opacity: 1
            }}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-neutral)' }}>
                <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    ✅ Post Created Successfully!
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Duplicate this post to other groups?
                  </p>
                </div>
                <button
                  onClick={() => {
                      if (isDuplicating) return // Prevent closing during duplication
                    setShowDuplicateModal(false)
                    setCreatedPost(null)
                      setSelectedGroupIds([])
                  }}
                    disabled={isDuplicating}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>
                
                {/* Select All / None */}
                {availableGroups.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedGroupIds(allSelected ? [] : allGroupIds)
                    }}
                    className="text-sm font-medium px-4 h-10 rounded-lg transition-all hover:opacity-90"
                    style={{ 
                      backgroundColor: '#EAB308',
                      color: '#000000',
                      border: 'none'
                    }}
                  >
                    {allSelected ? '✓ Deselect All' : `Select All Safe Groups (${safeGroups.length})`}
                  </button>
                )}
            </div>

              {/* Warning for 20+ Groups */}
              {selectedGroupIds.length >= 20 && (
                <div className="mx-4 sm:mx-6 mb-2 p-3 rounded-lg border-2 border-yellow-500/40 bg-yellow-500/10 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-500 mb-1">
                      ⚠️ Posting to {selectedGroupIds.length} Groups at Once
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Large bulk posts can trigger spam detection on Facebook. Consider splitting into smaller batches (10-15 groups) if possible.
                    </p>
                  </div>
                </div>
              )}

            {/* Groups List - Scrollable */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2">
                <List
                  defaultHeight={500}
                  rowCount={availableGroups.length}
                  rowHeight={85}
                  rowProps={{}}
                  rowComponent={({ index, style }) => {
                    const group = availableGroups[index]
                    const health = getGroupHealthWithRealData(group)
                    const isAtRisk = health.status === 'danger'
                    const isSelected = selectedGroupIds.includes(group.id)
                    const isBlocked = isAtRisk // Block at-risk groups
                    
                    return (
                      <div style={style} className="px-0 pb-2">
                        <label
                        key={group.id}
                          className={`p-2.5 rounded-lg transition-all relative ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}
                        style={{ 
                          backgroundColor: 'var(--input-bg)',
                            border: `2px solid ${isSelected ? health.color : 'var(--border-neutral)'}`,
                            display: 'block'
                          }}
                        >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isBlocked}
                            onChange={(e) => {
                              if (isBlocked) return
                              if (e.target.checked) {
                                setSelectedGroupIds([...selectedGroupIds, group.id])
                              } else {
                                setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id))
                              }
                            }}
                            className={`mt-1 w-4 h-4 rounded ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ accentColor: health.color }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{health.icon}</span>
                              <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {group.name}
                              </h3>
                              {isBlocked && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-500 border border-red-500/30">
                                  ⛔ Too Risky
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {health.postsThisWeek}/3 posts this week
                              {health.daysSinceLastPost !== null && ` · Last posted ${health.daysSinceLastPost} days ago`}
                            </p>
                          </div>
                        </div>
                        </label>
                      </div>
                    )
                  }}
                />
              
                {availableGroups.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No other groups available for this company
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
              <div className="p-4 sm:p-6 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3" style={{ borderColor: 'var(--border-neutral)' }}>
              <button
                onClick={() => {
                    if (isDuplicating) return // Prevent closing during duplication
                  setShowDuplicateModal(false)
                  setCreatedPost(null)
                    setSelectedGroupIds([])
                }}
                  disabled={isDuplicating}
                  className="flex-1 px-4 h-10 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-neutral)'
                }}
              >
                  Skip
                </button>
                
                <button
                  onClick={async () => {
                    if (selectedGroupIds.length === 0 || isDuplicating) return
                    
                    setIsDuplicating(true) // Disable button immediately
                    
                    const count = selectedGroupIds.length
                    let successCount = 0
                    const failedGroups: Array<{ name: string, error: string }> = []
                    const createdPosts: Array<{ id: string, groupName: string }> = []
                    
                    try {
                      // Duplicate to all selected groups (suppress individual toasts)
                      for (const groupId of selectedGroupIds) {
                        const group = groups.find(g => g.id === groupId)
                        const duplicatePost = {
                          ...createdPost,
                          group_id: groupId,
                          created_at: new Date().toISOString()
                        }
                        
                        try {
                          const result = await onPostCreated(duplicatePost, false) // Don't show individual toasts
                          if (result) {
                            successCount++
                            createdPosts.push({ 
                              id: result.id, 
                              groupName: group?.name || 'Unknown Group' 
                            })
                          } else {
                            failedGroups.push({ 
                              name: group?.name || 'Unknown Group', 
                              error: 'Failed to save post' 
                            })
                          }
                        } catch (error) {
                          failedGroups.push({ 
                            name: group?.name || 'Unknown Group', 
                            error: error instanceof Error ? error.message : 'Unknown error' 
                          })
                        }
                      }
                      
                      // Show detailed feedback
                      if (successCount === count) {
                        toast.success(`🎉 Post duplicated to ${count} group${count !== 1 ? 's' : ''} successfully!`)
                        // Start undo timer if 2+ posts were created
                        if (createdPosts.length >= 2) {
                          startUndoTimer(createdPosts)
                        }
                      } else if (successCount > 0) {
                        // Some succeeded, some failed
                        const failedList = failedGroups.map(f => `• ${f.name}: ${f.error}`).join('\n')
                        toast.error(
                          `⚠️ ${successCount}/${count} posts created.\n\nFailed groups:\n${failedList}`,
                          { duration: 8000 }
                        )
                        // Start undo timer for successfully created posts (if 2+)
                        if (createdPosts.length >= 2) {
                          startUndoTimer(createdPosts)
                        }
                      } else {
                        // All failed
                        const failedList = failedGroups.slice(0, 3).map(f => `• ${f.name}`).join('\n')
                        const moreCount = failedGroups.length > 3 ? `\n...and ${failedGroups.length - 3} more` : ''
                        toast.error(
                          `❌ Failed to duplicate posts:\n${failedList}${moreCount}\n\nPlease try again or check your connection.`,
                          { duration: 6000 }
                        )
                      }
                    } finally {
                      setIsDuplicating(false)
                      setShowDuplicateModal(false)
                      setCreatedPost(null)
                      setSelectedGroupIds([])
                    }
                  }}
                  disabled={selectedGroupIds.length === 0 || isDuplicating}
                  className="flex-1 px-4 h-10 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ 
                    backgroundColor: (selectedGroupIds.length > 0 && !isDuplicating) ? '#EAB308' : 'var(--input-bg)',
                    color: (selectedGroupIds.length > 0 && !isDuplicating) ? '#000000' : 'var(--text-disabled)',
                    border: (selectedGroupIds.length > 0 && !isDuplicating) ? 'none' : '1px solid var(--border-neutral)'
                  }}
                >
                  {isDuplicating ? (
                    <>
                      <InlineSpinner />
                      <span>Duplicating...</span>
                    </>
                  ) : (
                    `Duplicate to ${selectedGroupIds.length} Group${selectedGroupIds.length !== 1 ? 's' : ''}`
                  )}
              </button>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Floating Undo Banner (Bottom of Screen) */}
      {showUndoBanner && recentBulkPosts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div 
            className="rounded-lg shadow-2xl border-2 border-yellow-500/40 p-4 flex items-center gap-4 min-w-[400px]"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                ⚡ {recentBulkPosts.length} posts created
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Accidentally posted to the wrong groups?
              </p>
            </div>
            
            <button
              onClick={handleBulkUndo}
              disabled={isUndoing}
              className="px-4 py-2 rounded font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
              style={{ 
                backgroundColor: '#EF4444',
                color: '#FFFFFF'
              }}
            >
              {isUndoing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Undoing...</span>
                </>
              ) : (
                <>
                  <X size={16} />
                  <span>Undo All</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowUndoBanner(false)
                setRecentBulkPosts([])
                if (undoTimerRef.current) {
                  clearTimeout(undoTimerRef.current)
                }
              }}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
