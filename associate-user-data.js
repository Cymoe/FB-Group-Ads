import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb://2mylescameron_db_user:4yd0rVvgxlyxkakH@ac-yqueyup-shard-00-00.3jszlkw.mongodb.net:27017,ac-yqueyup-shard-00-01.3jszlkw.mongodb.net:27017,ac-yqueyup-shard-00-02.3jszlkw.mongodb.net:27017/fb-group-ads-manager?ssl=true&replicaSet=atlas-14b8vj-shard-0&authSource=admin&retryWrites=true&w=majority'
const MONGODB_DB = 'fb-group-ads-manager'
const USER_ID = '2mylescameron' // Your Google user ID

async function associateUserData() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  })
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Check current data counts
    console.log('\n📊 Current data counts:')
    const companiesCount = await db.collection('companies').countDocuments()
    const groupsCount = await db.collection('groups').countDocuments()
    const postsCount = await db.collection('posts').countDocuments()
    const leadsCount = await db.collection('leads').countDocuments()
    
    console.log(`🏢 Companies: ${companiesCount}`)
    console.log(`👥 Groups: ${groupsCount}`)
    console.log(`📝 Posts: ${postsCount}`)
    console.log(`🎯 Leads: ${leadsCount}`)
    
    // Update companies
    console.log('\n🏢 Updating companies...')
    const companiesResult = await db.collection('companies').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${companiesResult.modifiedCount} companies`)
    
    // Update groups
    console.log('\n👥 Updating groups...')
    const groupsResult = await db.collection('groups').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${groupsResult.modifiedCount} groups`)
    
    // Update posts
    console.log('\n📝 Updating posts...')
    const postsResult = await db.collection('posts').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${postsResult.modifiedCount} posts`)
    
    // Update leads
    console.log('\n🎯 Updating leads...')
    const leadsResult = await db.collection('leads').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: USER_ID } }
    )
    console.log(`✅ Updated ${leadsResult.modifiedCount} leads`)
    
    // Show final counts with user_id
    console.log('\n📊 Final data counts with user_id:')
    const finalCompaniesCount = await db.collection('companies').countDocuments({ user_id: USER_ID })
    const finalGroupsCount = await db.collection('groups').countDocuments({ user_id: USER_ID })
    const finalPostsCount = await db.collection('posts').countDocuments({ user_id: USER_ID })
    const finalLeadsCount = await db.collection('leads').countDocuments({ user_id: USER_ID })
    
    console.log(`🏢 Companies with user_id: ${finalCompaniesCount}`)
    console.log(`👥 Groups with user_id: ${finalGroupsCount}`)
    console.log(`📝 Posts with user_id: ${finalPostsCount}`)
    console.log(`🎯 Leads with user_id: ${finalLeadsCount}`)
    
    console.log('\n🎉 All data successfully associated with user!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

associateUserData()
