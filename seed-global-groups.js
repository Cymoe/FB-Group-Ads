import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!')
  process.exit(1)
}

const sampleGlobalGroups = [
  {
    name: 'Homeowners of West Texas',
    category: 'Home & Real Estate',
    description: 'A community for homeowners in West Texas to share tips, recommendations, and connect with local service providers',
    facebook_url: 'https://facebook.com/groups/homeowners-west-tx',
    location: {
      city: 'Midland',
      state: 'TX',
      country: 'USA',
      coordinates: {
        lat: 31.9973,
        lng: -102.0779
      }
    },
    member_count: 15200,
    privacy: 'public',
    quality_score: 92,
    verified: true,
    quality_indicators: {
      engagement_rate: 4.2,
      avg_comments_per_post: 12,
      response_rate: 32,
      admin_response_time: '< 2 hours',
      business_friendly: true,
      posting_limit: '2-3 per week',
      best_posting_times: {
        days: ['Monday', 'Tuesday', 'Thursday'],
        hours: '9am-2pm'
      },
      active_businesses_count: 52,
      content_preferences: ['Before/After Photos', 'Home Tips', 'Local Recommendations']
    },
    industries: ['home_services', 'real_estate'],
    tags: ['homeowners', 'recommendations', 'local', 'home improvement'],
    added_by_count: 0,
    trending_score: 85,
    contributed_by: 'system',
    contributed_at: new Date('2024-01-15').toISOString(),
    verified_by_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Odessa Home Improvement & DIY',
    category: 'Home & Real Estate',
    description: 'Share your home improvement projects, get advice, and find local contractors',
    facebook_url: 'https://facebook.com/groups/odessa-home-diy',
    location: {
      city: 'Odessa',
      state: 'TX',
      country: 'USA',
      coordinates: {
        lat: 31.8457,
        lng: -102.3676
      }
    },
    member_count: 8900,
    privacy: 'public',
    quality_score: 88,
    verified: true,
    quality_indicators: {
      engagement_rate: 3.8,
      avg_comments_per_post: 15,
      response_rate: 28,
      admin_response_time: '< 4 hours',
      business_friendly: true,
      posting_limit: '2 per week',
      best_posting_times: {
        days: ['Tuesday', 'Wednesday', 'Thursday'],
        hours: '10am-3pm'
      },
      active_businesses_count: 38,
      content_preferences: ['DIY Tutorials', 'Before/After', 'Product Reviews']
    },
    industries: ['home_services', 'hvac', 'painting'],
    tags: ['diy', 'contractors', 'home improvement', 'renovation'],
    added_by_count: 0,
    trending_score: 75,
    contributed_by: 'system',
    contributed_at: new Date('2024-01-10').toISOString(),
    verified_by_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Permian Basin Business Network',
    category: 'Business',
    description: 'Connecting local businesses and entrepreneurs in the Permian Basin',
    facebook_url: 'https://facebook.com/groups/permian-business',
    location: {
      city: 'Midland',
      state: 'TX',
      country: 'USA',
      coordinates: {
        lat: 31.9973,
        lng: -102.0779
      }
    },
    member_count: 12400,
    privacy: 'private',
    quality_score: 95,
    verified: true,
    quality_indicators: {
      engagement_rate: 5.2,
      avg_comments_per_post: 18,
      response_rate: 45,
      admin_response_time: '< 1 hour',
      business_friendly: true,
      posting_limit: '1 per week (quality over quantity)',
      best_posting_times: {
        days: ['Tuesday', 'Wednesday'],
        hours: '8am-11am'
      },
      active_businesses_count: 127,
      content_preferences: ['Networking Events', 'Business Tips', 'Success Stories']
    },
    industries: ['business', 'networking', 'b2b'],
    tags: ['b2b', 'networking', 'local business', 'entrepreneurs'],
    added_by_count: 0,
    trending_score: 90,
    contributed_by: 'system',
    contributed_at: new Date('2024-01-05').toISOString(),
    verified_by_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Midland Buy, Sell, Trade',
    category: 'Buy & Sell',
    description: 'Local marketplace for Midland residents - buy, sell, and trade items',
    facebook_url: 'https://facebook.com/groups/midland-marketplace',
    location: {
      city: 'Midland',
      state: 'TX',
      country: 'USA',
      coordinates: {
        lat: 31.9973,
        lng: -102.0779
      }
    },
    member_count: 28500,
    privacy: 'public',
    quality_score: 82,
    verified: true,
    quality_indicators: {
      engagement_rate: 2.8,
      avg_comments_per_post: 8,
      response_rate: 18,
      admin_response_time: '< 6 hours',
      business_friendly: false,
      posting_limit: 'No business posts (marketplace only)',
      best_posting_times: {
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        hours: '6pm-9pm'
      },
      active_businesses_count: 0,
      content_preferences: ['Items for Sale', 'Looking For', 'Free Stuff']
    },
    industries: ['retail', 'marketplace'],
    tags: ['marketplace', 'buy', 'sell', 'trade', 'local'],
    added_by_count: 0,
    trending_score: 88,
    contributed_by: 'system',
    contributed_at: new Date('2024-01-08').toISOString(),
    verified_by_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'West Texas Homeowner Resources',
    category: 'Home & Real Estate',
    description: 'Resources, tips, and contractor recommendations for West Texas homeowners',
    facebook_url: 'https://facebook.com/groups/west-tx-homeowners',
    location: {
      city: 'Odessa',
      state: 'TX',
      country: 'USA',
      coordinates: {
        lat: 31.8457,
        lng: -102.3676
      }
    },
    member_count: 6300,
    privacy: 'public',
    quality_score: 91,
    verified: true,
    quality_indicators: {
      engagement_rate: 4.5,
      avg_comments_per_post: 14,
      response_rate: 38,
      admin_response_time: '< 3 hours',
      business_friendly: true,
      posting_limit: '3 per week',
      best_posting_times: {
        days: ['Monday', 'Wednesday', 'Friday'],
        hours: '9am-1pm'
      },
      active_businesses_count: 64,
      content_preferences: ['Contractor Recommendations', 'Project Photos', 'Q&A']
    },
    industries: ['home_services', 'real_estate', 'hvac', 'painting', 'plumbing'],
    tags: ['homeowners', 'resources', 'contractors', 'recommendations'],
    added_by_count: 0,
    trending_score: 78,
    contributed_by: 'system',
    contributed_at: new Date('2024-01-12').toISOString(),
    verified_by_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Midland Community Events',
    category: 'Community',
    description: 'Stay updated on local events, gatherings, and community activities in Midland',
    facebook_url: 'https://facebook.com/groups/midland-events',
    location: {
      city: 'Midland',
      state: 'TX',
      country: 'USA',
      coordinates: {
        lat: 31.9973,
        lng: -102.0779
      }
    },
    member_count: 19800,
    privacy: 'public',
    quality_score: 86,
    verified: true,
    quality_indicators: {
      engagement_rate: 3.2,
      avg_comments_per_post: 22,
      response_rate: 25,
      admin_response_time: '< 12 hours',
      business_friendly: true,
      posting_limit: '1 per week (event announcements ok)',
      best_posting_times: {
        days: ['Thursday', 'Friday'],
        hours: '5pm-7pm'
      },
      active_businesses_count: 45,
      content_preferences: ['Event Announcements', 'Community News', 'Local Updates']
    },
    industries: ['community', 'events'],
    tags: ['events', 'community', 'local', 'activities'],
    added_by_count: 0,
    trending_score: 82,
    contributed_by: 'system',
    contributed_at: new Date('2024-01-18').toISOString(),
    verified_by_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

async function seedGlobalGroups() {
  let client
  
  try {
    console.log('🔗 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(MONGODB_DB)
    
    console.log('📊 Checking existing global groups...')
    const existingCount = await db.collection('global_groups').countDocuments()
    console.log(`   Found ${existingCount} existing global groups`)
    
    if (existingCount > 0) {
      console.log('⚠️  Global groups collection is not empty.')
      console.log('   Delete existing groups? (y/n)')
      process.stdin.once('data', async (data) => {
        const answer = data.toString().trim().toLowerCase()
        if (answer === 'y' || answer === 'yes') {
          console.log('🗑️  Deleting existing global groups...')
          await db.collection('global_groups').deleteMany({})
          console.log('✅ Deleted all existing global groups')
          await insertGroups(db)
        } else {
          console.log('❌ Seeding cancelled')
          await client.close()
          process.exit(0)
        }
      })
    } else {
      await insertGroups(db)
    }
    
  } catch (error) {
    console.error('❌ Error seeding global groups:', error)
    if (client) await client.close()
    process.exit(1)
  }
}

async function insertGroups(db) {
  try {
    console.log('📝 Inserting sample global groups...')
    const result = await db.collection('global_groups').insertMany(sampleGlobalGroups)
    console.log(`✅ Successfully inserted ${result.insertedCount} global groups!`)
    
    console.log('\n📋 Summary:')
    sampleGlobalGroups.forEach((group, index) => {
      console.log(`   ${index + 1}. ${group.name}`)
      console.log(`      - Location: ${group.location.city}, ${group.location.state}`)
      console.log(`      - Members: ${group.member_count.toLocaleString()}`)
      console.log(`      - Quality Score: ${group.quality_score}/100`)
      console.log(`      - Industries: ${group.industries.join(', ')}`)
      console.log('')
    })
    
    await db.client.close()
    console.log('🎉 Database connection closed. Seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error inserting groups:', error)
    await db.client.close()
    process.exit(1)
  }
}

seedGlobalGroups()

