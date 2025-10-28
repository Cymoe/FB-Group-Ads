import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'fb-group-ads-manager'

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...')
  console.log('📦 Database:', dbName)
  
  try {
    const client = new MongoClient(uri)
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    const db = client.db(dbName)
    
    // Test collections
    const collections = await db.listCollections().toArray()
    console.log('\n📊 Collections found:', collections.map(c => c.name).join(', '))
    
    // Count documents
    const companiesCount = await db.collection('companies').countDocuments()
    const groupsCount = await db.collection('groups').countDocuments()
    const postsCount = await db.collection('posts').countDocuments()
    const usersCount = await db.collection('users').countDocuments()
    
    console.log('\n📈 Document counts:')
    console.log('  - Companies:', companiesCount)
    console.log('  - Groups:', groupsCount)
    console.log('  - Posts:', postsCount)
    console.log('  - Users:', usersCount)
    
    // Sample data
    if (companiesCount > 0) {
      const sampleCompany = await db.collection('companies').findOne()
      console.log('\n🏢 Sample company:', JSON.stringify(sampleCompany, null, 2))
    }
    
    await client.close()
    console.log('\n✅ Test complete!')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error(error)
  }
}

testConnection()

