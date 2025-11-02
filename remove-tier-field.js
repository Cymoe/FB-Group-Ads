import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function removeTierField() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    const groupsCollection = db.collection('groups')
    
    // Count groups with tier field
    const groupsWithTier = await groupsCollection.countDocuments({ tier: { $exists: true } })
    console.log(`\n📊 Found ${groupsWithTier} groups with 'tier' field`)
    
    if (groupsWithTier === 0) {
      console.log('✅ No groups have the tier field - nothing to remove!')
      return
    }
    
    // Remove tier field from all groups
    const result = await groupsCollection.updateMany(
      { tier: { $exists: true } },
      { $unset: { tier: "" } }
    )
    
    console.log(`\n✅ Successfully removed 'tier' field from ${result.modifiedCount} groups`)
    console.log(`   Matched: ${result.matchedCount} groups`)
    console.log(`   Modified: ${result.modifiedCount} groups`)
    
    // Verify removal
    const remaining = await groupsCollection.countDocuments({ tier: { $exists: true } })
    console.log(`\n✅ Verification: ${remaining} groups still have 'tier' field (should be 0)`)
    
  } catch (error) {
    console.error('❌ Error removing tier field:', error)
  } finally {
    await client.close()
    console.log('\n✅ Database connection closed')
  }
}

removeTierField()

