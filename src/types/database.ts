export type PostType = 
  | 'value_post'
  | 'feature_friday'
  | 'diy_guide'
  | 'cost_saver'
  | 'warning_post'
  | 'quick_tip'
  | 'local_alert'
  | 'myth_buster'
  | 'personal_story'
  | 'community_intro'
  | 'behind_scenes'
  | 'special_offer'

export type PostStatus = 'draft' | 'ready_to_post' | 'pending_approval' | 'posted' | 'scheduled' | 'leads_collected'

export type GroupStatus = 'active' | 'inactive' | 'pending'

export type Company = {
  id: string
  name: string
  service_type: string
  location: string
  description?: string
  user_id: string  // Add user context
  created_at: string
  updated_at: string
}

export type GroupPrivacy = 'public' | 'private' | 'closed'
export type GroupQAStatus = 'new' | 'pending_approval' | 'approved' | 'rejected'

export type Group = {
  id: string
  name: string
  description?: string
  company_id?: string
  category?: string
  audience_size?: number
  status: GroupStatus
  facebook_url?: string  // Facebook group URL
  
  // NEW: Enhanced group tracking fields
  privacy?: GroupPrivacy  // Group privacy setting
  target_city?: string  // Geographic targeting - city/town
  target_state?: string  // Geographic targeting - state
  quality_rating?: number  // 1-5 star rating for group quality
  qa_status?: GroupQAStatus  // Approval workflow status
  
  user_id: string  // Add user context
  created_at: string
  updated_at: string
  company?: Company
  // Posting frequency tracking
  last_post_date?: string
  posts_this_week?: number
  posts_this_month?: number
  recommended_frequency?: number  // Posts per week (default: 2-3)
}

export type GroupStats = Group & {
  total_posts: number
  avg_engagement_rate: number
  total_leads: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_reach: number
  last_post_date?: string
}

export type PostAnalytics = {
  reactions: number // Facebook reactions (like, love, etc)
  comments: number
  shares: number
  reach?: number // How many people saw it
  clicks?: number // Link clicks
  engagement_rate?: number // (reactions + comments + shares) / reach
  performance_score?: number // 0-100 calculated score
}

export type Post = {
  id: string
  company_id: string
  group_id?: string
  post_type: PostType
  title: string
  content: string
  status: PostStatus
  leads_count: number
  engagement_rate?: number
  reach?: number
  likes: number
  comments: number
  shares: number
  post_link?: string
  user_id: string  // Add user context
  created_at: string
  updated_at: string
  posted_at?: string
  scheduled_for?: string  // ISO date string for scheduled posts
  // New analytics structure
  analytics?: PostAnalytics
  company?: Company
  group?: Group
}

export type Lead = {
  id: string
  post_id: string
  name: string
  email?: string
  phone?: string
  message?: string
  user_id: string  // Add user context
  created_at: string
  post?: Post
}

// Global Group Database Types
export type GlobalGroup = {
  id: string
  name: string
  category: string
  description?: string
  facebook_url?: string
  
  // Location
  location: {
    city: string
    state: string
    country?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  
  // Metadata
  member_count: number
  privacy: GroupPrivacy
  
  // Quality Metrics
  quality_score: number  // 0-100
  verified: boolean
  
  // Quality Indicators (NEW)
  quality_indicators?: {
    engagement_rate?: number  // e.g., 4.2 (%)
    avg_comments_per_post?: number
    response_rate?: number  // e.g., 32 (%)
    admin_response_time?: string  // e.g., "< 1 hour"
    business_friendly?: boolean
    posting_limit?: string  // e.g., "2 per week"
    best_posting_times?: {
      days: string[]  // e.g., ["Monday", "Tuesday", "Thursday"]
      hours: string  // e.g., "9am-2pm"
    }
    active_businesses_count?: number
    content_preferences?: string[]  // e.g., ["Before/After Photos", "DIY Tips"]
  }
  
  // Discovery
  industries: string[]  // e.g., ['home_services', 'real_estate']
  tags: string[]
  
  // Usage Stats
  added_by_count: number  // How many users added this
  trending_score: number
  
  // Contribution
  contributed_by?: string  // user_id who added it
  contributed_at: string
  verified_by_admin: boolean
  
  created_at: string
  updated_at: string
}