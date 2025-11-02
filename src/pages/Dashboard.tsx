import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Eye, Pencil, Shuffle, RotateCw, Calendar, CheckCircle, BarChart3, MessageSquare, X } from 'lucide-react'
import { calculateGroupHealth } from '../utils/groupHealth'
import { getPerformanceInsights } from '../utils/postAnalytics'
import { useApp } from '../EnhancedApp'
import toast from 'react-hot-toast'
import type { Group, Post } from '../types/database'

interface DashboardProps {
  groups: Group[]
  posts: Post[]
  selectedCompanyId: string | null
  onSelectGroup: (groupId: string) => void
}

type QueueTab = 'scheduled' | 'published' | 'drafts'

export const Dashboard: React.FC<DashboardProps> = ({ groups, posts, selectedCompanyId, onSelectGroup }) => {
  const navigate = useNavigate()
  const { updatePost, selectedGroupId } = useApp()
  const [activeTab, setActiveTab] = useState<QueueTab>('scheduled')
  const [hoveredPost, setHoveredPost] = useState<string | null>(null)
  
  // Filter posts by selected company
  const companyPosts = selectedCompanyId
    ? posts.filter(p => p.company_id === selectedCompanyId)
    : posts

  // Filter posts by selected group
  const filteredPosts = selectedGroupId
    ? companyPosts.filter(p => p.group_id === selectedGroupId)
    : companyPosts

  // Get posts by status
  const scheduledPosts = filteredPosts.filter(p => p.status === 'scheduled' && p.scheduled_for)
  const publishedPosts = filteredPosts.filter(p => p.status === 'posted')
  const draftPosts = filteredPosts.filter(p => p.status === 'draft')

  // Group scheduled posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, Post[]> = {}
    
    scheduledPosts.forEach(post => {
      if (post.scheduled_for) {
        const date = new Date(post.scheduled_for)
        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(post)
      }
    })
    
    // Sort posts within each date by scheduled time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a.scheduled_for!).getTime()
        const timeB = new Date(b.scheduled_for!).getTime()
        return timeA - timeB
      })
    })
    
    return grouped
  }, [scheduledPosts])

  // Get sorted date keys (upcoming first) + show next 7 days even if empty
  const sortedDates = useMemo(() => {
    const today = new Date()
    const upcomingDates: string[] = []
    
    // Generate next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      upcomingDates.push(dateKey)
    }
    
    // Merge with actual scheduled dates and sort
    const allDates = new Set([...Object.keys(postsByDate), ...upcomingDates])
    return Array.from(allDates).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
  }, [postsByDate])
  
  // Shuffle queue function
  const handleShuffle = () => {
    if (scheduledPosts.length < 2) {
      toast.error('Need at least 2 posts to shuffle')
      return
    }
    
    const shuffled = [...scheduledPosts].sort(() => Math.random() - 0.5)
    const timeSlots = scheduledPosts.map(p => p.scheduled_for).sort((a, b) => {
      return new Date(a!).getTime() - new Date(b!).getTime()
    })
    
    // Update each post with new time slot
    shuffled.forEach((post, index) => {
      if (updatePost && post.id && timeSlots[index]) {
        updatePost(post.id, { scheduled_for: timeSlots[index]! })
      }
    })
    
    toast.success(`Shuffled ${shuffled.length} posts`)
  }
  
  // Remove post from queue
  const handleRemoveFromQueue = async (postId: string) => {
    if (updatePost && window.confirm('Remove this post from the queue?')) {
      await updatePost(postId, { status: 'draft', scheduled_for: undefined })
      toast.success('Post removed from queue')
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateKey = date.toISOString().split('T')[0]
    const todayKey = today.toISOString().split('T')[0]
    const tomorrowKey = tomorrow.toISOString().split('T')[0]
    
    if (dateKey === todayKey) return 'Today'
    if (dateKey === tomorrowKey) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  }

  // Get group health summary (simplified, kept from original)
  const companyGroups = selectedCompanyId 
    ? groups.filter(g => g.company_id === selectedCompanyId)
    : groups

  const getGroupHealthWithRealData = (group: Group) => {
    // Use all company posts for health calculation, not filtered by selectedGroupId
    const groupPosts = companyPosts.filter(p => p.group_id === group.id)
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

  const groupsWithHealth = companyGroups.map(group => ({ 
    group, 
    health: getGroupHealthWithRealData(group) 
  }))

  const healthSummary = {
    safe: groupsWithHealth.filter(g => g.health.status === 'safe').length,
    caution: groupsWithHealth.filter(g => g.health.status === 'caution').length,
    danger: groupsWithHealth.filter(g => g.health.status === 'danger').length,
  }

  // Get performance insights (kept from original)
  const insights = getPerformanceInsights(companyPosts)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      <div className="px-3 md:px-6 py-4 md:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              My Queue
            </h1>
            {scheduledPosts.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981'
              }}>
                <CheckCircle size={16} />
                <span>You have {scheduledPosts.length} post{scheduledPosts.length !== 1 ? 's' : ''} scheduled</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {scheduledPosts.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button
                onClick={handleShuffle}
                disabled={scheduledPosts.length < 2}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-neutral)',
                  color: 'var(--text-primary)'
                }}
              >
                <Shuffle size={16} />
                Shuffle
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-neutral)',
                  color: 'var(--text-primary)'
                }}
                title="Coming soon"
              >
                <RotateCw size={16} />
                Re-Queue
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b" style={{ borderColor: 'var(--border-neutral)' }}>
            <button
              onClick={() => setActiveTab('scheduled')}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === 'scheduled' ? '#3B82F6' : 'var(--text-secondary)',
                borderBottom: activeTab === 'scheduled' ? '2px solid #3B82F6' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Scheduled Posts
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === 'published' ? '#3B82F6' : 'var(--text-secondary)',
                borderBottom: activeTab === 'published' ? '2px solid #3B82F6' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Published Posts
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === 'drafts' ? '#3B82F6' : 'var(--text-secondary)',
                borderBottom: activeTab === 'drafts' ? '2px solid #3B82F6' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              Drafts
            </button>
          </div>

          {/* Scheduled Posts View */}
          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              {sortedDates.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    No scheduled posts
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Press "Add to Queue" to schedule your posts
                  </p>
                </div>
              ) : (
                sortedDates.map(dateKey => (
                  <div key={dateKey} className="mb-6">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(dateKey)}
                    </h3>
                    <div className="space-y-2">
                      {postsByDate[dateKey]?.map(post => {
                        const group = groups.find(g => g.id === post.group_id)
                        const health = group ? getGroupHealthWithRealData(group) : null
                        return (
                          <div
                            key={post.id}
                            onMouseEnter={() => setHoveredPost(post.id)}
                            onMouseLeave={() => setHoveredPost(null)}
                            className="p-4 rounded-lg flex items-center gap-4 transition-all"
                            style={{
                              backgroundColor: hoveredPost === post.id ? 'rgba(255, 255, 255, 0.05)' : 'var(--input-bg)',
                              border: '1px solid var(--border-neutral)'
                            }}
                          >
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                              <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                                {formatTime(post.scheduled_for!)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <MessageSquare size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                              <p className="text-sm line-clamp-1 flex-1" style={{ color: 'var(--text-primary)' }}>
                                {post.content.substring(0, 120)}
                                {post.content.length > 120 && '...'}
                              </p>
                            </div>
                            {group && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span 
                                  className="text-xs px-2 py-0.5 rounded whitespace-nowrap truncate max-w-[150px]"
                                  style={{ 
                                    backgroundColor: health?.color ? `${health.color}20` : 'rgba(59, 130, 246, 0.15)',
                                    color: health?.color || '#60A5FA'
                                  }}
                                  title={group.name}
                                >
                                  {group.name}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  if (group) {
                                    onSelectGroup(group.id)
                                    navigate('/posts')
                                  }
                                }}
                                className="p-2 rounded transition-colors hover:bg-white/10"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (group) {
                                    onSelectGroup(group.id)
                                    navigate('/posts')
                                  }
                                }}
                                className="p-2 rounded transition-colors hover:bg-white/10"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveFromQueue(post.id)}
                                className="p-2 rounded transition-colors hover:bg-red-500/20"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Remove from queue"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      }) || null}
                      
                      {/* Placeholder for empty dates */}
                      {(!postsByDate[dateKey] || postsByDate[dateKey].length === 0) && (
                        <div
                          className="p-4 rounded-lg flex items-center gap-4 opacity-40"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            border: '1px solid var(--border-neutral)',
                            borderStyle: 'dashed'
                          }}
                        >
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {formatTime(new Date(dateKey + 'T09:00:00').toISOString())}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Press "Add to Queue" to schedule your post here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Published Posts View */}
          {activeTab === 'published' && (
            <div className="space-y-2">
              {publishedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    No published posts yet
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Your published posts will appear here
                  </p>
                </div>
              ) : (
                publishedPosts
                  .sort((a, b) => {
                    const dateA = new Date(a.posted_at || a.created_at).getTime()
                    const dateB = new Date(b.posted_at || b.created_at).getTime()
                    return dateB - dateA
                  })
                  .slice(0, 20)
                  .map(post => {
                    const group = groups.find(g => g.id === post.group_id)
                    return (
                      <div
                        key={post.id}
                        className="p-4 rounded-lg flex items-center gap-4 transition-all hover:bg-white/5"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--border-neutral)'
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                            {post.content.substring(0, 100)}
                            {post.content.length > 100 && '...'}
                          </p>
                          {group && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {group.name} • {new Date(post.posted_at || post.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          )}

          {/* Drafts View */}
          {activeTab === 'drafts' && (
            <div className="space-y-2">
              {draftPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                    No drafts
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Your draft posts will appear here
                  </p>
                </div>
              ) : (
                draftPosts
                  .sort((a, b) => {
                    const dateA = new Date(a.created_at).getTime()
                    const dateB = new Date(b.created_at).getTime()
                    return dateB - dateA
                  })
                  .map(post => {
                    const group = groups.find(g => g.id === post.group_id)
                    return (
                      <div
                        key={post.id}
                        className="p-4 rounded-lg flex items-center gap-4 transition-all hover:bg-white/5"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--border-neutral)'
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                            {post.content.substring(0, 100)}
                            {post.content.length > 100 && '...'}
                          </p>
                          {group && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {group.name}
                            </p>
                          )}
                        </div>
                        <button
                          className="p-2 rounded transition-colors hover:bg-white/10"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    )
                  })
              )}
            </div>
          )}

          {/* Collapsible Health Summary & Performance (Secondary Info) */}
          {(healthSummary.safe > 0 || healthSummary.caution > 0 || healthSummary.danger > 0 || insights.totalPosts > 0) && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                Group Health & Performance
              </summary>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#10B981' }}>{healthSummary.safe}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Safe</div>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#F9D71C' }}>{healthSummary.caution}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Caution</div>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#EF4444' }}>{healthSummary.danger}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>At Risk</div>
                </div>
              </div>

              {insights.totalPosts > 0 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} style={{ color: '#3B82F6' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Average Performance Score: {insights.averageScore}
                    </span>
                  </div>
                </div>
              )}
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
