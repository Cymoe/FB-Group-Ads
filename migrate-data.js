import { MongoClient } from 'mongodb'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = process.env.VITE_MONGODB_DB || 'aiads'

const supabaseUrl = 'https://zuukkeokqadfaykxuxiv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dWtrZW9rcWFkZmF5a3h1eGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.placeholder'

async function migrateData() {
  const mongoClient = new MongoClient(MONGODB_URI)
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('🔄 Attempting to migrate data from Supabase to MongoDB Atlas...')
    
    // Connect to MongoDB
    await mongoClient.connect()
    const db = mongoClient.db(MONGODB_DB)
    
    console.log('✅ Connected to MongoDB Atlas')
    
    // Try to get data from Supabase
    console.log('🔍 Checking Supabase for existing data...')
    
    try {
      // Try companies first
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
      
      if (companiesError) {
        console.log('❌ Supabase companies error:', companiesError.message)
      } else if (companies && companies.length > 0) {
        console.log(`✅ Found ${companies.length} companies in Supabase`)
        
        // Clear existing companies in MongoDB
        await db.collection('companies').deleteMany({})
        
        // Insert companies from Supabase
        const companiesToInsert = companies.map(company => ({
          _id: company.id,
          ...company
        }))
        
        await db.collection('companies').insertMany(companiesToInsert)
        console.log('✅ Migrated companies to MongoDB Atlas')
      } else {
        console.log('ℹ️ No companies found in Supabase')
      }
      
      // Try groups
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
      
      if (groupsError) {
        console.log('❌ Supabase groups error:', groupsError.message)
      } else if (groups && groups.length > 0) {
        console.log(`✅ Found ${groups.length} groups in Supabase`)
        
        // Clear existing groups in MongoDB
        await db.collection('groups').deleteMany({})
        
        // Insert groups from Supabase
        const groupsToInsert = groups.map(group => ({
          _id: group.id,
          ...group
        }))
        
        await db.collection('groups').insertMany(groupsToInsert)
        console.log('✅ Migrated groups to MongoDB Atlas')
        
        // Show some examples
        console.log('\n📋 Sample groups migrated:')
        groups.slice(0, 5).forEach(group => {
          console.log(`  - ${group.name} (Company: ${group.company_id})`)
        })
        if (groups.length > 5) {
          console.log(`  ... and ${groups.length - 5} more groups`)
        }
      } else {
        console.log('ℹ️ No groups found in Supabase')
      }
      
    } catch (supabaseError) {
      console.log('❌ Supabase connection failed:', supabaseError.message)
      console.log('ℹ️ This might be due to CORS or network issues')
      console.log('ℹ️ You may need to check your Supabase project settings')
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await mongoClient.close()
  }
}

migrateData()
