/**
 * Update quality ratings from 10-star to 5-star scale
 * 
 * This script converts all existing quality_rating values from 1-10 scale to 1-5 scale
 * by dividing by 2 and rounding up.
 */

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

console.log('Using database:', MONGODB_DB)

async function updateQualityRatings() {
  const client = new MongoClient(MONGO_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Update user groups (quality_rating field)
    const groupsCollection = db.collection('groups')
    const groups = await groupsCollection.find({ quality_rating: { $exists: true } }).toArray()
    
    console.log(`\n📊 Found ${groups.length} groups with quality_rating`)
    
    let updatedCount = 0
    for (const group of groups) {
      if (group.quality_rating > 5) {
        // Convert 1-10 scale to 1-5 scale (divide by 2, round up)
        const newRating = Math.ceil(group.quality_rating / 2)
        await groupsCollection.updateOne(
          { _id: group._id },
          { $set: { quality_rating: newRating } }
        )
        console.log(`   ${group.name}: ${group.quality_rating} → ${newRating}`)
        updatedCount++
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} groups`)
    
    // Update global groups (quality_score field 0-100)
    const globalGroupsCollection = db.collection('global_groups')
    const globalGroups = await globalGroupsCollection.find({ quality_score: { $exists: true } }).toArray()
    
    console.log(`\n📊 Found ${globalGroups.length} global groups with quality_score`)
    
    let globalUpdatedCount = 0
    for (const group of globalGroups) {
      if (group.quality_score > 50) {
        // Convert 0-100 scale to 0-100 (but we'll display as 1-5, so map 100->100, 50->50, etc.)
        // Keep the 0-100 scale but we'll convert on display: divide by 20 instead of 10
        // No change needed to quality_score, just display logic
        console.log(`   ${group.name}: ${group.quality_score} (no change, displayed as ${Math.round(group.quality_score / 20)}/5)`)
      }
    }
    
    console.log(`\n✅ Global groups use quality_score (0-100), converted on display`)
    
    console.log('\n✅ Quality rating migration complete!')
    console.log('\n📝 Summary:')
    console.log(`   - User groups: Updated ${updatedCount} from 10-star to 5-star scale`)
    console.log(`   - Global groups: quality_score (0-100) converted to 1-5 on display (÷20)`)
    
  } catch (error) {
    console.error('❌ Error updating quality ratings:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

updateQualityRatings()

