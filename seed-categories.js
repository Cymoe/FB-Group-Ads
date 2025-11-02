/**
 * Seed FB Group Categories to MongoDB
 * 
 * This creates a master list of categories in the database
 * that the application can reference.
 */

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

console.log('Using database:', MONGODB_DB)

// Master category list - SINGLE SOURCE OF TRUTH
const FB_GROUP_CATEGORIES = [
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
]

async function seedCategories() {
  const client = new MongoClient(MONGO_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    const categoriesCollection = db.collection('fb_group_categories')
    
    // Clear existing categories
    await categoriesCollection.deleteMany({})
    console.log('🗑️  Cleared existing categories')
    
    // Insert categories with metadata
    const categoriesToInsert = FB_GROUP_CATEGORIES.map((name, index) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sort_order: index,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    await categoriesCollection.insertMany(categoriesToInsert)
    console.log(`✅ Inserted ${categoriesToInsert.length} categories`)
    
    // Create index on name for fast lookups
    await categoriesCollection.createIndex({ name: 1 }, { unique: true })
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true })
    console.log('✅ Created indexes')
    
    // Display all categories
    const categories = await categoriesCollection.find({}).sort({ sort_order: 1 }).toArray()
    console.log('\n📋 Categories in database:')
    categories.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.name}`)
    })
    
    console.log('\n✅ Categories seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seedCategories()

