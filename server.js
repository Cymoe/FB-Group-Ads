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
    
    // For now, simulate login with the actual Google user ID
    if (email && password) {
      const token = jwt.sign(
        { userId: '103790072909526511123', email, name: 'User' },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.json({ 
        token, 
        user: { id: '103790072909526511123', email, name: 'User' } 
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
    
    // For now, simulate registration with the actual Google user ID
    if (email && password && name) {
      const token = jwt.sign(
        { userId: '103790072909526511123', email, name },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.json({ 
        token, 
        user: { id: '103790072909526511123', email, name } 
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
    
    // Also add to global groups database if it doesn't exist yet
    const existingGlobalGroup = await db.collection('global_groups').findOne({ name: group.name })
    
    if (!existingGlobalGroup) {
      const newGlobalGroup = {
        name: group.name,
        category: group.category || 'General',
        description: group.description || '',
        facebook_url: group.facebook_url || '',
        location: {
          city: group.location?.city || '',
          state: group.location?.state || '',
          country: group.location?.country || 'USA'
        },
        member_count: group.member_count || 0,
        privacy: group.privacy || 'public',
        quality_score: group.quality_score || 70,
        verified: false,
        industries: group.industries || [],
        tags: group.tags || [],
        added_by_count: 1, // User just added it
        trending_score: 0,
        contributed_by: req.user.userId,
        contributed_at: new Date().toISOString(),
        verified_by_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await db.collection('global_groups').insertOne(newGlobalGroup)
      console.log('✅ Created new global group:', group.name)
    } else {
      // Increment added_by_count for existing global group
      await db.collection('global_groups').updateOne(
        { name: group.name },
        { 
          $inc: { added_by_count: 1 },
          $set: { updated_at: new Date().toISOString() }
        }
      )
      console.log('✅ Incremented added_by_count for existing global group:', group.name)
    }
    
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
    
    console.log('🔍 Updating group with id:', id)
    
    // Try to convert to ObjectId first
    let query = null
    let group = null
    
    try {
      const objectId = new ObjectId(id)
      // Valid ObjectId - search by _id
      query = { _id: objectId, user_id: req.user.userId }
      group = await db.collection('groups').findOne(query)
    } catch (error) {
      // Not a valid ObjectId - search by custom id field
      query = { id: id, user_id: req.user.userId }
      group = await db.collection('groups').findOne(query)
    }
    
    if (!group) {
      console.log('❌ Group not found with id:', id)
      return res.status(404).json({ error: 'Group not found or unauthorized' })
    }
    
    console.log('✅ Found group:', group.name, 'MongoDB _id:', group._id)
    
    // Now update using MongoDB's _id (the actual document identifier)
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    }
    
    // Update using the actual MongoDB _id
    const result = await db.collection('groups').updateOne(
      { _id: group._id, user_id: req.user.userId },
      { $set: updates }
    )
    
    if (result.matchedCount === 0) {
      console.log('❌ Update matched 0 documents')
      return res.status(404).json({ error: 'Group not found' })
    }
    
    console.log('✅ Updated group successfully, matchedCount:', result.matchedCount)
    
    // Fetch updated group using MongoDB _id
    const updatedGroup = await db.collection('groups').findOne({ _id: group._id })
    res.json(mapId(updatedGroup))
  } catch (error) {
    console.error('❌ Error updating group:', error)
    res.status(500).json({ error: 'Failed to update group', details: error.message })
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
    
    // If this group was added from the global database, decrement the added_by_count
    if (group.global_group_id) {
      try {
        await db.collection('global_groups').updateOne(
          { _id: new ObjectId(group.global_group_id) },
          { 
            $inc: { added_by_count: -1 },
            $set: { updated_at: new Date().toISOString() }
          }
        )
        console.log(`✅ Decremented added_by_count for global group: ${group.name}`)
      } catch (error) {
        console.error('⚠️ Failed to decrement global group count:', error)
        // Don't fail the request if this update fails
      }
    }
    
    res.json({ success: true, message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    res.status(500).json({ error: 'Failed to delete group' })
  }
})

// ============================================
// GLOBAL GROUPS ENDPOINTS
// ============================================

// Get all global groups (public database)
app.get('/api/global-groups', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const globalGroups = await db.collection('global_groups').find({}).toArray()
    res.json(globalGroups.map(mapId))
  } catch (error) {
    console.error('Error fetching global groups:', error)
    res.status(500).json({ error: 'Failed to fetch global groups' })
  }
})

// Add group from global database to user's collection
app.post('/api/global-groups/:id/add', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    const { company_id } = req.body

    if (!company_id) {
      return res.status(400).json({ error: 'Company ID is required' })
    }

    // Verify the company belongs to the user
    const company = await db.collection('companies').findOne({
      id: company_id,
      user_id: req.user.userId
    })

    if (!company) {
      return res.status(404).json({ error: 'Company not found or unauthorized' })
    }

    // Find the global group
    const globalGroup = await db.collection('global_groups').findOne({ _id: new ObjectId(id) })
    
    if (!globalGroup) {
      return res.status(404).json({ error: 'Global group not found' })
    }

    // Check if user already has this group
    const existingGroup = await db.collection('groups').findOne({
      name: globalGroup.name,
      company_id: company_id,
      user_id: req.user.userId
    })

    if (existingGroup) {
      return res.status(400).json({ error: 'You already have this group in your collection' })
    }

    // Create a new group from the global group data
    const newGroup = {
      name: globalGroup.name,
      description: globalGroup.description,
      company_id: company_id,
      category: globalGroup.category,
      audience_size: globalGroup.member_count,
      status: 'active',
      privacy: globalGroup.privacy,
      target_city: globalGroup.location.city,
      target_state: globalGroup.location.state,
      quality_rating: Math.round(globalGroup.quality_score / 10), // Convert 0-100 to 1-10
      qa_status: 'approved',
      user_id: req.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Track source
      source: 'global_database',
      global_group_id: globalGroup._id.toString()
    }

    const result = await db.collection('groups').insertOne(newGroup)
    const insertedGroup = await db.collection('groups').findOne({ _id: result.insertedId })

    // Increment the added_by_count in global group
    await db.collection('global_groups').updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { added_by_count: 1 },
        $set: { updated_at: new Date().toISOString() }
      }
    )

    res.json(mapId(insertedGroup))
  } catch (error) {
    console.error('Error adding global group:', error)
    res.status(500).json({ error: 'Failed to add group' })
  }
})

// Contribute a new group to the global database
app.post('/api/global-groups/contribute', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { name, description, category, location, facebook_url, member_count, privacy, industries, tags } = req.body

    // Validate required fields
    if (!name || !category || !location || !location.city || !location.state) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if group already exists
    const existingGroup = await db.collection('global_groups').findOne({ name })
    
    if (existingGroup) {
      return res.status(400).json({ error: 'This group already exists in the database' })
    }

    // Create new global group
    const newGlobalGroup = {
      name,
      category,
      description: description || '',
      facebook_url: facebook_url || '',
      location: {
        city: location.city,
        state: location.state,
        country: location.country || 'USA'
      },
      member_count: member_count || 0,
      privacy: privacy || 'public',
      quality_score: 70, // Default quality score for new contributions
      verified: false,
      industries: industries || [],
      tags: tags || [],
      added_by_count: 0,
      trending_score: 0,
      contributed_by: req.user.userId,
      contributed_at: new Date().toISOString(),
      verified_by_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const result = await db.collection('global_groups').insertOne(newGlobalGroup)
    const insertedGroup = await db.collection('global_groups').findOne({ _id: result.insertedId })

    res.json(mapId(insertedGroup))
  } catch (error) {
    console.error('Error contributing global group:', error)
    res.status(500).json({ error: 'Failed to contribute group' })
  }
})

// Get impact data for a global group (used before deletion)
app.get('/api/global-groups/:id/impact', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Get the global group
    const globalGroup = await db.collection('global_groups').findOne({ 
      _id: new ObjectId(id) 
    })
    
    if (!globalGroup) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    // Count how many organizations have added this group
    const organizationsUsing = await db.collection('groups').countDocuments({
      name: globalGroup.name
    })
    
    // Count scheduled posts for this group
    const scheduledPosts = await db.collection('posts').countDocuments({
      group_name: globalGroup.name,
      status: 'scheduled'
    })
    
    // Get list of organization names using it
    const groupsUsingIt = await db.collection('groups').find({
      name: globalGroup.name
    }).toArray()
    
    const orgIds = [...new Set(groupsUsingIt.map(g => g.company_id))]
    const organizations = await db.collection('companies').find({
      id: { $in: orgIds }
    }).toArray()
    
    res.json({
      organizationsUsing,
      scheduledPosts,
      organizations: organizations.map(org => ({ id: org.id, name: org.name })),
      canDelete: organizationsUsing < 5, // Hybrid approach: only allow if < 5 orgs
      isContributor: globalGroup.contributed_by === req.user.userId || globalGroup.contributed_by === 'system'
    })
  } catch (error) {
    console.error('Error fetching impact data:', error)
    res.status(500).json({ error: 'Failed to fetch impact data' })
  }
})

// Delete a global group (contributor only, with cascading delete)
app.delete('/api/global-groups/:id', authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const { id } = req.params
    
    // Get the global group
    const globalGroup = await db.collection('global_groups').findOne({ 
      _id: new ObjectId(id) 
    })
    
    if (!globalGroup) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    // Verify ownership (must be contributor or system group)
    if (globalGroup.contributed_by !== req.user.userId && globalGroup.contributed_by !== 'system') {
      return res.status(403).json({ 
        error: 'You can only delete groups you contributed' 
      })
    }
    
    // Check usage limit (hybrid approach: prevent deletion if heavily used)
    const organizationsUsing = await db.collection('groups').countDocuments({
      name: globalGroup.name
    })
    
    if (organizationsUsing >= 5) {
      return res.status(403).json({ 
        error: 'This group is used by 5+ organizations and cannot be deleted. Contact support for assistance.' 
      })
    }
    
    // Perform cascading delete
    // 1. Delete from global_groups
    await db.collection('global_groups').deleteOne({ _id: new ObjectId(id) })
    
    // 2. Delete from all organizations' groups
    const groupsDeleted = await db.collection('groups').deleteMany({ 
      name: globalGroup.name 
    })
    
    // 3. Delete or cancel all posts for this group
    const postsDeleted = await db.collection('posts').deleteMany({ 
      group_name: globalGroup.name 
    })
    
    res.json({ 
      message: 'Group deleted globally',
      affected: {
        organizations: groupsDeleted.deletedCount,
        posts: postsDeleted.deletedCount
      }
    })
  } catch (error) {
    console.error('Error deleting global group:', error)
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