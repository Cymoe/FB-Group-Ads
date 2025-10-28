import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = 'fb-group-ads-manager'

async function fixPostedDates() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    
    // Find all posted posts without a posted_at date
    const postsWithoutDate = await db.collection('posts')
      .find({ 
        status: 'posted',
        posted_at: { $exists: false }
      })
      .toArray()
    
    console.log(`📊 Found ${postsWithoutDate.length} posted posts without posted_at timestamp`)
    
    // Update each post to have posted_at = created_at (or now if created_at doesn't exist)
    for (const post of postsWithoutDate) {
      const posted_at = post.created_at || new Date().toISOString()
      
      await db.collection('posts').updateOne(
        { _id: post._id },
        { 
          $set: { 
            posted_at: posted_at,
            updated_at: new Date().toISOString()
          } 
        }
      )
      
      console.log(`✅ Updated post ${post.id} with posted_at: ${posted_at}`)
    }
    
    // Now update all group frequencies
    const groups = await db.collection('groups').find({}).toArray()
    console.log(`\n🔄 Updating posting frequency for ${groups.length} groups...`)
    
    for (const group of groups) {
      const now = new Date()
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
      
      // Count posts in the last week and month for this group
      const postsThisWeek = await db.collection('posts').countDocuments({
        group_id: group.id,
        status: 'posted',
        posted_at: { $gte: oneWeekAgo.toISOString() }
      })
      
      const postsThisMonth = await db.collection('posts').countDocuments({
        group_id: group.id,
        status: 'posted',
        posted_at: { $gte: oneMonthAgo.toISOString() }
      })
      
      // Get the most recent post date
      const latestPost = await db.collection('posts')
        .find({ group_id: group.id, status: 'posted' })
        .sort({ posted_at: -1 })
        .limit(1)
        .toArray()
      
      const lastPostDate = latestPost.length > 0 ? latestPost[0].posted_at : null
      
      // Update the group with frequency data
      await db.collection('groups').updateOne(
        { id: group.id },
        { 
          $set: { 
            last_post_date: lastPostDate,
            posts_this_week: postsThisWeek,
            posts_this_month: postsThisMonth,
            updated_at: now.toISOString()
          } 
        }
      )
      
      if (postsThisWeek > 0 || postsThisMonth > 0) {
        console.log(`✅ ${group.name}: ${postsThisWeek} posts this week, ${postsThisMonth} this month`)
      }
    }
    
    console.log('\n✅ All done! Refresh your browser to see the updated frequencies.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

fixPostedDates()

