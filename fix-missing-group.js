import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function fixMissingGroup() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB\n')
    
    const db = client.db(MONGODB_DB)
    
    // Get the specific group
    const groupId = new ObjectId('6906c0aed25166839f5e8845')
    const group = await db.collection('groups').findOne({ _id: groupId })
    
    if (!group) {
      console.log('❌ Group not found')
      return
    }
    
    console.log(`📍 Found group: "${group.name}"`)
    
    // Check if it exists in global
    const existingGlobal = await db.collection('global_groups').findOne({ name: group.name })
    
    if (existingGlobal) {
      console.log('✅ Group already exists in global database')
      return
    }
    
    // Create in global database
    const newGlobalGroup = {
      name: group.name,
      category: group.category || 'General',
      description: group.description || '',
      facebook_url: group.facebook_url || '',
      location: {
        city: group.location?.city || '',
        state: group.location?.state || '',
        country: group.location?.country || 'USA'
      },
      member_count: group.member_count || 0,
      privacy: group.privacy || 'public',
      quality_score: group.quality_score || 70,
      verified: false,
      industries: group.industries || [],
      tags: group.tags || [],
      added_by_count: 1,
      trending_score: 0,
      contributed_by: group.user_id,
      contributed_at: group.created_at || new Date().toISOString(),
      verified_by_admin: false,
      created_at: group.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await db.collection('global_groups').insertOne(newGlobalGroup)
    console.log(`✅ Added "${group.name}" to global database`)
    
    // Get updated counts
    const userGroupCount = await db.collection('groups').countDocuments({ user_id: group.user_id })
    const globalGroupCount = await db.collection('global_groups').countDocuments({})
    
    console.log(`\n📊 Updated counts:`)
    console.log(`   User groups: ${userGroupCount}`)
    console.log(`   Global groups: ${globalGroupCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

fixMissingGroup()

