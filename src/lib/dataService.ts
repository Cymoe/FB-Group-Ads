import type { Company, Group, Post, Lead } from '../types/database'

const API_BASE = 'http://localhost:3001/api'

// Companies
export async function getCompanies(): Promise<Company[]> {
  try {
    const response = await fetch(`${API_BASE}/companies`)
    if (!response.ok) throw new Error('Failed to fetch companies')
    return await response.json()
  } catch (error) {
    console.error('Error fetching companies:', error)
    return []
  }
}

export async function addCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
  try {
    const response = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    })
    if (!response.ok) throw new Error('Failed to add company')
    return await response.json()
  } catch (error) {
    console.error('Error adding company:', error)
    throw error
  }
}

// Groups
export async function getGroups(): Promise<Group[]> {
  try {
    const response = await fetch(`${API_BASE}/groups`)
    if (!response.ok) throw new Error('Failed to fetch groups')
    return await response.json()
  } catch (error) {
    console.error('Error fetching groups:', error)
    return []
  }
}

export async function addGroup(group: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
  try {
    const response = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    })
    if (!response.ok) throw new Error('Failed to add group')
    return await response.json()
  } catch (error) {
    console.error('Error adding group:', error)
    throw error
  }
}

// Posts
export async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE}/posts`)
    if (!response.ok) throw new Error('Failed to fetch posts')
    return await response.json()
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function addPost(post: Omit<Post, 'id' | 'created_at' | 'company' | 'group' | 'updated_at'>): Promise<Post> {
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    })
    if (!response.ok) throw new Error('Failed to add post')
    return await response.json()
  } catch (error) {
    console.error('Error adding post:', error)
    throw error
  }
}

// Leads
export async function getLeads(): Promise<Lead[]> {
  try {
    const response = await fetch(`${API_BASE}/leads`)
    if (!response.ok) throw new Error('Failed to fetch leads')
    return await response.json()
  } catch (error) {
    console.error('Error fetching leads:', error)
    return []
  }
}

export async function addLead(lead: Omit<Lead, 'id' | 'created_at' | 'post'>): Promise<Lead> {
  try {
    const response = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    })
    if (!response.ok) throw new Error('Failed to add lead')
    return await response.json()
  } catch (error) {
    console.error('Error adding lead:', error)
    throw error
  }
}
