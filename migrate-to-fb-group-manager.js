import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const OLD_DB = 'aiads'
const NEW_DB = 'fb-group-ads-manager'
const USER_ID = '2mylescameron'

async function migrateData() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('🔄 Connected to MongoDB')
    
    const oldDb = client.db(OLD_DB)
    const newDb = client.db(NEW_DB)
    
    // Check what data exists in the old database
    const companiesCount = await oldDb.collection('companies').countDocuments()
    const groupsCount = await oldDb.collection('groups').countDocuments()
    const postsCount = await oldDb.collection('posts').countDocuments()
    const leadsCount = await oldDb.collection('leads').countDocuments()
    
    console.log(`📈 Found in ${OLD_DB}: ${companiesCount} companies, ${groupsCount} groups, ${postsCount} posts, ${leadsCount} leads`)
    
    // Migrate companies
    if (companiesCount > 0) {
      const companies = await oldDb.collection('companies').find({}).toArray()
      const companiesWithUserId = companies.map(company => ({
        ...company,
        user_id: USER_ID
      }))
      await newDb.collection('companies').insertMany(companiesWithUserId)
      console.log(`✅ Migrated ${companiesCount} companies to ${NEW_DB}`)
    }
    
    // Migrate groups
    if (groupsCount > 0) {
      const groups = await oldDb.collection('groups').find({}).toArray()
      const groupsWithUserId = groups.map(group => ({
        ...group,
        user_id: USER_ID
      }))
      await newDb.collection('groups').insertMany(groupsWithUserId)
      console.log(`✅ Migrated ${groupsCount} groups to ${NEW_DB}`)
    }
    
    // Migrate posts
    if (postsCount > 0) {
      const posts = await oldDb.collection('posts').find({}).toArray()
      const postsWithUserId = posts.map(post => ({
        ...post,
        user_id: USER_ID
      }))
      await newDb.collection('posts').insertMany(postsWithUserId)
      console.log(`✅ Migrated ${postsCount} posts to ${NEW_DB}`)
    }
    
    // Migrate leads
    if (leadsCount > 0) {
      const leads = await oldDb.collection('leads').find({}).toArray()
      const leadsWithUserId = leads.map(lead => ({
        ...lead,
        user_id: USER_ID
      }))
      await newDb.collection('leads').insertMany(leadsWithUserId)
      console.log(`✅ Migrated ${leadsCount} leads to ${NEW_DB}`)
    }
    
    console.log('🎉 Migration completed successfully!')
    console.log(`📝 All data migrated from ${OLD_DB} to ${NEW_DB} with user_id: ${USER_ID}`)
    
    // Now delete the old database
    console.log('🗑️ Deleting old database...')
    await oldDb.dropDatabase()
    console.log('✅ Old database deleted successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.close()
  }
}

migrateData()

