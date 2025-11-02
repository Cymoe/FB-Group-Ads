import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!')
  process.exit(1)
}

async function migrateGroupsToGlobal() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(MONGODB_DB)
    const groupsCollection = db.collection('groups')
    const globalGroupsCollection = db.collection('global_groups')

    // Get all existing user groups
    const userGroups = await groupsCollection.find({}).toArray()
    console.log(`📊 Found ${userGroups.length} user groups`)

    let migrated = 0
    let skipped = 0

    for (const group of userGroups) {
      // Check if group already exists in global database
      const existing = await globalGroupsCollection.findOne({ name: group.name })
      
      if (existing) {
        console.log(`⏭️  Skipping "${group.name}" - already in global database`)
        skipped++
        continue
      }

      // Create global group from user group
      const globalGroup = {
        name: group.name,
        category: group.category || 'General',
        description: group.description || '',
        facebook_url: group.facebook_url || '',
        location: {
          city: group.target_city || 'Unknown',
          state: group.target_state || 'TX',
          country: 'USA',
          coordinates: {
            lat: 31.9973, // Default to Midland, TX
            lng: -102.0779
          }
        },
        member_count: group.audience_size || 0,
        privacy: group.privacy || 'public',
        quality_score: (group.quality_rating || 5) * 10, // Convert 1-10 to 0-100
        verified: group.qa_status === 'approved',
        quality_indicators: {
          engagement_rate: 3.5,
          avg_comments_per_post: 8,
          response_rate: 25,
          admin_response_time: '< 4 hours',
          business_friendly: true,
          posting_limit: '2-3 per week',
          best_posting_times: {
            days: ['Monday', 'Tuesday', 'Thursday'],
            hours: '9am-2pm'
          },
          active_businesses_count: Math.floor(Math.random() * 50) + 10,
          content_preferences: ['Local Recommendations', 'Community Events']
        },
        industries: [],
        tags: [],
        added_by_count: 1, // Start with 1 since the user who created it has it
        trending_score: 50,
        contributed_by: 'system',
        contributed_at: new Date().toISOString(),
        verified_by_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await globalGroupsCollection.insertOne(globalGroup)
      console.log(`✅ Migrated "${group.name}" to global database`)
      migrated++
    }

    console.log(`\n🎉 Migration complete!`)
    console.log(`   ✅ Migrated: ${migrated} groups`)
    console.log(`   ⏭️  Skipped: ${skipped} groups (already exist)`)
    console.log(`   📊 Total in global database: ${await globalGroupsCollection.countDocuments()}`)

  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await client.close()
  }
}

migrateGroupsToGlobal()

