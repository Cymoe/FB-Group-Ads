import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = 'fb-group-ads-manager'
const OLD_USER_ID = '2mylescameron'
const NEW_USER_ID = '103790072909526511123' // Your current Google user ID

async function updateUserIds() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  })
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Update companies
    console.log('\n🏢 Updating companies...')
    const companiesResult = await db.collection('companies').updateMany(
      { user_id: OLD_USER_ID },
      { $set: { user_id: NEW_USER_ID } }
    )
    console.log(`✅ Updated ${companiesResult.modifiedCount} companies`)
    
    // Update groups
    console.log('\n👥 Updating groups...')
    const groupsResult = await db.collection('groups').updateMany(
      { user_id: OLD_USER_ID },
      { $set: { user_id: NEW_USER_ID } }
    )
    console.log(`✅ Updated ${groupsResult.modifiedCount} groups`)
    
    // Update posts
    console.log('\n📝 Updating posts...')
    const postsResult = await db.collection('posts').updateMany(
      { user_id: OLD_USER_ID },
      { $set: { user_id: NEW_USER_ID } }
    )
    console.log(`✅ Updated ${postsResult.modifiedCount} posts`)
    
    // Update leads
    console.log('\n🎯 Updating leads...')
    const leadsResult = await db.collection('leads').updateMany(
      { user_id: OLD_USER_ID },
      { $set: { user_id: NEW_USER_ID } }
    )
    console.log(`✅ Updated ${leadsResult.modifiedCount} leads`)
    
    // Show final counts
    console.log('\n📊 Final data counts:')
    const finalCompaniesCount = await db.collection('companies').countDocuments({ user_id: NEW_USER_ID })
    const finalGroupsCount = await db.collection('groups').countDocuments({ user_id: NEW_USER_ID })
    const finalPostsCount = await db.collection('posts').countDocuments({ user_id: NEW_USER_ID })
    const finalLeadsCount = await db.collection('leads').countDocuments({ user_id: NEW_USER_ID })
    
    console.log(`🏢 Companies with new user_id: ${finalCompaniesCount}`)
    console.log(`👥 Groups with new user_id: ${finalGroupsCount}`)
    console.log(`📝 Posts with new user_id: ${finalPostsCount}`)
    console.log(`🎯 Leads with new user_id: ${finalLeadsCount}`)
    
    console.log('\n🎉 All data successfully updated with correct user_id!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

updateUserIds()
