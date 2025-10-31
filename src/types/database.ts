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

export type PostStatus = 'draft' | 'ready_to_post' | 'pending_approval' | 'posted' | 'leads_collected'

export type GroupTier = 'high' | 'medium' | 'low'
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
  company_id?: string
  tier?: GroupTier
  category?: string
  audience_size?: number
  status: GroupStatus
  
  // NEW: Enhanced group tracking fields
  privacy?: GroupPrivacy  // Group privacy setting
  target_city?: string  // Geographic targeting - city/town
  target_state?: string  // Geographic targeting - state
  quality_rating?: number  // 1-10 star rating for group quality
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