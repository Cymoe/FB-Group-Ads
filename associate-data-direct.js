import { MongoClient } from 'mongodb'

// Try direct connection without SRV
const MONGODB_URI = 'mongodb://2mylescameron_db_user:4yd0rVvgxlyxkakH@ac-yqueyup-shard-00-00.3jszlkw.mongodb.net:27017,ac-yqueyup-shard-00-01.3jszlkw.mongodb.net:27017,ac-yqueyup-shard-00-02.3jszlkw.mongodb.net:27017/fb-group-ads-manager?ssl=true&replicaSet=atlas-14b8vj-shard-0&authSource=admin&retryWrites=true&w=majority'
const MONGODB_DB = 'fb-group-ads-manager'
const USER_ID = '2mylescameron'

async function associateDataWithUser() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  })
  
  try {
    console.log('🔌 Connecting to MongoDB with direct connection...')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Update companies
    console.log('🏢 Updating companies...')
    const companiesResult = await db.collection('companies').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${companiesResult.modifiedCount} companies`)
    
    // Update groups
    console.log('👥 Updating groups...')
    const groupsResult = await db.collection('groups').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${groupsResult.modifiedCount} groups`)
    
    // Update posts
    console.log('📝 Updating posts...')
    const postsResult = await db.collection('posts').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${postsResult.modifiedCount} posts`)
    
    // Update leads
    console.log('🎯 Updating leads...')
    const leadsResult = await db.collection('leads').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${leadsResult.modifiedCount} leads`)
    
    // Show final counts
    console.log('\n📊 Final data counts:')
    const companiesCount = await db.collection('companies').countDocuments({ user_id: USER_ID })
    const groupsCount = await db.collection('groups').countDocuments({ user_id: USER_ID })
    const postsCount = await db.collection('posts').countDocuments({ user_id: USER_ID })
    const leadsCount = await db.collection('leads').countDocuments({ user_id: USER_ID })
    
    console.log(`🏢 Companies: ${companiesCount}`)
    console.log(`👥 Groups: ${groupsCount}`)
    console.log(`📝 Posts: ${postsCount}`)
    console.log(`🎯 Leads: ${leadsCount}`)
    
    console.log('\n🎉 All data successfully associated with user!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

associateDataWithUser()
