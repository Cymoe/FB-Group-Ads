import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = 'fb-group-ads-manager'

async function deleteLeadsCollection() {
  let client
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000
    })
    
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // List collections first
    const collections = await db.listCollections().toArray()
    console.log('📋 Current collections:')
    collections.forEach(col => console.log(`  - ${col.name}`))
    
    // Check if leads exists
    const leadsExists = collections.some(col => col.name === 'leads')
    
    if (leadsExists) {
      console.log('🗑️  Removing leads collection...')
      await db.collection('leads').drop()
      console.log('✅ Successfully removed leads collection!')
    } else {
      console.log('ℹ️  Leads collection does not exist')
    }
    
    // Show remaining collections
    const remainingCollections = await db.listCollections().toArray()
    console.log('📋 Remaining collections:')
    remainingCollections.forEach(col => console.log(`  - ${col.name}`))
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Disconnected from MongoDB')
    }
  }
}

deleteLeadsCollection()
