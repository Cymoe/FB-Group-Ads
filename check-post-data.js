const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://myleswebb:M3dium2024!@cluster0.mongodb.net/?retryWrites=true&w=majority'

async function checkPostData() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('fb-group-ads')
    
    // Check for posted posts without posted_at timestamp
    const postsWithoutTimestamp = await db.collection('posts').find({
      status: 'posted',
      posted_at: { $exists: false }
    }).toArray()
    
    console.log(`\n📊 Posts with status='posted' but no posted_at: ${postsWithoutTimestamp.length}`)
    
    if (postsWithoutTimestamp.length > 0) {
      console.log('\n⚠️  Sample posts missing posted_at:')
      postsWithoutTimestamp.slice(0, 3).forEach(post => {
        console.log(`  - ${post.title?.substring(0, 50)} (created: ${post.created_at})`)
      })
    }
    
    // Check all posts
    const allPosts = await db.collection('posts').find({}).toArray()
    console.log(`\n📝 Total posts: ${allPosts.length}`)
    console.log(`   - Draft: ${allPosts.filter(p => p.status === 'draft').length}`)
    console.log(`   - Ready: ${allPosts.filter(p => p.status === 'ready_to_post').length}`)
    console.log(`   - Pending: ${allPosts.filter(p => p.status === 'pending_approval').length}`)
    console.log(`   - Posted: ${allPosts.filter(p => p.status === 'posted').length}`)
    
    // Check group stats vs actual posts
    const groups = await db.collection('groups').find({}).toArray()
    console.log(`\n🔄 Checking group stats sync...`)
    
    for (const group of groups.slice(0, 3)) {
      const actualPostedPosts = await db.collection('posts').find({
        group_id: group.id,
        status: 'posted'
      }).toArray()
      
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const actualPostsThisWeek = actualPostedPosts.filter(p => 
        p.posted_at && new Date(p.posted_at) >= oneWeekAgo
      ).length
      
      console.log(`\n  Group: ${group.name}`)
      console.log(`    DB says: ${group.posts_this_week || 0} posts this week`)
      console.log(`    Actually: ${actualPostsThisWeek} posts this week`)
      console.log(`    ${group.posts_this_week === actualPostsThisWeek ? '✅' : '❌'} Sync status`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

checkPostData()
