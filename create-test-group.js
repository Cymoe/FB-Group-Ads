import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()

async function createTestGroup() {
  const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    console.log('📂 Database:', MONGODB_DB)
    
    const db = client.db(MONGODB_DB)
    const groups = db.collection('groups')
    
    // Get the first user_id from existing groups to use for the test
    const existingGroup = await groups.findOne({})
    if (!existingGroup) {
      console.log('❌ No existing groups found. Need a user_id.')
      return
    }
    
    const user_id = existingGroup.user_id
    const company_id = existingGroup.company_id
    
    console.log(`📋 Using user_id: ${user_id}`)
    console.log(`📋 Using company_id: ${company_id}`)
    
    // Create test group with ALL new fields
    const testGroup = {
      id: `test-group-${Date.now()}`,
      name: 'TEST - Phoenix HVAC Pros',
      description: 'Test group to verify new fields work correctly',
      company_id: company_id,
      user_id: user_id,
      
      // Original fields
      category: 'Home & Garden',
      tier: 'high',
      audience_size: 5000,
      status: 'active',
      
      // NEW FIELDS ✨
      privacy: 'private',
      target_city: 'Phoenix',
      target_state: 'AZ',
      quality_rating: 8,
      qa_status: 'approved',
      
      // Posting tracking
      last_post_date: null,
      posts_this_week: 0,
      posts_this_month: 0,
      recommended_frequency: 3,
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const result = await groups.insertOne(testGroup)
    console.log('✅ Test group created successfully!')
    console.log('📊 Group ID:', testGroup.id)
    console.log('📍 Location:', testGroup.target_city, testGroup.target_state)
    console.log('🔒 Privacy:', testGroup.privacy)
    console.log('⭐ Quality:', testGroup.quality_rating + '/10')
    console.log('✅ QA Status:', testGroup.qa_status)
    console.log('\n🎯 Refresh your app to see the new group!')
    
  } catch (error) {
    console.error('❌ Error creating test group:', error)
  } finally {
    await client.close()
  }
}

createTestGroup()

