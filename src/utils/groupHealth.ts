import type { Group } from '../types/database'

export type HealthStatus = 'safe' | 'caution' | 'danger'

export interface GroupHealth {
  status: HealthStatus
  message: string
  color: string
  icon: string
  daysSinceLastPost: number | null
  postsThisWeek: number
  nextSafePostDate: string | null
  recommendationText: string
}

export function calculateGroupHealth(group: Group): GroupHealth {
  const postsThisWeek = group.posts_this_week || 0
  const lastPostDate = group.last_post_date
  const recommendedFrequency = group.recommended_frequency || 3 // Default: 3 posts per week
  
  // Calculate days since last post
  let daysSinceLastPost: number | null = null
  if (lastPostDate) {
    const lastPost = new Date(lastPostDate)
    const now = new Date()
    daysSinceLastPost = Math.floor((now.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  // Calculate next safe post date
  let nextSafePostDate: string | null = null
  let recommendationText = ''
  
  if (lastPostDate) {
    const lastPost = new Date(lastPostDate)
    const recommendedWaitDays = Math.ceil(7 / recommendedFrequency) // Days to wait between posts
    const nextSafeDate = new Date(lastPost)
    nextSafeDate.setDate(nextSafeDate.getDate() + recommendedWaitDays)
    
    const now = new Date()
    if (nextSafeDate > now) {
      nextSafePostDate = nextSafeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
  
  // Determine health status
  if (postsThisWeek >= recommendedFrequency + 1) {
    // Over recommended frequency - high risk
    const daysToRest = nextSafePostDate ? ` until ${nextSafePostDate}` : ' for a few days'
    recommendationText = `⚠️ You've posted ${postsThisWeek} times this week (limit: ${recommendedFrequency}). Let this group rest${daysToRest} to avoid spam flags.`
    
    return {
      status: 'danger',
      message: 'High spam risk - let it rest',
      color: '#DC8A7D',  // Muted coral/red
      icon: '🔴',
      daysSinceLastPost,
      postsThisWeek,
      nextSafePostDate,
      recommendationText
    }
  } else if (postsThisWeek >= recommendedFrequency || (daysSinceLastPost !== null && daysSinceLastPost < 2)) {
    // At recommended frequency OR posted very recently
    if (daysSinceLastPost !== null && daysSinceLastPost < 2) {
      recommendationText = `📅 Last posted ${daysSinceLastPost} day${daysSinceLastPost === 1 ? '' : 's'} ago. Recommended: wait ${nextSafePostDate ? `until ${nextSafePostDate}` : '1-2 more days'} to maintain good standing.`
    } else {
      recommendationText = `⚡ You've posted ${postsThisWeek}/${recommendedFrequency} times this week. You can post, but consider spacing it out more.`
    }
    
    return {
      status: 'caution',
      message: daysSinceLastPost !== null && daysSinceLastPost < 2 
        ? `Posted ${daysSinceLastPost} day${daysSinceLastPost === 1 ? '' : 's'} ago - wait a bit`
        : 'Near limit - proceed with caution',
      color: '#C4A574',  // Muted gold/amber
      icon: '🟡',
      daysSinceLastPost,
      postsThisWeek,
      nextSafePostDate,
      recommendationText
    }
  } else {
    // Safe to post
    if (lastPostDate && daysSinceLastPost !== null) {
      recommendationText = `✅ Last posted ${daysSinceLastPost} day${daysSinceLastPost === 1 ? '' : 's'} ago. Perfect timing to post again! (${postsThisWeek}/${recommendedFrequency} posts this week)`
    } else {
      recommendationText = `🚀 This group has never been posted to. Great opportunity to establish presence!`
    }
    
    return {
      status: 'safe',
      message: lastPostDate ? `Last posted ${daysSinceLastPost} days ago - good to go` : 'Never posted - safe to start',
      color: '#7BA88D',  // Muted sage green
      icon: '🟢',
      daysSinceLastPost,
      postsThisWeek,
      nextSafePostDate,
      recommendationText
    }
  }
}

export function getHealthSummary(groups: Group[]): {
  safe: number
  caution: number
  danger: number
} {
  const summary = { safe: 0, caution: 0, danger: 0 }
  
  groups.forEach(group => {
    const health = calculateGroupHealth(group)
    summary[health.status]++
  })
  
  return summary
}

