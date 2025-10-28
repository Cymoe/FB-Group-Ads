import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://2mylescameron_db_user:4yd0rVvgxlyxkakH@cluster0.3jszlkw.mongodb.net/?appName=Cluster0'

async function addNewDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB Atlas')
    
    // Create a new database for a different app
    const newDb = client.db('ecommerce-app')
    
    // Add some sample collections
    await newDb.collection('products').insertOne({
      name: 'Sample Product',
      price: 29.99,
      category: 'Electronics',
      created_at: new Date().toISOString()
    })
    
    await newDb.collection('orders').insertOne({
      order_id: 'ORD-001',
      customer_id: 'CUST-001',
      total: 29.99,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    
    console.log('✅ New database "ecommerce-app" created with sample data')
    console.log('📊 You now have multiple apps on the same cluster!')
    
  } catch (error) {
    console.error('❌ Failed to create new database:', error)
  } finally {
    await client.close()
  }
}

// Uncomment to run:
// addNewDatabase()
