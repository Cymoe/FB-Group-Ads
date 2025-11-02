import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function removeDuplicates() {
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
    
    // Get all groups for this user
    const userGroups = await db.collection('groups')
      .find({ user_id: vivoCompany.user_id })
      .toArray()
    
    console.log(`📊 User has ${userGroups.length} groups\n`)
    
    // Find duplicates
    const groupsByName = new Map()
    const duplicates = []
    
    for (const group of userGroups) {
      if (groupsByName.has(group.name)) {
        duplicates.push({
          name: group.name,
          original: groupsByName.get(group.name),
          duplicate: group
        })
      } else {
        groupsByName.set(group.name, group)
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!')
      return
    }
    
    console.log(`⚠️  Found ${duplicates.length} duplicate(s):\n`)
    
    for (const dup of duplicates) {
      console.log(`📋 Group: "${dup.name}"`)
      console.log(`   Original: ${dup.original._id} (created: ${dup.original.created_at})`)
      console.log(`   Duplicate: ${dup.duplicate._id} (created: ${dup.duplicate.created_at})`)
      
      // Delete the duplicate (keep the older one)
      const result = await db.collection('groups').deleteOne({ _id: dup.duplicate._id })
      
      if (result.deletedCount > 0) {
        console.log(`   ✅ Removed duplicate\n`)
      } else {
        console.log(`   ❌ Failed to remove duplicate\n`)
      }
    }
    
    // Get updated count
    const finalCount = await db.collection('groups').countDocuments({ user_id: vivoCompany.user_id })
    console.log(`\n📊 Final count: ${finalCount} groups`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

removeDuplicates()

