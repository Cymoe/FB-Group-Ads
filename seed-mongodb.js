import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb://localhost:27017'
const MONGODB_DB = 'aiads'

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(MONGODB_DB)
    
    console.log('🌱 Seeding MongoDB database...')
    
    // Clear existing data
    await db.collection('companies').deleteMany({})
    await db.collection('groups').deleteMany({})
    await db.collection('posts').deleteMany({})
    await db.collection('leads').deleteMany({})
    
    // Insert companies
    const companies = [
      {
        _id: 'vivo-company',
        name: 'vivo',
        service_type: 'Service',
        location: 'Your Location',
        description: 'Your company description',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        _id: 'campos-company',
        name: 'campos',
        service_type: 'Service',
        location: 'Your Location',
        description: 'Your company description',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    await db.collection('companies').insertMany(companies)
    console.log('✅ Inserted companies:', companies.length)
    
    // Insert groups (50+ groups as requested)
    const groups = []
    for (let i = 1; i <= 50; i++) {
      const companyId = i % 2 === 0 ? 'campos-company' : 'vivo-company'
      const companyName = i % 2 === 0 ? 'campos' : 'vivo'
      
      groups.push({
        _id: `group-${i}`,
        name: `${companyName} Facebook Group ${i}`,
        company_id: companyId,
        tier: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        category: `Category ${Math.ceil(i / 10)}`,
        audience_size: Math.floor(Math.random() * 1000) + 100,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    await db.collection('groups').insertMany(groups)
    console.log('✅ Inserted groups:', groups.length)
    
    console.log('🎉 Database seeded successfully!')
    console.log(`📊 Companies: ${companies.length}`)
    console.log(`📊 Groups: ${groups.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await client.close()
  }
}

seedDatabase()
