import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = 'fb-group-ads-manager'

async function checkUserIds() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  })
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Check what user_id values exist
    console.log('\n📊 Checking existing user_id values:')
    
    const companies = await db.collection('companies').find({}).toArray()
    console.log('🏢 Companies user_ids:', companies.map(c => c.user_id))
    
    const groups = await db.collection('groups').find({}).toArray()
    console.log('👥 Groups user_ids:', groups.map(g => g.user_id))
    
    const posts = await db.collection('posts').find({}).toArray()
    console.log('📝 Posts user_ids:', posts.map(p => p.user_id))
    
    const leads = await db.collection('leads').find({}).toArray()
    console.log('🎯 Leads user_ids:', leads.map(l => l.user_id))
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

checkUserIds()
