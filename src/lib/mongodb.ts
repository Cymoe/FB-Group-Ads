import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = import.meta.env.VITE_MONGODB_DB || 'aiads'

let client: MongoClient
let db: Db

export async function connectToDatabase() {
  if (db) {
    return { client, db }
  }

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(MONGODB_DB)
    
    console.log('✅ Connected to MongoDB')
    return { client, db }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}

// Helper functions for common operations
export async function getAllDocuments(collectionName: string) {
  const collection = await getCollection(collectionName)
  return await collection.find({}).toArray()
}

export async function insertDocument(collectionName: string, document: any) {
  const collection = await getCollection(collectionName)
  const result = await collection.insertOne(document)
  return result
}

export async function updateDocument(collectionName: string, id: string, updates: any) {
  const collection = await getCollection(collectionName)
  const result = await collection.updateOne(
    { _id: id },
    { $set: { ...updates, updated_at: new Date().toISOString() } }
  )
  return result
}

export async function deleteDocument(collectionName: string, id: string) {
  const collection = await getCollection(collectionName)
  const result = await collection.deleteOne({ _id: id })
  return result
}
