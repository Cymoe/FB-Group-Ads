import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { calculateGroupHealth, getHealthSummary } from '../utils/groupHealth'
import type { Group, Post } from '../types/database'

// Helper function to get reason for caution/risk status
const getStatusReason = (health: ReturnType<typeof calculateGroupHealth>) => {
  const reasons = []
  const actions = []
  
  if (health.postsThisWeek >= 3) {
    reasons.push(`Posted ${health.postsThisWeek}/3 times this week`)
    actions.push('Wait until next week to post again')
  }
  
  if (health.daysSinceLastPost && health.daysSinceLastPost > 14) {
    reasons.push(`Last posted ${health.daysSinceLastPost} days ago`)
    actions.push('Post soon to maintain engagement')
  }
  
  if (reasons.length === 0) {
    reasons.push('Group posting frequency is optimal')
    actions.push('Continue posting as normal')
  }
  
  return { reasons, actions }
}

interface DashboardProps {
  groups: Group[]
  posts: Post[]
  selectedCompanyId: string | null
  onSelectGroup: (groupId: string) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ groups, posts, selectedCompanyId, onSelectGroup }) => {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState<'safe' | 'caution' | 'danger' | 'all'>('safe')
  const [showDetails, setShowDetails] = useState(false)
  
  // Filter groups by selected company
  const companyGroups = selectedCompanyId 
    ? groups.filter(g => g.company_id === selectedCompanyId)
    : groups
  
  // Filter posts by selected company
  const companyPosts = selectedCompanyId
    ? posts.filter(p => p.company_id === selectedCompanyId)
    : posts
  
  // Calculate health summary
  const healthSummary = getHealthSummary(companyGroups)
  
  // Get groups with health status
  const groupsWithHealth = companyGroups.map(group => ({ 
    group, 
    health: calculateGroupHealth(group) 
  }))
  
  // Filter groups based on selected tab
  const filteredGroups = selectedFilter === 'all' 
    ? groupsWithHealth
    : groupsWithHealth.filter(({ health }) => health.status === selectedFilter)
  
  // Sort by days since last post (descending) - groups posted to longest ago first
  const sortedGroups = filteredGroups.sort((a, b) => {
    const aDays = a.health.daysSinceLastPost || 999
    const bDays = b.health.daysSinceLastPost || 999
    return bDays - aDays
  })
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your posting activity and recommendations
            </p>
          </div>

          {/* Health Summary Cards - Interactive Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Safe Groups */}
            <button
              onClick={() => setSelectedFilter('safe')}
              className={`p-6 rounded-lg text-left transition-all ${
                selectedFilter === 'safe' ? 'ring-2 ring-green-500' : ''
              }`}
              style={{ 
                backgroundColor: selectedFilter === 'safe' ? 'rgba(16, 185, 129, 0.1)' : 'var(--card-bg)', 
                border: `1px solid ${selectedFilter === 'safe' ? '#10B981' : 'var(--border-neutral)'}` 
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-500" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500">{healthSummary.safe}</div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Safe</div>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Groups ready for content
              </p>
            </button>

            {/* Caution Groups */}
            <button
              onClick={() => setSelectedFilter('caution')}
              className={`p-6 rounded-lg text-left transition-all ${
                selectedFilter === 'caution' ? 'ring-2 ring-yellow-500' : ''
              }`}
              style={{ 
                backgroundColor: selectedFilter === 'caution' ? 'rgba(249, 215, 28, 0.1)' : 'var(--card-bg)', 
                border: `1px solid ${selectedFilter === 'caution' ? '#F9D71C' : 'var(--border-neutral)'}` 
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle size={24} className="text-yellow-500" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-500">{healthSummary.caution}</div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Caution</div>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Proceed carefully
              </p>
            </button>

            {/* Danger Groups */}
            <button
              onClick={() => setSelectedFilter('danger')}
              className={`p-6 rounded-lg text-left transition-all ${
                selectedFilter === 'danger' ? 'ring-2 ring-red-500' : ''
              }`}
              style={{ 
                backgroundColor: selectedFilter === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'var(--card-bg)', 
                border: `1px solid ${selectedFilter === 'danger' ? '#EF4444' : 'var(--border-neutral)'}` 
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingUp size={24} className="text-red-500" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-500">{healthSummary.danger}</div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>At Risk</div>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Need to rest
              </p>
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="mb-6 p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{companyPosts.filter(p => p.status === 'draft').length}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Drafts</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{companyPosts.filter(p => p.status === 'ready_to_post').length}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ready</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{companyPosts.filter(p => p.status === 'posted').length}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Posted</div>
                </div>
              </div>
            </div>
          </div>

          {/* Caution/Risk Details - Only show when there are groups to show */}
          {(selectedFilter === 'caution' || selectedFilter === 'danger') && sortedGroups.length > 0 && (
            <div className="mb-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: `1px solid ${selectedFilter === 'caution' ? '#F9D71C' : '#EF4444'}` }}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {selectedFilter === 'caution' ? (
                    <AlertCircle size={20} className="text-yellow-500" />
                  ) : (
                    <TrendingUp size={20} className="text-red-500" />
                  )}
                  <div className="text-left">
                    <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Why these groups are {selectedFilter === 'caution' ? 'in caution' : 'at risk'}?
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Click to see details and recommendations
                    </p>
                  </div>
                </div>
                {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {showDetails && (
                <div className="border-t" style={{ borderColor: 'var(--border-neutral)' }}>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {sortedGroups.slice(0, 10).map(({ group, health }) => {
                      const { reasons, actions } = getStatusReason(health)
                      return (
                        <div 
                          key={group.id}
                          className="p-3 rounded border-l-4"
                          style={{ 
                            backgroundColor: `${health.color}10`,
                            borderLeftColor: health.color
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {group.name}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${health.color}20`, color: health.color }}>
                              {health.icon} {health.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {reasons.map((reason, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <span className="mt-0.5">⚠️</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                            {actions.map((action, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                                <span className="mt-0.5">💡</span>
                                <span className="font-medium">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtered Groups List */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {selectedFilter === 'safe' ? '🎯' : selectedFilter === 'caution' ? '⚠️' : '🚨'}
                </span>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedFilter === 'safe' ? 'Ready to Post' : 
                   selectedFilter === 'caution' ? 'Proceed with Caution' : 
                   'Need to Rest'}
                </h2>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {sortedGroups.length} group{sortedGroups.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {sortedGroups.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">
                  {selectedFilter === 'safe' ? '😴' : selectedFilter === 'caution' ? '👍' : '🎉'}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedFilter === 'safe' ? 'All groups need a break. Check back tomorrow!' :
                   selectedFilter === 'caution' ? 'No groups in caution status. Nice!' :
                   'No groups at risk. Great job managing your posting frequency!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedGroups.map(({ group, health }) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      onSelectGroup(group.id)
                      navigate('/posts')
                    }}
                    className="p-4 rounded-lg cursor-pointer transition-all"
                    style={{ 
                      backgroundColor: `${health.color}10`,
                      border: `1px solid ${health.color}30`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                        {group.name}
                      </span>
                      <span className="text-xs font-medium ml-2 flex-shrink-0" style={{ color: health.color }}>
                        {health.daysSinceLastPost ? `${health.daysSinceLastPost}d ago` : 'New'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>{health.icon}</span>
                      <span>{health.postsThisWeek}/3 posts this week</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

