# FB Group Categories - Standardization Guide

## 🎯 Problem

Previously, category lists were hardcoded in multiple places throughout the application:
- Edit Group Modal
- Add Group Modal
- Group filters
- AI Template categories
- Discovery page filters

This caused **inconsistencies** where different parts of the app showed different categories.

## ✅ Solution: Single Source of Truth

We now have a **master category list** stored in MongoDB that all parts of the application reference.

### Architecture

```
MongoDB Collection: fb_group_categories
        ↓
    API Endpoint: /api/categories
        ↓
Frontend Constant: src/constants/categories.ts
        ↓
All UI Components (Modals, Filters, etc.)
```

## 📦 Categories Collection Schema

```javascript
{
  _id: ObjectId,
  name: "Real Estate",           // Display name
  slug: "real-estate",            // URL-safe slug
  sort_order: 0,                  // Display order
  active: true,                   // Enable/disable
  created_at: "2025-11-02T...",
  updated_at: "2025-11-02T..."
}
```

## 🔧 How to Add/Modify Categories

### Method 1: Edit the seed script and re-run

1. Edit `seed-categories.js` and modify the `FB_GROUP_CATEGORIES` array
2. Run: `node seed-categories.js`
3. Restart the server: `npm run dev`

### Method 2: Direct database update (Advanced)

```javascript
// Add a new category
db.fb_group_categories.insertOne({
  name: "New Category",
  slug: "new-category",
  sort_order: 100,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

// Disable a category
db.fb_group_categories.updateOne(
  { name: "Old Category" },
  { $set: { active: false, updated_at: new Date().toISOString() } }
)
```

## 📝 Frontend Usage

### Import the constant

```typescript
import { FB_GROUP_CATEGORIES, getAllCategories } from '@/constants/categories'

// Use in dropdowns
const categories = getAllCategories() // Returns sorted array
```

### DO NOT hardcode categories

❌ **Bad:**
```typescript
<option value="Real Estate">Real Estate</option>
<option value="Business">Business</option>
// ...
```

✅ **Good:**
```typescript
{FB_GROUP_CATEGORIES.map(category => (
  <option key={category} value={category}>{category}</option>
))}
```

## 🎨 Current Master Category List (33 categories)

1. Real Estate
2. Business
3. Community
4. Local
5. General
6. Social
7. Education
8. Health
9. Finance
10. Technology
11. Entertainment
12. Sports
13. Food
14. Travel
15. Fashion
16. Beauty
17. Parenting
18. Pets
19. Automotive
20. Home & Garden
21. Buy & Sell
22. Gaming
23. Social Learning
24. Jobs
25. Work
26. Family
27. Family & Lifestyle
28. Home & Real Estate
29. Jobs & Services
30. Lifestyle
31. Misc
32. Mixed
33. Construction & Trades

## 🔄 Migration Status

- ✅ MongoDB collection created
- ✅ Seed script created
- ✅ API endpoint created (`/api/categories`)
- ✅ Frontend constant created
- ⏳ **TODO: Update all UI components to use the constant**

## 📋 Files to Update

The following files still have hardcoded category lists that need to be replaced:

1. `src/EnhancedApp.tsx`
   - EditGroupModal component (lines ~1648-1669)
   - AddGroupModal component (lines ~2731-2752)

2. `src/pages/GroupsPage.tsx`
   - Advanced filters category buttons

3. `src/components/aiTemplates.ts`
   - AI template categories (if relevant)

## 🚀 Next Steps

1. Import `FB_GROUP_CATEGORIES` from `src/constants/categories.ts`
2. Replace all hardcoded `<option>` lists with mapped categories
3. Test all dropdowns and filters
4. Remove hardcoded arrays

## 📊 Benefits

✅ **Consistency** - Same categories everywhere  
✅ **Maintainability** - Update in one place  
✅ **Scalability** - Easy to add/remove categories  
✅ **Database-driven** - Categories can be managed via admin panel (future)  
✅ **Type-safe** - TypeScript types for categories

