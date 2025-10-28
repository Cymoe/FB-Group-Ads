import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

dotenv.config()

const app = express()
const PORT = 3001

// Use environment variables for MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || process.env.VITE_MONGODB_DB || 'fb-group-ads-manager'

// Validate MongoDB URI exists
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!')
  console.error('💡 Make sure you have MONGODB_URI or VITE_MONGODB_URI in your .env file')
  process.exit(1)
}

let client
let db

async function connectToDatabase() {
  if (db) return { db, client }
  
  client = new MongoClient(MONGODB_URI)
  await client.connect()
  db = client.db(MONGODB_DB)
  
  // Create indexes for performance
  try {
    await db.collection('companies').createIndex({ name: 1 }, { unique: true })
    await db.collection('companies').createIndex({ service_type: 1 })
    await db.collection('companies').createIndex({ location: 1 })
    
    await db.collection('groups').createIndex({ name: 1 })
    await db.collection('groups').createIndex({ company_id: 1 })
    await db.collection('groups').createIndex({ category: 1 })
    await db.collection('groups').createIndex({ tier: 1 })
    await db.collection('groups').createIndex({ status: 1 })
    
    await db.collection('posts').createIndex({ company_id: 1 })
    await db.collection('posts').createIndex({ group_id: 1 })
    await db.collection('posts').createIndex({ status: 1 })
    await db.collection('posts').createIndex({ post_type: 1 })
    await db.collection('posts').createIndex({ created_at: -1 })
    
    // Leads collection removed - not needed for this application
    
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    console.log('⚠️ Some indexes may already exist:', error.message)
  }
  
  console.log(`Connected to MongoDB: ${MONGODB_DB}`)
  return { db, client }
}

// Helper to convert MongoDB _id to string id
const mapId = (doc) => {
  const { _id, id: existingId, ...rest } = doc
  // Handle both ObjectId and string IDs  
  const id = existingId || (typeof _id === 'string' ? _id : _id.toHexString())
  return { ...rest, id }
}

// Helper to handle both ObjectId and string IDs
const getObjectId = (id) => {
  try {
    // Try to create ObjectId from string
    return new ObjectId(id)
  } catch (error) {
    // If it fails, it's likely a custom string ID
    return id
  }
}

// Helper to update group posting frequency
async function updateGroupPostingFrequency(db, groupId) {
  try {
    const now = new Date()
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
    
    // Count posts in the last week and month for this group
    const postsThisWeek = await db.collection('posts').countDocuments({
      group_id: groupId,
      status: 'posted',
      posted_at: { $gte: oneWeekAgo.toISOString() }
    })
    
    const postsThisMonth = await db.collection('posts').countDocuments({
      group_id: groupId,
      status: 'posted',
      posted_at: { $gte: oneMonthAgo.toISOString() }
    })
    
    // Get the most recent post date
    const latestPost = await db.collection('posts')
      .find({ group_id: groupId, status: 'posted' })
      .sort({ posted_at: -1 })
      .limit(1)
      .toArray()
    
    const lastPostDate = latestPost.length > 0 ? latestPost[0].posted_at : null
    
    // Update the group with frequency data
    await db.collection('groups').updateOne(
      { id: groupId },
      { 
        $set: { 
          last_post_date: lastPostDate,
          posts_this_week: postsThisWeek,
          posts_this_month: postsThisMonth,
          updated_at: now.toISOString()
        } 
      }
    )
    
    console.log(`✅ Updated posting frequency for group ${groupId}: ${postsThisWeek} this week, ${postsThisMonth} this month`)
  } catch (error) {
    console.error('Error updating group posting frequency:', error)
  }
}

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'
const GOOGLE_CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET || 'your-google-client-secret'
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Auth routes (no authentication required)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // For now, simulate login (in production, verify against database)
    if (email && password) {
      const token = jwt.sign(
        { userId: '1', email, name: 'User' },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.json({ 
        token, 
        user: { id: '1', email, name: 'User' } 
      })
    } else {
      res.status(400).json({ error: 'Email and password required' })
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    // For now, simulate registration (in production, save to database)
    if (email && password && name) {
      const token = jwt.sign(
        { userId: '1', email, name },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.json({ 
        token, 
        user: { id: '1', email, name } 
      })
    } else {
      res.status(400).json({ error: 'Email, password, and name required' })
    }
  } catch (error) {
    console.error('❌ Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Google OAuth endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: 'http://localhost:5173'
    })
    oauth2Client.setCredentials(tokens)

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    })
    
    const payload = ticket.getPayload()
    if (!payload) {
      throw new Error('Invalid token payload')
    }

    // Create or find user in database
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ 
      token, 
      user 
    })
  } catch (error) {
    console.error('❌ Google OAuth error:', error)
    res.status(500).json({ error: 'Google authentication failed' })
  }
})

// Token verification endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.name
    }
  })
})

// Data validation middleware
const validateCompany = (req, res, next) => {
  const { name, service_type, location, description } = req.body
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Company name is required and must be a non-empty string' })
  }
  
  if (service_type && typeof service_type !== 'string') {
    return res.status(400).json({ error: 'Service type must be a string' })
  }
  
  if (location && typeof location !== 'string') {
    return res.status(400).json({ error: 'Location must be a string' })
  }
  
  if (description && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' })
  }
  
  next()
}

const validatePost = (req, res, next) => {
  const { content, post_type, company_id } = req.body
  
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Post content is required and must be a non-empty string' })
  }
  
  if (!post_type || typeof post_type !== 'string') {
    return res.status(400).json({ error: 'Post type is required and must be a string' })
  }
  
  if (!company_id || typeof company_id !== 'string') {
    return res.status(400).json({ error: 'Company ID is required and must be a string' })
  }
  
  next()
}

// Companies endpoints
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const companies = await db.collection('companies').find({ user_id: req.user.userId }).toArray()
    res.json(companies.map(mapId))
  } catch (error) {
    console.error('❌ Error fetching companies:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    res.status(500).json({ error: 'Failed to fetch companies' })
  }
})

app.post('/api/companies', authenticateToken, validateCompany, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const company = {
      ...req.body,
      user_id: req.user.userId,  // Add user context
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    const result = await db.collection('companies').insertOne(company)
    const newCompany = await db.collection('companies').findOne({ _id: result.insertedId })
    res.json(mapId(newCompany))
  } catch (error) {
    console.error('Error creating company:', error)
    res.status(500).json({ error: 'Failed to create company' })
  }
})

app.put('/api/companies/:id', authenticateToken, validateCompany, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    }
    const objectId = getObjectId(id)
    const result = await db.collection('companies').updateOne(
      { _id: objectId, user_id: req.user.userId },  // Only update user's own companies
      { $set: updates }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }
    const updatedCompany = await db.collection('companies').findOne({ _id: objectId })
    res.json(mapId(updatedCompany))
  } catch (error) {
    console.error('Error updating company:', error)
    res.status(500).json({ error: 'Failed to update company' })
  }
})

app.delete('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Verify the company belongs to the authenticated user
    const company = await db.collection('companies').findOne({ 
      _id: getObjectId(id),
      user_id: req.user.userId 
    })
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found or unauthorized' })
    }
    
    const result = await db.collection('companies').deleteOne({ 
      _id: getObjectId(id),
      user_id: req.user.userId 
    })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }
    res.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    res.status(500).json({ error: 'Failed to delete company' })
  }
})

// Groups endpoints
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const groups = await db.collection('groups').find({ user_id: req.user.userId }).toArray()
    res.json(groups.map(mapId))
  } catch (error) {
    console.error('Error fetching groups:', error)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const group = {
      ...req.body,
      user_id: req.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const result = await db.collection('groups').insertOne(group)
    const newGroup = await db.collection('groups').findOne({ _id: result.insertedId })
    res.json(mapId(newGroup))
  } catch (error) {
    console.error('Error adding group:', error)
    res.status(500).json({ error: 'Failed to add group' })
  }
})

// Posts endpoints
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const posts = await db.collection('posts').find({ user_id: req.user.userId }).toArray()
    res.json(posts.map(mapId))
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

app.post('/api/posts', authenticateToken, validatePost, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const post = {
      ...req.body,
      user_id: req.user.userId, // Assign to authenticated user
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const result = await db.collection('posts').insertOne(post)
    const newPost = await db.collection('posts').findOne({ _id: result.insertedId })
    
    // Update group posting frequency when post is created
    if (post.group_id && post.status === 'posted') {
      await updateGroupPostingFrequency(db, post.group_id)
    }
    
    res.json(mapId(newPost))
  } catch (error) {
    console.error('Error adding post:', error)
    res.status(500).json({ error: 'Failed to add post' })
  }
})

// Leads collection removed - not needed for this application

// Leads endpoints removed - not needed for this application

// Leads collection already removed - not needed for this application

// Associate all data with user (admin operation - no auth required)
app.post('/api/admin/associate-data', async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    
    console.log(`🔗 Associating all data with user: ${userId}`)
    
    // Update companies
    const companiesResult = await db.collection('companies').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: userId } }
    )
    console.log(`✅ Updated ${companiesResult.modifiedCount} companies`)
    
    // Update groups
    const groupsResult = await db.collection('groups').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: userId } }
    )
    console.log(`✅ Updated ${groupsResult.modifiedCount} groups`)
    
    // Update posts
    const postsResult = await db.collection('posts').updateMany(
      { user_id: { $exists: false } },
      { $set: { user_id: userId } }
    )
    console.log(`✅ Updated ${postsResult.modifiedCount} posts`)
    
    // Leads collection removed - not needed for this application
    
    res.json({
      message: 'Data successfully associated with user',
      results: {
        companies: companiesResult.modifiedCount,
        groups: groupsResult.modifiedCount,
        posts: postsResult.modifiedCount
      }
    })
    
  } catch (error) {
    console.error('Error associating data:', error)
    res.status(500).json({ error: 'Failed to associate data with user' })
  }
})

// Update post endpoint
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Verify the post belongs to the authenticated user
    const post = await db.collection('posts').findOne({ 
      _id: new ObjectId(id),
      user_id: req.user.userId 
    })
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' })
    }
    
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    }
    
    // Add posted_at timestamp if status changed to 'posted'
    if (updates.status === 'posted' && !updates.posted_at) {
      updates.posted_at = new Date().toISOString()
    }
    
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(id), user_id: req.user.userId },
      { $set: updates }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Post not found' })
    }
    const updatedPost = await db.collection('posts').findOne({ _id: new ObjectId(id) })
    
    // Update group posting frequency if post was marked as posted
    if (updates.status === 'posted' && updatedPost.group_id) {
      await updateGroupPostingFrequency(db, updatedPost.group_id)
    }
    
    res.json(mapId(updatedPost))
  } catch (error) {
    console.error('Error updating post:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

// Delete post endpoint
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Verify the post belongs to the authenticated user
    const post = await db.collection('posts').findOne({ 
      _id: new ObjectId(id),
      user_id: req.user.userId 
    })
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' })
    }
    
    const result = await db.collection('posts').deleteOne({ 
      _id: new ObjectId(id),
      user_id: req.user.userId 
    })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// Groups endpoints
app.put('/api/groups/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Verify the group belongs to the authenticated user
    const group = await db.collection('groups').findOne({ 
      _id: new ObjectId(id),
      user_id: req.user.userId 
    })
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found or unauthorized' })
    }
    
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    }
    const result = await db.collection('groups').updateOne(
      { _id: new ObjectId(id), user_id: req.user.userId },
      { $set: updates }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }
    const updatedGroup = await db.collection('groups').findOne({ _id: new ObjectId(id) })
    res.json(mapId(updatedGroup))
  } catch (error) {
    console.error('Error updating group:', error)
    res.status(500).json({ error: 'Failed to update group' })
  }
})

// Delete group
app.delete('/api/groups/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Verify the group belongs to the authenticated user
    const group = await db.collection('groups').findOne({ 
      _id: new ObjectId(id),
      user_id: req.user.userId 
    })
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found or unauthorized' })
    }
    
    const result = await db.collection('groups').deleteOne({ 
      _id: new ObjectId(id),
      user_id: req.user.userId 
    })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    res.json({ success: true, message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    res.status(500).json({ error: 'Failed to delete group' })
  }
})

// Database backup function
const createBackup = async () => {
  try {
    const { db } = await connectToDatabase()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `backup-${timestamp}`
    
    // Create backup collection
    const companies = await db.collection('companies').find({}).toArray()
    const groups = await db.collection('groups').find({}).toArray()
    const posts = await db.collection('posts').find({}).toArray()
    // Leads collection removed - not needed for this application
    
    await db.collection('backups').insertOne({
      name: backupName,
      timestamp: new Date().toISOString(),
      data: { companies, groups, posts },
      recordCount: {
        companies: companies.length,
        groups: groups.length,
        posts: posts.length
      }
    })
    
    console.log(`✅ Database backup created: ${backupName}`)
  } catch (error) {
    console.error('❌ Backup failed:', error.message)
  }
}

// Create backup every 24 hours
setInterval(createBackup, 24 * 60 * 60 * 1000)

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log('📊 Database indexes and validation enabled')
  console.log('💾 Automatic backups scheduled every 24 hours')
})