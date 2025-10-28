import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'
const MONGODB_DB = process.env.VITE_MONGODB_DB || 'aiads'

// Real companies from your data
const companies = [
  {
    id: 'vivo-company',
    name: 'vivo',
    service_type: 'Service',
    location: 'Midland/Odessa, TX',
    description: 'Real estate and community services in Midland/Odessa area',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'campos-company', 
    name: 'campos',
    service_type: 'Service',
    location: 'Midland/Odessa, TX',
    description: 'Real estate and community services in Midland/Odessa area',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Real Facebook groups from your Supabase data
const groups = [
  // Tier 1 Groups (High Priority)
  { name: 'Midland TX Houses for Sell or Rent', why: 'Homeowners & landlords = high buyer intent', category: 'Home & Real Estate', tier: 1, audience_size: 19500, company_id: 'vivo-company' },
  { name: 'Buying or Selling a Home in Odessa/Midland TX', why: 'Homeowners & landlords = high buyer intent', category: 'Home & Real Estate', tier: 1, audience_size: 3800, company_id: 'vivo-company' },
  { name: 'Gardendale Community', why: 'Broad local reach; good awareness', category: 'Community', tier: 1, audience_size: 6000, company_id: 'campos-company' },
  { name: 'Permain Basin Open Houses', why: 'Homeowners & landlords = high buyer intent', category: 'Home & Real Estate', tier: 1, audience_size: 1300, company_id: 'vivo-company' },
  { name: 'Midland-Odessa Homes for Sale/Rent', why: 'Homeowners & landlords = high buyer intent', category: 'Home & Real Estate', tier: 1, audience_size: 32900, company_id: 'vivo-company' },
  { name: 'West Texas Buy, Sell, Trade', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 1, audience_size: 48900, company_id: 'campos-company' },
  { name: 'Odessa/midland buy sell trade', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 1, audience_size: 66900, company_id: 'campos-company' },
  { name: 'midland odessa buy and sell everything', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 1, audience_size: 35400, company_id: 'campos-company' },
  { name: 'Midland/Odessa TX, BUY-SELL-TRADE', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 1, audience_size: 59400, company_id: 'campos-company' },
  { name: 'Midland/Odessa for SALE!', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 1, audience_size: 33500, company_id: 'campos-company' },
  { name: 'ODESSA/MIDLAND TRADING POST', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 1, audience_size: 5900, company_id: 'campos-company' },

  // Tier 2 Groups (Medium Priority)
  { name: 'Friends of Midland and Odessa Tx', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 6300, company_id: 'vivo-company' },
  { name: 'Sale & Post Anything Midland/Odess TX', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 13500, company_id: 'campos-company' },
  { name: 'Midland Texas Jobs', why: 'Networking + referrals', category: 'Jobs & Services', tier: 2, audience_size: 32200, company_id: 'vivo-company' },
  { name: 'Midland & Odessa TEXAS Small Business', why: 'Networking + referrals', category: 'Jobs & Services', tier: 2, audience_size: 25100, company_id: 'vivo-company' },
  { name: 'Odessa Texas JOBS', why: 'Networking + referrals', category: 'Jobs & Services', tier: 2, audience_size: 52000, company_id: 'vivo-company' },
  { name: 'Old Midland', why: 'Broad local reach; good awareness', category: 'Community', tier: 2, audience_size: 37100, company_id: 'vivo-company' },
  { name: 'Odessa-Midland jobs, sales, trades, and more', why: 'Review category label', category: 'Mixed', tier: 2, audience_size: 22300, company_id: 'campos-company' },
  { name: 'Cubanos En Midland/Odessa', why: 'Broad local reach; good awareness', category: 'Community', tier: 2, audience_size: 19700, company_id: 'campos-company' },
  { name: 'Midessa Texas Kids N Family Happenings', why: 'Decision-makers for interiors', category: 'Family & Lifestyle', tier: 2, audience_size: 11900, company_id: 'vivo-company' },
  { name: 'Midland Texas Weekend Yard/garage Sales!', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 55300, company_id: 'campos-company' },
  { name: 'Best of Midland Texas Group', why: 'Broad local reach; good awareness', category: 'Community', tier: 2, audience_size: 7100, company_id: 'vivo-company' },
  { name: 'West Texas women\'s cave', why: 'Review category label', category: 'Lifestyle', tier: 2, audience_size: 52500, company_id: 'campos-company' },
  { name: 'Midland Tx trading post.', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 43600, company_id: 'campos-company' },
  { name: 'Free, Buy or Sell- Midland/Odess area', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 8400, company_id: 'campos-company' },
  { name: 'Midland & Odessa Yard Sales', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 6900, company_id: 'campos-company' },
  { name: 'Homes For Sale Odessa/Midland', why: 'Homeowners & landlords = high buyer intent', category: 'Home & Real Estate', tier: 2, audience_size: 17600, company_id: 'vivo-company' },
  { name: 'Midland Real Estate For Sale', why: 'Homeowners & landlords = high buyer intent', category: 'Home & Real Estate', tier: 2, audience_size: 51500, company_id: 'vivo-company' },
  { name: 'Moms of MIDLAND/ODESSA TX', why: 'Decision-makers for interiors', category: 'Family & Lifestyle', tier: 2, audience_size: 3300, company_id: 'vivo-company' },
  { name: 'Only Midland & Odessa Girls', why: 'Decision-makers for interiors', category: 'Family & Lifestyle', tier: 2, audience_size: 3500, company_id: 'vivo-company' },
  { name: 'West Texas Construction Needs', why: 'Pro referrals; B2B', category: 'Construction & Trades', tier: 2, audience_size: 5400, company_id: 'vivo-company' },
  { name: 'ODESSA/MIDLAND News and Events', why: 'Broad local reach; good awareness', category: 'Community', tier: 2, audience_size: 7700, company_id: 'vivo-company' },
  { name: 'Real Estate Investors Odessa Tx/Midland Tx', why: 'Review category label', category: 'Real Estate', tier: 2, audience_size: 1400, company_id: 'vivo-company' },
  { name: 'Just Sell It---Midland/Odessa', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 2600, company_id: 'campos-company' },
  { name: 'Midland/Odessa Fun stuff to do', why: 'Broad local reach; good awareness', category: 'Community', tier: 2, audience_size: 4200, company_id: 'vivo-company' },
  { name: 'Now hiring ⚒️ odessa/midland/elpast tx', why: 'Review category label', category: 'Jobs', tier: 2, audience_size: 6800, company_id: 'vivo-company' },
  { name: 'Vintage Odessa/Midland Buy. Sell. Trade.', why: 'Broad local reach; good awareness', category: 'Buy & Sell', tier: 2, audience_size: 11500, company_id: 'campos-company' },
  { name: 'Finding Childcare/Babysitters/Nannies In Midla...', why: 'Review category label', category: 'Family', tier: 2, audience_size: 8700, company_id: 'vivo-company' },
  { name: 'Midland Texas 365 Happenings!', why: 'Broad local reach; good awareness', category: 'Community', tier: 2, audience_size: 626, company_id: 'vivo-company' },
  { name: 'Midland & Odessa - Community Events for Chi...', why: 'Review category label', category: 'Family', tier: 2, audience_size: 3300, company_id: 'vivo-company' },
  { name: 'Midland / Odessa Area Jobs', why: 'Review category label', category: 'Jobs', tier: 2, audience_size: 8300, company_id: 'vivo-company' },
  { name: 'Midland, TX Rentals, Apartments, Housing, Ro...', why: 'Review category label', category: 'Real Estate', tier: 2, audience_size: 3300, company_id: 'vivo-company' },

  // Tier 3 Groups (Lower Priority)
  { name: 'Costco of Midland TX', why: 'Broad local reach; good awareness', category: 'Community', tier: 3, audience_size: 16300, company_id: 'vivo-company' },
  { name: 'Lost and Found Pets Midland/Odessa TX', why: 'Low intent; post rarely', category: 'Misc', tier: 3, audience_size: 22700, company_id: 'vivo-company' },
  { name: 'Texas (Odessa Midland', why: 'Low intent; post rarely', category: 'Misc', tier: 3, audience_size: 11500, company_id: 'campos-company' }
]

async function migrateRealData() {
  const mongoClient = new MongoClient(MONGODB_URI)
  
  try {
    console.log('🔄 Migrating real Facebook groups data to MongoDB Atlas...')
    
    // Connect to MongoDB
    await mongoClient.connect()
    const db = mongoClient.db(MONGODB_DB)
    
    console.log('✅ Connected to MongoDB Atlas')
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await db.collection('companies').deleteMany({})
    await db.collection('groups').deleteMany({})
    await db.collection('posts').deleteMany({})
    await db.collection('leads').deleteMany({})
    
    // Insert companies
    console.log('📊 Inserting companies...')
    const companiesToInsert = companies.map(company => ({
      _id: company.id,
      ...company
    }))
    await db.collection('companies').insertMany(companiesToInsert)
    console.log(`✅ Inserted ${companies.length} companies`)
    
    // Insert groups with proper formatting
    console.log('📊 Inserting Facebook groups...')
    const groupsToInsert = groups.map((group, index) => ({
      _id: `group-${index + 1}`,
      name: group.name,
      description: group.why,
      category: group.category,
      tier: group.tier,
      audience_size: group.audience_size,
      company_id: group.company_id,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    await db.collection('groups').insertMany(groupsToInsert)
    console.log(`✅ Inserted ${groups.length} Facebook groups`)
    
    // Show summary
    console.log('\n📋 Migration Summary:')
    console.log(`Companies: ${companies.length}`)
    console.log(`Groups: ${groups.length}`)
    
    // Show tier breakdown
    const tier1 = groups.filter(g => g.tier === 1).length
    const tier2 = groups.filter(g => g.tier === 2).length  
    const tier3 = groups.filter(g => g.tier === 3).length
    
    console.log(`\nTier Breakdown:`)
    console.log(`  Tier 1 (High Priority): ${tier1} groups`)
    console.log(`  Tier 2 (Medium Priority): ${tier2} groups`)
    console.log(`  Tier 3 (Lower Priority): ${tier3} groups`)
    
    // Show company breakdown
    const vivoGroups = groups.filter(g => g.company_id === 'vivo-company').length
    const camposGroups = groups.filter(g => g.company_id === 'campos-company').length
    
    console.log(`\nCompany Breakdown:`)
    console.log(`  vivo: ${vivoGroups} groups`)
    console.log(`  campos: ${camposGroups} groups`)
    
    console.log('\n🎉 Real data migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await mongoClient.close()
  }
}

migrateRealData()
