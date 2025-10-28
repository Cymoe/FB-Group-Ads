import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = 'fb-group-ads-manager'

async function checkCollections() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('📋 Collections in database:')
    collections.forEach(col => {
      console.log(`  - ${col.name}`)
    })
    
    // Check leads collection specifically
    const leadsExists = collections.some(col => col.name === 'leads')
    if (leadsExists) {
      const leadsCount = await db.collection('leads').countDocuments()
      console.log(`📊 Leads collection has ${leadsCount} documents`)
    } else {
      console.log('ℹ️  Leads collection does not exist')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

checkCollections()
