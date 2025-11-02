import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function debugGroupCounts() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB\n')
    
    const db = client.db(MONGODB_DB)
    
    // Get vivo user
    const vivoCompany = await db.collection('companies').findOne({ name: 'vivo' })
    if (!vivoCompany) {
      console.log('❌ Could not find vivo company')
      return
    }
    
    console.log(`📍 Vivo user_id: ${vivoCompany.user_id}\n`)
    
    // Get all user groups
    const userGroups = await db.collection('groups')
      .find({ user_id: vivoCompany.user_id })
      .toArray()
    
    console.log(`👤 User Groups Collection: ${userGroups.length} groups`)
    
    // Get all global groups
    const globalGroups = await db.collection('global_groups').find({}).toArray()
    console.log(`🌍 Global Groups Collection: ${globalGroups.length} groups\n`)
    
    // Create a map of user group names
    const userGroupNames = new Set(userGroups.map(g => g.name))
    
    // Find global groups NOT in user collection
    const notAdded = globalGroups.filter(g => !userGroupNames.has(g.name))
    
    console.log(`❌ Groups in global but NOT added by vivo: ${notAdded.length}`)
    if (notAdded.length > 0) {
      notAdded.forEach(g => {
        console.log(`   - "${g.name}" (added_by_count: ${g.added_by_count || 0})`)
      })
    }
    
    console.log(`\n✅ Groups added by vivo: ${userGroups.length}`)
    console.log(`🌍 Total global groups: ${globalGroups.length}`)
    console.log(`📊 Available to add: ${notAdded.length}`)
    console.log(`\n🧮 Math check: ${userGroups.length} + ${notAdded.length} = ${userGroups.length + notAdded.length}`)
    
    // Check for groups in user collection but NOT in global
    const userGroupNamesArray = userGroups.map(g => g.name)
    const globalGroupNames = new Set(globalGroups.map(g => g.name))
    const missingFromGlobal = userGroups.filter(g => !globalGroupNames.has(g.name))
    
    if (missingFromGlobal.length > 0) {
      console.log(`\n⚠️  Groups in user collection but NOT in global: ${missingFromGlobal.length}`)
      missingFromGlobal.forEach(g => {
        console.log(`   - "${g.name}"`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

debugGroupCounts()

