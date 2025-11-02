import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function verifyCounts() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    // Get vivo user
    const vivoCompany = await db.collection('companies').findOne({ name: 'vivo' })
    
    const userGroupCount = await db.collection('groups').countDocuments({ user_id: vivoCompany.user_id })
    const globalGroupCount = await db.collection('global_groups').countDocuments({})
    
    console.log('📊 Current Counts:')
    console.log(`   Your Groups: ${userGroupCount}`)
    console.log(`   Global Groups: ${globalGroupCount}`)
    console.log(`   Match: ${userGroupCount === globalGroupCount ? '✅ YES' : '❌ NO'}`)
    
    if (userGroupCount !== globalGroupCount) {
      const userGroups = await db.collection('groups').find({ user_id: vivoCompany.user_id }).toArray()
      const globalGroups = await db.collection('global_groups').find({}).toArray()
      const globalNames = new Set(globalGroups.map(g => g.name))
      
      const missing = userGroups.filter(g => !globalNames.has(g.name))
      if (missing.length > 0) {
        console.log('\n❌ Missing from global:')
        missing.forEach(g => console.log(`   - ${g.name}`))
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

verifyCounts()

