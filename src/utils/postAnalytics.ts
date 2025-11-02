import type { Post, PostAnalytics, Group } from '../types/database'

/**
 * Calculate engagement rate: (reactions + comments + shares) / reach
 */
export function calculateEngagementRate(analytics: PostAnalytics): number {
  if (!analytics.reach || analytics.reach === 0) return 0
  
  const totalEngagement = analytics.reactions + analytics.comments + analytics.shares
  return (totalEngagement / analytics.reach) * 100
}

/**
 * Calculate performance score (0-100) based on multiple factors
 */
export function calculatePerformanceScore(
  analytics: PostAnalytics, 
  group?: Group
): number {
  let score = 0
  
  // Factor 1: Engagement Rate (40 points)
  // Industry avg is 1-3%, great is 5%+
  const engagementRate = calculateEngagementRate(analytics)
  if (engagementRate >= 5) score += 40
  else if (engagementRate >= 3) score += 30
  else if (engagementRate >= 1) score += 20
  else score += (engagementRate * 20) // Proportional for <1%
  
  // Factor 2: Absolute Engagement (30 points)
  const totalEngagement = analytics.reactions + analytics.comments + analytics.shares
  const groupSize = group?.audience_size || 10000
  const engagementRatio = totalEngagement / groupSize
  
  if (engagementRatio >= 0.05) score += 30 // 5%+ of group engaged
  else if (engagementRatio >= 0.03) score += 20
  else if (engagementRatio >= 0.01) score += 10
  else score += (engagementRatio * 200) // Proportional
  
  // Factor 3: Comment Ratio (20 points) - comments indicate deeper engagement
  const commentRatio = totalEngagement > 0 ? analytics.comments / totalEngagement : 0
  if (commentRatio >= 0.3) score += 20 // 30%+ are comments
  else if (commentRatio >= 0.2) score += 15
  else if (commentRatio >= 0.1) score += 10
  else score += (commentRatio * 100)
  
  // Factor 4: Shares (10 points) - shares are valuable
  const shareRatio = totalEngagement > 0 ? analytics.shares / totalEngagement : 0
  if (shareRatio >= 0.2) score += 10 // 20%+ are shares
  else if (shareRatio >= 0.1) score += 7
  else if (shareRatio >= 0.05) score += 5
  else score += (shareRatio * 50)
  
  return Math.min(100, Math.round(score))
}

/**
 * Get performance tier based on score
 */
export function getPerformanceTier(score: number): {
  tier: 'excellent' | 'good' | 'average' | 'poor'
  label: string
  color: string
  icon: string
} {
  if (score >= 80) {
    return {
      tier: 'excellent',
      label: 'Excellent',
      color: '#10B981',
      icon: '🔥'
    }
  } else if (score >= 60) {
    return {
      tier: 'good',
      label: 'Good',
      color: '#3B82F6',
      icon: '⚡'
    }
  } else if (score >= 40) {
    return {
      tier: 'average',
      label: 'Average',
      color: '#F59E0B',
      icon: '📊'
    }
  } else {
    return {
      tier: 'poor',
      label: 'Needs Improvement',
      color: '#EF4444',
      icon: '📉'
    }
  }
}

/**
 * Format engagement metrics for display
 */
export function formatEngagementMetric(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}

/**
 * Calculate post benchmark vs user's average
 */
export function calculateBenchmark(
  post: Post,
  userPosts: Post[]
): {
  vsUserAverage: number // Percentage difference
  vsGroupAverage: number // If we have group data
} {
  const postScore = post.analytics?.performance_score || 0
  
  // Calculate user's average
  const postsWithScores = userPosts.filter(p => 
    p.status === 'posted' && 
    p.analytics?.performance_score
  )
  
  const avgScore = postsWithScores.length > 0
    ? postsWithScores.reduce((sum, p) => sum + (p.analytics?.performance_score || 0), 0) / postsWithScores.length
    : 0
  
  const vsUserAverage = avgScore > 0 ? ((postScore - avgScore) / avgScore) * 100 : 0
  
  // For now, assume industry average is 50
  const industryAverage = 50
  const vsGroupAverage = ((postScore - industryAverage) / industryAverage) * 100
  
  return {
    vsUserAverage: Math.round(vsUserAverage),
    vsGroupAverage: Math.round(vsGroupAverage)
  }
}

/**
 * Get insight about what's working
 */
export function getPerformanceInsights(posts: Post[]): {
  bestPostType: string | null
  bestPerformingPosts: Post[]
  averageScore: number
  totalPosts: number
} {
  const postedPosts = posts.filter(p => p.status === 'posted' && p.analytics)
  
  if (postedPosts.length === 0) {
    return {
      bestPostType: null,
      bestPerformingPosts: [],
      averageScore: 0,
      totalPosts: 0
    }
  }
  
  // Find best post type
  const typeScores: Record<string, number[]> = {}
  postedPosts.forEach(post => {
    const type = post.post_type
    const score = post.analytics?.performance_score || 0
    if (!typeScores[type]) typeScores[type] = []
    typeScores[type].push(score)
  })
  
  let bestPostType: string | null = null
  let bestAvg = 0
  Object.entries(typeScores).forEach(([type, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg > bestAvg) {
      bestAvg = avg
      bestPostType = type
    }
  })
  
  // Get top 5 performing posts
  const bestPerformingPosts = [...postedPosts]
    .sort((a, b) => (b.analytics?.performance_score || 0) - (a.analytics?.performance_score || 0))
    .slice(0, 5)
  
  // Calculate average
  const avgScore = postedPosts.reduce((sum, p) => sum + (p.analytics?.performance_score || 0), 0) / postedPosts.length
  
  return {
    bestPostType,
    bestPerformingPosts,
    averageScore: Math.round(avgScore),
    totalPosts: postedPosts.length
  }
}

