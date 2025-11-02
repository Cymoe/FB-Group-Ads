import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function findMissingGroups() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB\n')
    
    const db = client.db(MONGODB_DB)
    
    // Get current user ID from vivo company
    const vivoCompany = await db.collection('companies').findOne({ name: 'vivo' })
    if (!vivoCompany) {
      console.log('❌ Could not find vivo company')
      return
    }
    
    console.log(`📍 Found company: ${vivoCompany.name} (user_id: ${vivoCompany.user_id})`)
    
    // Get all groups for this user
    const userGroups = await db.collection('groups')
      .find({ user_id: vivoCompany.user_id })
      .toArray()
    
    console.log(`📊 User has ${userGroups.length} groups in their collection\n`)
    
    // Get all global groups
    const globalGroups = await db.collection('global_groups').find({}).toArray()
    const globalGroupNames = new Set(globalGroups.map(g => g.name))
    
    console.log(`🌍 Global database has ${globalGroups.length} groups\n`)
    
    // Find groups in user collection but not in global
    const missingFromGlobal = []
    
    for (const userGroup of userGroups) {
      if (!globalGroupNames.has(userGroup.name)) {
        missingFromGlobal.push(userGroup)
      }
    }
    
    if (missingFromGlobal.length > 0) {
      console.log(`❌ Found ${missingFromGlobal.length} groups NOT in global database:\n`)
      missingFromGlobal.forEach(group => {
        console.log(`   - "${group.name}"`)
        console.log(`     Category: ${group.category || 'N/A'}`)
        console.log(`     Location: ${group.location?.city}, ${group.location?.state}`)
        console.log(`     Created: ${group.created_at}`)
        console.log(`     ID: ${group._id}`)
        console.log('')
      })
    } else {
      console.log('✅ All user groups exist in global database!')
    }
    
    // Also check for duplicates
    const nameCounts = {}
    userGroups.forEach(g => {
      nameCounts[g.name] = (nameCounts[g.name] || 0) + 1
    })
    
    const duplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate group names in user collection:`)
      duplicates.forEach(([name, count]) => {
        console.log(`   - "${name}" appears ${count} times`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

findMissingGroups()

