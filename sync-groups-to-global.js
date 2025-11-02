import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

async function syncGroupsToGlobal() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Get all unique groups from user collections
    const allUserGroups = await db.collection('groups').find({}).toArray()
    console.log(`📊 Found ${allUserGroups.length} total groups in user collections`)
    
    let created = 0
    let updated = 0
    let skipped = 0
    
    // Group by name to handle duplicates
    const groupsByName = new Map()
    
    for (const group of allUserGroups) {
      if (!groupsByName.has(group.name)) {
        groupsByName.set(group.name, group)
      }
    }
    
    console.log(`📦 Found ${groupsByName.size} unique group names`)
    
    // Sync each unique group to global database
    for (const [groupName, group] of groupsByName) {
      try {
        // Check if it exists in global database
        const existingGlobal = await db.collection('global_groups').findOne({ name: groupName })
        
        if (!existingGlobal) {
          // Create new global group
          const newGlobalGroup = {
            name: group.name,
            category: group.category || 'General',
            description: group.description || '',
            facebook_url: group.facebook_url || '',
            location: {
              city: group.location?.city || '',
              state: group.location?.state || '',
              country: group.location?.country || 'USA'
            },
            member_count: group.member_count || 0,
            privacy: group.privacy || 'public',
            quality_score: group.quality_score || 70,
            verified: false,
            industries: group.industries || [],
            tags: group.tags || [],
            added_by_count: allUserGroups.filter(g => g.name === groupName).length,
            trending_score: 0,
            contributed_by: group.user_id,
            contributed_at: group.created_at || new Date().toISOString(),
            verified_by_admin: false,
            created_at: group.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          await db.collection('global_groups').insertOne(newGlobalGroup)
          console.log(`✅ Created global group: ${groupName}`)
          created++
        } else {
          // Update added_by_count
          const actualCount = allUserGroups.filter(g => g.name === groupName).length
          
          if (existingGlobal.added_by_count !== actualCount) {
            await db.collection('global_groups').updateOne(
              { name: groupName },
              { 
                $set: { 
                  added_by_count: actualCount,
                  updated_at: new Date().toISOString() 
                }
              }
            )
            console.log(`📊 Updated count for: ${groupName} (${existingGlobal.added_by_count} → ${actualCount})`)
            updated++
          } else {
            skipped++
          }
        }
      } catch (error) {
        console.error(`❌ Error syncing ${groupName}:`, error.message)
      }
    }
    
    console.log('\n📈 Migration Summary:')
    console.log(`   Created: ${created} new global groups`)
    console.log(`   Updated: ${updated} existing global groups`)
    console.log(`   Skipped: ${skipped} already up-to-date`)
    console.log('\n✅ Migration complete!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.close()
  }
}

syncGroupsToGlobal()

