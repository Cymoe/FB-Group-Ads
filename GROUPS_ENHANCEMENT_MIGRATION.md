# Groups Enhancement Migration Guide

## Overview

This migration adds enhanced tracking fields to the `groups` collection to provide better organization, filtering, and management capabilities for Facebook groups.

## New Fields Added

### 1. **privacy** (GroupPrivacy)
- **Type**: `string` (enum: 'public' | 'private' | 'closed')
- **Default**: `'public'`
- **Purpose**: Track group privacy settings for posting strategy
- **Use Case**: Private groups require approval; public groups allow instant posting

### 2. **target_city** (string, optional)
- **Type**: `string`
- **Purpose**: Geographic targeting - city/town where group is focused
- **Example**: "Phoenix", "Scottsdale", "Tempe"
- **Use Case**: Match groups to company service areas

### 3. **target_state** (string, optional)
- **Type**: `string` (2-character state code)
- **Purpose**: Geographic targeting - state where group is focused
- **Example**: "AZ", "NY", "CA"
- **Use Case**: Filter groups by state for regional campaigns

### 4. **quality_rating** (number, optional)
- **Type**: `number` (1-10 scale)
- **Default**: `5`
- **Purpose**: Rate group quality based on engagement and lead generation
- **Use Case**: Prioritize high-quality groups for best content
- **Rating Guide**:
  - 9-10: Exceptional engagement, high-quality leads
  - 7-8: Very good engagement, consistent leads
  - 5-6: Moderate engagement, some leads
  - 3-4: Low engagement, few leads
  - 1-2: Poor engagement, no leads

### 5. **qa_status** (GroupQAStatus)
- **Type**: `string` (enum: 'new' | 'pending_approval' | 'approved' | 'rejected')
- **Default**: `'new'`
- **Purpose**: Track approval workflow for posting access
- **States**:
  - `new`: Just added, not yet tested
  - `pending_approval`: Waiting for group admin approval
  - `approved`: Ready to post, access confirmed
  - `rejected`: Can't post in this group

## MongoDB Schema Update

No database migration script is needed for MongoDB as it's schemaless. The new fields will be added automatically when creating or updating groups.

### Updated Group Document Structure

```javascript
{
  _id: ObjectId,
  id: String (UUID),
  name: String,
  company_id: String (UUID),
  user_id: String (UUID),
  
  // Existing fields
  tier: String ('high' | 'medium' | 'low'),
  category: String,
  audience_size: Number,
  status: String ('active' | 'inactive' | 'pending'),
  
  // NEW: Enhanced tracking fields
  privacy: String ('public' | 'private' | 'closed'),
  target_city: String,
  target_state: String,
  quality_rating: Number (1-10),
  qa_status: String ('new' | 'pending_approval' | 'approved' | 'rejected'),
  
  // Posting frequency tracking
  last_post_date: Date,
  posts_this_week: Number,
  posts_this_month: Number,
  recommended_frequency: Number,
  
  created_at: Date,
  updated_at: Date
}
```

## API Updates

### POST /api/groups
Create a new group with enhanced fields:

```javascript
POST /api/groups
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Phoenix Home Services Group",
  "company_id": "uuid-here",
  "category": "Community",
  "tier": "high",
  "audience_size": 15000,
  "privacy": "private",
  "target_city": "Phoenix",
  "target_state": "AZ",
  "quality_rating": 8,
  "qa_status": "approved"
}
```

### PUT /api/groups/:id
Update an existing group:

```javascript
PUT /api/groups/uuid-here
Content-Type: application/json
Authorization: Bearer <token>

{
  "quality_rating": 9,
  "qa_status": "approved",
  "privacy": "public"
}
```

## UI Enhancements

### 1. Add Group Modal
New fields added to the form:
- **Privacy**: Dropdown (Public/Private/Closed)
- **Target City**: Text input
- **Target State**: Text input (2 chars, uppercase)
- **Quality Rating**: Slider (1-10) with star visualization
- **QA Status**: Dropdown with workflow states

### 2. Sidebar Group Cards
Enhanced display showing:
- 📍 Location (City, State)
- Privacy badge (🌐 Public / 🔒 Private / 🔐 Closed)
- ⭐ Quality rating (visual stars + numeric)
- QA Status badge (🆕 New / ⏳ Pending / ✅ Approved)

### 3. Advanced Filters
New filtering options:
- **Privacy Filter**: All / 🌐 Public / 🔒 Private / 🔐 Closed
- **QA Status Filter**: All / ✅ Approved / ⏳ Pending / 🆕 New
- **Quality Filter**: Slider to set minimum quality rating

## Migration Path for Existing Data

### Option 1: Automatic Defaults (Recommended)
Existing groups will automatically get default values when accessed:
- `privacy`: 'public'
- `qa_status`: 'new'
- `quality_rating`: 5
- `target_city`: null
- `target_state`: null

### Option 2: Bulk Update Script (Optional)
If you want to set specific values for existing groups:

```javascript
// bulk-update-groups.js
const { MongoClient } = require('mongodb')

async function bulkUpdateGroups() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  
  const db = client.db('aiads')
  const groups = db.collection('groups')
  
  // Update all existing groups with defaults
  const result = await groups.updateMany(
    { privacy: { $exists: false } },
    {
      $set: {
        privacy: 'public',
        qa_status: 'new',
        quality_rating: 5
      }
    }
  )
  
  console.log(`✅ Updated ${result.modifiedCount} groups`)
  await client.close()
}

bulkUpdateGroups()
```

## TypeScript Type Updates

Updated types in `src/types/database.ts`:

```typescript
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
  privacy?: GroupPrivacy
  target_city?: string
  target_state?: string
  quality_rating?: number  // 1-10
  qa_status?: GroupQAStatus
  
  user_id: string
  created_at: string
  updated_at: string
  last_post_date?: string
  posts_this_week?: number
  posts_this_month?: number
  recommended_frequency?: number
}
```

## Usage Examples

### Creating a Group with All Fields

```typescript
const newGroup = await addGroup({
  name: 'Scottsdale Homeowners Network',
  company_id: selectedCompanyId,
  category: 'Community',
  tier: 'high',
  audience_size: 12500,
  privacy: 'private',
  target_city: 'Scottsdale',
  target_state: 'AZ',
  quality_rating: 9,
  qa_status: 'approved',
  status: 'active',
  user_id: currentUserId
})
```

### Filtering Groups by Location

```typescript
// Find all Phoenix, AZ groups
const phoenixGroups = groups.filter(g => 
  g.target_city === 'Phoenix' && g.target_state === 'AZ'
)

// Find all Arizona groups
const azGroups = groups.filter(g => g.target_state === 'AZ')
```

### Filtering by Quality

```typescript
// Get only high-quality groups (8+)
const topGroups = groups.filter(g => 
  (g.quality_rating || 0) >= 8
)
```

### Filtering by Approval Status

```typescript
// Get groups ready to post
const readyGroups = groups.filter(g => 
  g.qa_status === 'approved'
)

// Get groups needing attention
const pendingGroups = groups.filter(g => 
  g.qa_status === 'pending_approval' || g.qa_status === 'new'
)
```

## Backend Server Updates

The server automatically handles these fields through the existing endpoints:

```javascript
// server.js - Groups endpoints already support arbitrary fields
app.post('/api/groups', authenticateToken, async (req, res) => {
  // All new fields are automatically saved to MongoDB
  const group = {
    id: uuidv4(),
    ...req.body,
    user_id: req.user.userId,
    created_at: new Date(),
    updated_at: new Date()
  }
  
  await db.collection('groups').insertOne(group)
  res.json(group)
})
```

No server code changes are required! MongoDB's schemaless nature means the new fields work immediately.

## Testing Checklist

- [ ] Create a new group with all fields populated
- [ ] Verify group displays correctly in sidebar with new badges
- [ ] Test privacy filter (Public/Private/Closed)
- [ ] Test QA status filter (Approved/Pending/New)
- [ ] Test quality rating slider filter
- [ ] Edit existing group and update quality rating
- [ ] Verify location displays correctly (City, State)
- [ ] Check that filters combine properly (e.g., "Approved + Phoenix + 8+ rating")
- [ ] Test creating group without optional fields (should use defaults)
- [ ] Verify existing groups still work without new fields

## Benefits

### For Users
1. **Better Organization**: Filter groups by location, privacy, and quality
2. **Workflow Tracking**: Know which groups are ready to post vs pending approval
3. **Quality Focus**: Prioritize high-performing groups for your best content
4. **Location Matching**: Easily find groups in your service area

### For Business
1. **Lead Quality**: Track which groups generate the best leads
2. **Strategic Posting**: Focus on approved, high-quality groups
3. **Geographic Targeting**: Match content to local groups
4. **Approval Management**: Track group access status

## Future Enhancements

Potential additions based on usage:
- **Auto-calculate quality**: Based on engagement_rate from posts
- **Location autocomplete**: Use Google Places API for city/state
- **Bulk actions**: Update multiple groups at once
- **Quality trends**: Track how group quality changes over time
- **Smart recommendations**: Suggest groups based on company location

---

**Migration Status**: ✅ Complete
**Breaking Changes**: None (all fields are optional)
**Rollback**: N/A (schemaless database - simply don't use new fields)

