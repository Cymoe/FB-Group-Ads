import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://myleswebb:myleswebb@cluster0.8xqjq.mongodb.net/'
const MONGODB_DB = process.env.MONGODB_DB || 'fb-group-ads-manager'

// Your user ID from Google OAuth (you'll need to get this from the browser console after logging in)
const USER_ID = 'your-google-user-id-here' // Replace with your actual Google user ID

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)
  return { client, db }
}

async function migrateUserData() {
  const { client, db } = await connectToDatabase()
  
  try {
    console.log('🔄 Starting user data migration...')
    
    // Update companies
    const companiesResult = await db.collection('companies').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${companiesResult.modifiedCount} companies`)
    
    // Update groups
    const groupsResult = await db.collection('groups').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${groupsResult.modifiedCount} groups`)
    
    // Update posts
    const postsResult = await db.collection('posts').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${postsResult.modifiedCount} posts`)
    
    // Update leads
    const leadsResult = await db.collection('leads').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${leadsResult.modifiedCount} leads`)
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.close()
  }
}

migrateUserData()

