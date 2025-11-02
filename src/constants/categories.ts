/**
 * Facebook Group Categories - Single Source of Truth
 * 
 * These categories are fetched from the database and cached.
 * DO NOT hardcode category lists anywhere else in the application.
 */

export const FB_GROUP_CATEGORIES = [
  'Real Estate',
  'Business',
  'Community',
  'Local',
  'General',
  'Social',
  'Education',
  'Health',
  'Finance',
  'Technology',
  'Entertainment',
  'Sports',
  'Food',
  'Travel',
  'Fashion',
  'Beauty',
  'Parenting',
  'Pets',
  'Automotive',
  'Home & Garden',
  'Buy & Sell',
  'Gaming',
  'Social Learning',
  'Jobs',
  'Work',
  'Family',
  'Family & Lifestyle',
  'Home & Real Estate',
  'Jobs & Services',
  'Lifestyle',
  'Misc',
  'Mixed',
  'Construction & Trades'
] as const

export type FBGroupCategory = typeof FB_GROUP_CATEGORIES[number]

/**
 * Get all categories (alphabetically sorted)
 */
export function getAllCategories(): readonly string[] {
  return [...FB_GROUP_CATEGORIES].sort()
}

/**
 * Check if a category is valid
 */
export function isValidCategory(category: string): category is FBGroupCategory {
  return FB_GROUP_CATEGORIES.includes(category as FBGroupCategory)
}

