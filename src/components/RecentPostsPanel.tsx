import React, { useState, useEffect } from 'react'
import { Clock, Users, ChevronRight, ChevronLeft } from 'lucide-react'
import type { Post, Group, Company } from '../types/database'

// Function to map post status to tab name
const getStatusTab = (status: string): string => {
  const statusToTab: Record<string, string> = {
    'draft': 'draft',
    'ready_to_post': 'ready',
    'pending_approval': 'pending',
    'posted': 'posted',
    'leads_collected': 'scheduled'
  }
  return statusToTab[status] || 'draft'
}

interface RecentPostsPanelProps {
  posts: Post[]
  groups: Group[]
  companies: Company[]
  selectedCompanyId: string | null
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
  onSelectGroup: (groupId: string) => void
}

interface RecentPost {
  id: string
  title: string
  content: string
  post_type: string
  status: string
  created_at: string
  group_id: string
  group_name: string
  company_id: string
}

const postTypeLabels: Record<string, string> = {
  value_post: 'Value Post',
  cost_saver: 'Cost Saver',
  quick_tip: 'Quick Tip',
  warning_post: 'Warning',
  local_alert: 'Local Alert',
  myth_buster: 'Myth Buster',
  diy_guide: 'DIY Guide',
  personal_story: 'Personal Story',
  community_intro: 'Community Intro',
  behind_scenes: 'Behind Scenes',
  special_offer: 'Special Offer',
  feature_friday: 'Feature Friday'
}

const statusConfig = {
  draft: { color: '#9E9E9E', icon: '📝', label: 'Draft' },
  ready_to_post: { color: '#336699', icon: '✅', label: 'Ready' },
  pending_approval: { color: '#F9D71C', icon: '⏳', label: 'Pending' },
  posted: { color: '#388E3C', icon: '🚀', label: 'Posted' },
  scheduled: { color: '#9C27B0', icon: '📅', label: 'Scheduled' }
}

export const RecentPostsPanel: React.FC<RecentPostsPanelProps> = ({
  posts,
  groups,
  companies,
  selectedCompanyId,
  isCollapsed,
  onToggleCollapse,
  onSelectGroup
}) => {
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('recentPostsPanelCollapsed', isCollapsed.toString())
  }, [isCollapsed])

  const toggleCollapse = () => {
    onToggleCollapse(!isCollapsed)
  }

  const scrollToPost = (postId: string, postStatus: string) => {
    console.log('🔄 ScrollToPost called with postId:', postId, 'status:', postStatus)
    
    // Find the post in the posts array to get its status and group
    const post = posts.find(p => p.id === postId)
    if (!post) {
      console.error('❌ Post not found in posts array:', postId)
      return
    }
    
    // Get the tab name for this post's status
    const targetTab = getStatusTab(post.status)
    console.log('📑 Target tab:', targetTab)
    console.log('🔍 Post belongs to group:', post.group_id)
    
    // Select the post's group so the post will be visible
    console.log('🖱️ Selecting group:', post.group_id)
    onSelectGroup(post.group_id!)
    
    // Find the tab button and click it
    const tabButtons = document.querySelectorAll('[data-tab]')
    const targetTabButton = Array.from(tabButtons).find(btn => 
      btn.getAttribute('data-tab') === targetTab
    ) as HTMLElement
    
    if (targetTabButton) {
      console.log('🖱️ Clicking tab button for:', targetTab)
      targetTabButton.click()
      
      // Wait for the tab to render and filter to clear before scrolling
      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`)
        if (postElement) {
          console.log('✅ Scrolling to post element')
          
          // Scroll to the post with smooth behavior
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Highlight the post briefly with a pulse effect
          postElement.style.transition = 'all 0.3s ease'
          postElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
          postElement.style.borderColor = '#3B82F6'
          postElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)'
          
          // Reset after 2 seconds
          setTimeout(() => {
            postElement.style.backgroundColor = ''
            postElement.style.borderColor = ''
            postElement.style.boxShadow = ''
          }, 2000)
        } else {
          console.error('❌ Post element still not found after tab switch')
          console.log('Available post IDs:', Array.from(document.querySelectorAll('[id^="post-"]')).map(el => el.id))
        }
      }, 700)
    } else {
      console.error('❌ Tab button not found for tab:', targetTab)
    }
  }

  useEffect(() => {
    // Filter posts by selected company first
    let filteredPosts = posts
    if (selectedCompanyId) {
      filteredPosts = posts.filter(post => post.company_id === selectedCompanyId)
    }
    
    // Get all posts sorted by most recent and enrich with group names
    // Filter out posts without a group_id
    let recent = filteredPosts
      .filter(post => post.group_id) // Only include posts with a group_id
      .map(post => {
        const group = groups.find(g => g.id === post.group_id)
        return {
          ...post,
          group_id: post.group_id!, // TypeScript knows it's defined now
          group_name: group?.name || 'Unknown Group'
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    // Apply status filter
    if (statusFilter !== 'all') {
      recent = recent.filter(post => post.status === statusFilter)
    }
    
    // Limit to 50 posts
    recent = recent.slice(0, 50)

    setRecentPosts(recent)
  }, [posts, groups, statusFilter, selectedCompanyId])

  console.log('RecentPostsPanel: rendering with', posts.length, 'posts')

  return (
    <>
      {/* Collapsed Vertical Tab */}
      {isCollapsed && (
        <div 
          onClick={toggleCollapse}
          className="fixed right-0 top-16 bottom-0 w-12 flex flex-col items-center justify-center cursor-pointer z-10 transition-all hover:bg-white/5"
          style={{ backgroundColor: 'var(--card-bg)', borderLeft: '1px solid var(--border-neutral)' }}
        >
          <div className="flex flex-col items-center gap-2 select-none">
            <ChevronLeft size={20} style={{ color: 'var(--text-secondary)' }} />
            <div className="writing-mode-vertical text-sm font-medium tracking-wider" style={{ 
              color: 'var(--text-primary)',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}>
              RECENT POSTS
            </div>
            <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
      )}

      {/* Expanded Panel */}
      <div 
        className={`flex flex-col fixed right-0 top-16 bottom-0 z-10 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-0 opacity-0 pointer-events-none translate-x-full' : 'w-80 opacity-100'
        }`}
        style={{ backgroundColor: 'var(--card-bg)', borderLeft: '1px solid var(--border-neutral)', overscrollBehavior: 'contain' }}
      >
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-neutral)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: 'var(--text-primary)' }} />
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Recent Posts
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {recentPosts.length} {recentPosts.length === 1 ? 'post' : 'posts'}
              </p>
              <button
                onClick={toggleCollapse}
                className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
                title="Collapse panel"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        
        {/* Status Filter */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide transition-colors flex-shrink-0 ${
              statusFilter === 'all' 
                ? 'bg-[#336699] text-white' 
                : 'bg-transparent hover:bg-white/5'
            }`}
            style={{ 
              color: statusFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)' 
            }}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide transition-colors flex-shrink-0 ${
              statusFilter === 'draft' 
                ? 'bg-[#9E9E9E] text-white' 
                : 'bg-transparent hover:bg-white/5'
            }`}
            style={{ 
              color: statusFilter === 'draft' ? '#FFFFFF' : 'var(--text-secondary)' 
            }}
          >
            Draft
          </button>
          <button
            onClick={() => setStatusFilter('ready_to_post')}
            className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide transition-colors flex-shrink-0 ${
              statusFilter === 'ready_to_post' 
                ? 'bg-[#336699] text-white' 
                : 'bg-transparent hover:bg-white/5'
            }`}
            style={{ 
              color: statusFilter === 'ready_to_post' ? '#FFFFFF' : 'var(--text-secondary)' 
            }}
          >
            Ready
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide transition-colors flex-shrink-0 ${
              statusFilter === 'pending_approval' 
                ? 'bg-[#F9D71C] text-black' 
                : 'bg-transparent hover:bg-white/5'
            }`}
            style={{ 
              color: statusFilter === 'pending_approval' ? '#000000' : 'var(--text-secondary)' 
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('posted')}
            className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide transition-colors flex-shrink-0 ${
              statusFilter === 'posted' 
                ? 'bg-[#388E3C] text-white' 
                : 'bg-transparent hover:bg-white/5'
            }`}
            style={{ 
              color: statusFilter === 'posted' ? '#FFFFFF' : 'var(--text-secondary)' 
            }}
          >
            Posted
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 120px)' }}>
        {recentPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No recent posts
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create your first post to see activity here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => {
              const status = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft
              const timeAgo = new Date(post.created_at)
              const now = new Date()
              const diffInMinutes = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60))
              
              let timeString = ''
              if (diffInMinutes < 1) timeString = 'Just now'
              else if (diffInMinutes < 60) timeString = `${diffInMinutes}m ago`
              else if (diffInMinutes < 1440) timeString = `${Math.floor(diffInMinutes / 60)}h ago`
              else timeString = `${Math.floor(diffInMinutes / 1440)}d ago`

              return (
                <div
                  key={post.id}
                  onClick={() => scrollToPost(post.id, post.status)}
                  className="p-3 rounded border transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    borderColor: 'var(--border-neutral)' 
                  }}
                  title="Click to jump to this post"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {post.title || 'Untitled Post'}
                        </h4>
                        {/* Post Type Badge */}
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide"
                          style={{ 
                            backgroundColor: 'var(--input-bg)', 
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-neutral)'
                          }}
                        >
                          {postTypeLabels[post.post_type] || 'Post'}
                        </span>
                        {/* Status Badge */}
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: `${status.color}20`, 
                            color: status.color 
                          }}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>
                      
                      <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {post.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1" style={{ color: 'var(--text-disabled)' }}>
                            <Users size={12} />
                            <span className="truncate max-w-32">{post.group_name}</span>
                          </div>
                          {/* Company Label */}
                          {(() => {
                            const company = companies.find(c => c.id === post.company_id)
                            return company && (
                              <div className="text-[8px] uppercase tracking-[0.5px] pl-4" style={{ color: 'var(--text-disabled)' }}>
                                {company.name}
                              </div>
                            )
                          })()}
                        </div>
                        <span style={{ color: 'var(--text-disabled)' }}>
                          {timeString}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-neutral)' }}>
          <div className="text-xs text-center" style={{ color: 'var(--text-disabled)' }}>
            Showing latest posts • Click to navigate
          </div>
        </div>
      </div>
    </>
  )
}