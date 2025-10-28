# Database Structure - Groups & Posts with Rollup/Lookup Fields

This document explains how your database is structured to track Facebook groups, posts, and leads, with Airtable-style rollup and lookup functionality.

## Overview

The system tracks:
- **Companies** - Service providers (plumbers, painters, etc.)
- **Groups** - Facebook groups where you post content
- **Posts** - Social media posts made to groups
- **Leads** - People who respond to your posts

## Tables

### 1. `groups` Table
Tracks Facebook groups where you publish posts.

**Fields:**
- `id` (uuid) - Primary key
- `name` (varchar) - Group name (e.g., "NYC Home Improvement")
- `tier` (varchar) - Priority level: 'high', 'medium', 'low'
- `category` (varchar) - Type of group (e.g., "Local Community", "Home Improvement")
- `audience_size` (integer) - Number of members in the group
- `status` (varchar) - 'active', 'inactive', or 'pending'
- `created_at` (timestamptz) - When the group was added
- `updated_at` (timestamptz) - Last update

### 2. `companies` Table
Your service provider clients (already existed).

**Fields:**
- `id` (uuid) - Primary key
- `name` (varchar) - Company name
- `service_type` (varchar) - Type of service
- `location` (varchar) - Company location
- `description` (text) - Company description
- `created_at`, `updated_at` (timestamptz)

### 3. `posts` Table
Individual social media posts (enhanced with engagement tracking).

**Fields:**
- `id` (uuid) - Primary key
- `company_id` (uuid) - Links to companies table (which company this post is about)
- `group_id` (uuid) - Links to groups table (which group it was posted in)
- `post_type` (varchar) - Type of post (warning_post, cost_saver, etc.)
- `title` (varchar) - Post title
- `content` (text) - Post body content
- `status` (varchar) - 'draft', 'ready_to_post', 'posted', 'leads_collected'
- `leads_count` (integer) - Number of leads from this post
- **Engagement fields (NEW):**
  - `engagement_rate` (decimal) - Percentage engagement (e.g., 5.75%)
  - `reach` (integer) - How many people saw the post
  - `likes` (integer) - Number of likes
  - `comments` (integer) - Number of comments
  - `shares` (integer) - Number of shares
- `post_link` (varchar) - URL to the actual Facebook post
- `posted_at` (timestamptz) - When it was posted
- `created_at`, `updated_at` (timestamptz)

### 4. `leads` Table
People who responded to your posts (already existed).

**Fields:**
- `id` (uuid) - Primary key
- `post_id` (uuid) - Links to posts table
- `name`, `email`, `phone` - Contact information
- `message` (text) - Their message
- `created_at` (timestamptz)

## Rollup Fields (Airtable → PostgreSQL)

In Airtable, "rollup fields" aggregate data from linked records. In PostgreSQL, we create a **view** called `group_stats` that calculates these automatically.

### `group_stats` View

This view provides real-time rollup statistics for each group:

```sql
SELECT 
  g.*,
  COUNT(p.id) AS total_posts,                    -- Rollup: Total Posts
  AVG(p.engagement_rate) AS avg_engagement_rate, -- Rollup: Average Engagement
  SUM(p.leads_count) AS total_leads,             -- Rollup: Total Leads
  SUM(p.likes) AS total_likes,
  SUM(p.comments) AS total_comments,
  SUM(p.shares) AS total_shares,
  SUM(p.reach) AS total_reach,
  MAX(p.posted_at) AS last_post_date
FROM groups g
LEFT JOIN posts p ON p.group_id = g.id
GROUP BY g.id
```

**What you get:**
- `total_posts` - Count of all posts in this group
- `avg_engagement_rate` - Average engagement across all posts
- `total_leads` - Sum of all leads from this group
- `total_likes`, `total_comments`, `total_shares` - Sum of engagement metrics
- `total_reach` - Total people reached
- `last_post_date` - Most recent post date

**How to use it:**
```typescript
// Fetch groups with rollup stats
const { data } = await supabase
  .from('group_stats')
  .select('*')
  .order('total_posts', { ascending: false })
```

## Lookup Fields (Airtable → PostgreSQL)

In Airtable, "lookup fields" show specific fields from linked records. In PostgreSQL, use JOINs:

### Example: Get posts with their group name and company name

```typescript
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    company:companies(name, service_type, location),
    group:groups(name, tier, audience_size)
  `)
```

This gives you post data with nested company and group information.

## Relationships

```
companies ──┐
            ├──> posts ──> leads
groups ─────┘
```

- One **company** can have many **posts**
- One **group** can have many **posts**
- One **post** can have many **leads**

## TypeScript Types

See `src/types/database.ts` for complete type definitions:

```typescript
type Group = {
  id: string
  name: string
  tier?: 'high' | 'medium' | 'low'
  category?: string
  audience_size?: number
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

type GroupStats = Group & {
  total_posts: number
  avg_engagement_rate: number
  total_leads: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_reach: number
  last_post_date?: string
}

type Post = {
  id: string
  company_id: string
  group_id?: string  // NEW
  post_type: PostType
  title: string
  content: string
  status: PostStatus
  leads_count: number
  engagement_rate?: number  // NEW
  reach?: number  // NEW
  likes: number  // NEW
  comments: number  // NEW
  shares: number  // NEW
  post_link?: string  // NEW
  created_at: string
  updated_at: string
  posted_at?: string
  company?: Company
  group?: Group
}
```

## Usage Examples

### 1. Add a new Facebook group

```typescript
const { data, error } = await supabase
  .from('groups')
  .insert([{
    name: 'NYC Home Improvement',
    tier: 'high',
    category: 'Local Community',
    audience_size: 5000,
    status: 'active'
  }])
```

### 2. Create a post linked to both company and group

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert([{
    company_id: 'company-uuid',
    group_id: 'group-uuid',
    post_type: 'warning_post',
    title: 'Warning: Common Issue',
    content: 'Post content...',
    status: 'draft'
  }])
```

### 3. Update engagement metrics after posting

```typescript
const { data, error } = await supabase
  .from('posts')
  .update({
    status: 'posted',
    posted_at: new Date().toISOString(),
    reach: 1500,
    likes: 45,
    comments: 12,
    shares: 8,
    engagement_rate: 4.33  // (45+12+8)/1500 * 100
  })
  .eq('id', 'post-uuid')
```

### 4. View group performance (with rollups)

```typescript
const { data } = await supabase
  .from('group_stats')
  .select('*')
  .order('total_leads', { ascending: false })

// Example result:
// {
//   name: 'NYC Home Improvement',
//   tier: 'high',
//   audience_size: 5000,
//   total_posts: 12,
//   avg_engagement_rate: 5.67,
//   total_leads: 23,
//   total_likes: 340,
//   total_reach: 18000,
//   last_post_date: '2025-10-10T...'
// }
```

### 5. Track which groups perform best

```typescript
// Get top 5 groups by lead generation
const { data } = await supabase
  .from('group_stats')
  .select('*')
  .gte('total_posts', 3)  // Only groups with 3+ posts
  .order('total_leads', { ascending: false })
  .limit(5)

// Focus your posting strategy on these high-performing groups!
```

## Migrations Applied

1. `create_groups_table` - Created groups table
2. `add_group_and_engagement_to_posts` - Added group_id and engagement fields to posts
3. `create_group_stats_view` - Created view for rollup statistics

## UI Components

- **Groups Page** (`/groups`) - Manage Facebook groups and view performance metrics
- **Posts Page** (enhanced) - Now includes group selection and engagement tracking

## Next Steps

To complete your workflow:

1. **Add groups** via the Groups page (`/groups`)
2. **Generate posts** and select which group to post to
3. **Post to Facebook** and copy the post link
4. **Update engagement** metrics once the post has been live for a day
5. **Track leads** as they come in
6. **Review group_stats** to see which groups perform best

This gives you data-driven insights into which Facebook groups are worth your time!

