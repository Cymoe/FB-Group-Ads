import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zuukkeokqadfaykxuxiv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dWtrZW9rcWFkZmF5a3h1eGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.placeholder'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabaseData() {
  try {
    console.log('🔍 Checking Supabase database for existing data...')
    
    // Check companies
    console.log('\n📊 COMPANIES:')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
    
    if (companiesError) {
      console.log('❌ Companies error:', companiesError.message)
    } else {
      console.log(`✅ Found ${companies?.length || 0} companies:`)
      companies?.forEach(company => {
        console.log(`  - ${company.name} (${company.id})`)
      })
    }
    
    // Check groups
    console.log('\n📊 GROUPS:')
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
    
    if (groupsError) {
      console.log('❌ Groups error:', groupsError.message)
    } else {
      console.log(`✅ Found ${groups?.length || 0} groups:`)
      groups?.slice(0, 10).forEach(group => {
        console.log(`  - ${group.name} (Company: ${group.company_id})`)
      })
      if (groups?.length > 10) {
        console.log(`  ... and ${groups.length - 10} more groups`)
      }
    }
    
    // Check posts
    console.log('\n📊 POSTS:')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
    
    if (postsError) {
      console.log('❌ Posts error:', postsError.message)
    } else {
      console.log(`✅ Found ${posts?.length || 0} posts`)
    }
    
    // Check leads
    console.log('\n📊 LEADS:')
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
    
    if (leadsError) {
      console.log('❌ Leads error:', leadsError.message)
    } else {
      console.log(`✅ Found ${leads?.length || 0} leads`)
    }
    
  } catch (error) {
    console.error('❌ Error checking Supabase data:', error)
  }
}

checkSupabaseData()
