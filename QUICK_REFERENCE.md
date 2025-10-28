# Quick Reference: Groups & Posts System

## 🎯 At a Glance

This system helps you track which Facebook groups generate the most leads from your posts.

## 📊 Data Flow

```
1. ADD GROUPS                    2. CREATE POSTS              3. TRACK RESULTS
   ↓                                 ↓                            ↓
┌─────────────┐              ┌─────────────┐             ┌──────────────┐
│ /groups     │              │ /posts      │             │ /groups      │
│             │              │             │             │              │
│ NYC Home    │◄─────link────│ Warning     │────leads───►│ Total: 23    │
│ Improvement │              │ Post        │             │ Avg Eng: 5.7%│
│             │              │             │             │ Posts: 12    │
│ Tier: High  │              │ Group: NYC  │             └──────────────┘
│ Size: 5000  │              │ Likes: 45   │
└─────────────┘              │ Shares: 8   │
                             └─────────────┘
```

## 🔑 Key Concepts

### Rollup = Automatic Calculation
When you link posts to groups, the system **automatically** calculates:
- How many posts you've made to each group
- Average engagement rate per group  
- Total leads generated from each group

**You don't do anything—it just works!**

### Lookup = Show Related Data
When you view a post, you can see:
- Which company it's for
- Which Facebook group it's posted in
- The group's tier and audience size

## 🎨 UI Tour

### Groups Page (`/groups`)

```
┌──────────────────────────────────────────────────┐
│ Facebook Groups                    [Add Group]   │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Total   │ │Total   │ │Total   │ │Avg     │   │
│  │Groups  │ │Posts   │ │Leads   │ │Engage  │   │
│  │  12    │ │  156   │ │  234   │ │ 5.7%   │   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                   │
│ ┌────────────────────────────────────────────┐  │
│ │ Group Name  │ Tier  │ Posts │ Engage │ 💰│  │
│ ├────────────────────────────────────────────┤  │
│ │ NYC Home    │ High  │  12   │ 6.2%  │ 23 │  │
│ │ Brooklyn... │ Med   │   8   │ 4.1%  │ 15 │  │
│ │ Queens C... │ Low   │   3   │ 2.8%  │  5 │  │
│ └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
      ▲
      │ FOCUS HERE - See which groups perform best!
```

### Post Generator (in `/posts`)

```
┌──────────────────────────────────────┐
│ Generate New Post                     │
├──────────────────────────────────────┤
│                                       │
│ 👥 Target Facebook Group              │
│ ┌─────────────────────────────────┐  │
│ │ NYC Home Improvement (high) •   │  │ ← Select which group
│ │ 5,000 members                   │  │
│ └─────────────────────────────────┘  │
│                                       │
│ Select Post Type                      │
│ [Warning] [Cost Saver] [Quick Tip]   │
│                                       │
│          [Generate Post]              │
└──────────────────────────────────────┘
```

### Post Card (shows group info)

```
┌─────────────────────────────┐
│ ⚠️  Warning Post             │
│                              │
│ "Warning: Common plumbing    │
│  issue in NYC..."            │
│                              │
│ ─────────────────────────── │
│ Company: ABC Plumbing        │
│ 👥 NYC Home Improvement • high│ ← Group info
│ Posted: Oct 11, 2025         │
└─────────────────────────────┘
```

## 🚀 5-Minute Quick Start

### 1️⃣ Add Your First Group (2 min)
```
1. Go to /groups
2. Click "Add Group"
3. Enter: "NYC Home Improvement"
4. Tier: High
5. Audience: 5000
6. Save
```

### 2️⃣ Create a Post for That Group (2 min)
```
1. Go to /posts
2. Select a company
3. Select "NYC Home Improvement" from group dropdown
4. Choose post type: Warning Post
5. Generate & Save
```

### 3️⃣ Post to Facebook & Track (1 min)
```
1. Copy the generated post
2. Post it to Facebook
3. Come back tomorrow and update:
   - Likes, comments, shares
   - Reach
   - Engagement rate
```

### 4️⃣ See Results
```
1. Go back to /groups
2. See your stats automatically updated!
   - Total posts: 1
   - Avg engagement: (whatever you entered)
   - Total leads: (as they come in)
```

## 📈 Real-World Example

**Scenario**: You manage 3 Facebook groups and want to know which one to focus on.

| Group | Posts | Avg Engagement | Leads | Time Worth It? |
|-------|-------|----------------|-------|----------------|
| NYC Home Improvement | 12 | 6.2% | 23 | ✅ YES - High ROI |
| Brooklyn Locals | 8 | 4.1% | 15 | ✅ YES - Good ROI |
| Queens Community | 3 | 2.8% | 5 | ❌ NO - Poor ROI |

**Insight**: Stop posting to Queens Community, double down on NYC Home Improvement!

## 🎯 Best Practices

### When Creating Posts
- ✅ Always select a group (so you can track performance)
- ✅ Use consistent post types per group (test what works)
- ✅ Track engagement after 24 hours (gives accurate metrics)

### When Adding Groups
- ✅ Add the actual Facebook group name
- ✅ Set tier based on:
  - High = Very engaged, local, relevant audience
  - Medium = Somewhat engaged
  - Low = Testing or broad audience
- ✅ Update audience size periodically

### Analyzing Performance
- ✅ Need at least 3 posts per group for meaningful data
- ✅ Look at engagement rate, not just total posts
- ✅ Calculate leads per post: `total_leads / total_posts`
- ✅ Focus time on high-performing groups

## 💡 Pro Tips

1. **Test Different Post Types Per Group**
   - Some groups respond better to warnings
   - Others prefer cost-saving tips
   - Track which type performs best in each group

2. **Track Posting Times**
   - Note when you post (morning/evening/weekend)
   - See patterns in engagement
   - Optimize posting schedule

3. **Quality Over Quantity**
   - 1 post in a great group > 10 posts in dead groups
   - Use the data to focus your effort

4. **Lead Quality Matters**
   - Not just number of leads
   - Track which groups send qualified leads
   - Some groups may have high engagement but low-quality leads

## 🔧 Troubleshooting

### "My rollup stats aren't showing"
- Make sure posts are linked to a group (`group_id` is set)
- Check that the group status is "active"
- Refresh the page

### "I don't see the group dropdown"
- Go to `/groups` and add at least one group
- Make sure the group status is "active"
- The dropdown only shows active groups

### "Engagement rate is wrong"
- Formula: (likes + comments + shares) / reach × 100
- Example: (45 + 12 + 8) / 1500 = 4.33%
- Make sure reach is not 0

## 📚 Database Schema Quick Reference

```sql
-- Add a group
INSERT INTO groups (name, tier, category, audience_size, status)
VALUES ('NYC Home', 'high', 'Local', 5000, 'active');

-- Create a post linked to a group
INSERT INTO posts (company_id, group_id, post_type, title, content)
VALUES ('company-uuid', 'group-uuid', 'warning_post', 'Title', 'Content');

-- Update engagement
UPDATE posts
SET likes = 45, comments = 12, shares = 8, 
    reach = 1500, engagement_rate = 4.33
WHERE id = 'post-uuid';

-- View rollup stats
SELECT * FROM group_stats
ORDER BY total_leads DESC;
```

## 🎉 That's It!

You now have a complete system to:
1. ✅ Track Facebook groups
2. ✅ Link posts to groups  
3. ✅ See automatic rollup statistics
4. ✅ Identify your best-performing groups
5. ✅ Focus your time where it matters

**Start with 2-3 groups, create some posts, and watch the data roll in!**

