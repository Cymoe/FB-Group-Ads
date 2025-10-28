import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const DB_NAME = 'fb-group-ads-manager'
const USER_ID = '2mylescameron'

async function addUserId() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('🔄 Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Add user_id to all companies
    const companiesResult = await db.collection('companies').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${companiesResult.modifiedCount} companies with user_id`)
    
    // Add user_id to all groups
    const groupsResult = await db.collection('groups').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${groupsResult.modifiedCount} groups with user_id`)
    
    // Add user_id to all posts
    const postsResult = await db.collection('posts').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${postsResult.modifiedCount} posts with user_id`)
    
    // Add user_id to all leads
    const leadsResult = await db.collection('leads').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${leadsResult.modifiedCount} leads with user_id`)
    
    console.log('🎉 All data now has user_id!')
    
    // Verify the update
    const companies = await db.collection('companies').find({}).limit(3).toArray()
    console.log('📋 Updated companies:', companies.map(c => ({ name: c.name, user_id: c.user_id })))
    
  } catch (error) {
    console.error('❌ Update failed:', error)
  } finally {
    await client.close()
  }
}

addUserId()

