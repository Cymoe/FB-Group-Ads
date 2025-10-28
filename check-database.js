import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const DB_NAME = 'fb-group-ads-manager'

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('🔄 Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Check what data exists in the fb-group-ads-manager database
    const companiesCount = await db.collection('companies').countDocuments()
    const groupsCount = await db.collection('groups').countDocuments()
    const postsCount = await db.collection('posts').countDocuments()
    const leadsCount = await db.collection('leads').countDocuments()
    
    console.log(`📈 Found in ${DB_NAME}: ${companiesCount} companies, ${groupsCount} groups, ${postsCount} posts, ${leadsCount} leads`)
    
    if (companiesCount > 0) {
      const companies = await db.collection('companies').find({}).limit(3).toArray()
      console.log('📋 Sample companies:', companies.map(c => ({ name: c.name, user_id: c.user_id })))
    }
    
    if (groupsCount > 0) {
      const groups = await db.collection('groups').find({}).limit(3).toArray()
      console.log('📋 Sample groups:', groups.map(g => ({ name: g.name, user_id: g.user_id })))
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  } finally {
    await client.close()
  }
}

checkDatabase()

