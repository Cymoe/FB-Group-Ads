import { useState, useEffect, useRef } from 'react'
import { Plus, X, Send, Edit, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { List } from 'react-window'
import type { Company, Group, Post } from '../types/database'
import { calculateGroupHealth } from '../utils/groupHealth'
import { aiTemplateStructure } from './aiTemplates'

interface InlinePostComposerProps {
  companies: Company[]
  groups: Group[]
  selectedCompanyId: string | null
  selectedGroupId?: string | null
  editingPost?: Post | null
  onPostCreated: (post: any, showToast?: boolean) => Promise<any>
  onPostUpdated?: (id: string, updates: any) => void
  onCancelEdit?: () => void
  onClose?: () => void
  isDarkMode?: boolean
  isRecentPostsCollapsed?: boolean
}

export default function InlinePostComposer({ 
  companies, 
  groups, 
  selectedCompanyId,
  selectedGroupId,
  editingPost,
  onPostCreated,
  onPostUpdated,
  onCancelEdit,
  isDarkMode = true
}: InlinePostComposerProps) {
  const composerRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [selectedPostType, setSelectedPostType] = useState('value_post')
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [createdPost, setCreatedPost] = useState<any>(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [isDuplicating, setIsDuplicating] = useState(false)
  
  // Undo functionality for bulk operations
  const [recentBulkPosts, setRecentBulkPosts] = useState<Array<{ id: string, groupName: string }>>([])
  const [showUndoBanner, setShowUndoBanner] = useState(false)
  const [isUndoing, setIsUndoing] = useState(false)
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // AI Generation
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [aiContentGenerated, setAiContentGenerated] = useState(false) // Track if AI generated content
  const [customInstructions, setCustomInstructions] = useState('') // Custom instructions for AI generation
  const [postMetadata, setPostMetadata] = useState<{industry?: string, goal?: string, template?: string, prompt?: string} | null>(null)
  
  const isEditMode = !!editingPost

  // AI Template Structure is now imported from ./aiTemplates.ts

  // Auto-suggest post type based on content
  const suggestPostType = (text: string) => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('save') || lowerText.includes('money') || lowerText.includes('cost')) return 'cost_saver'
    if (lowerText.includes('tip') || lowerText.includes('quick')) return 'quick_tip'
    if (lowerText.includes('warning') || lowerText.includes('alert') || lowerText.includes('danger')) return 'warning_post'
    if (lowerText.includes('diy') || lowerText.includes('how to') || lowerText.includes('guide')) return 'diy_guide'
    if (lowerText.includes('story') || lowerText.includes('experience')) return 'personal_story'
    if (lowerText.includes('offer') || lowerText.includes('deal') || lowerText.includes('special')) return 'special_offer'
    return 'value_post'
  }

  // Map AI goals to post types
  const getPostTypeFromAIGoal = (goalId: string, templateId: string): string => {
    // Lead Generation templates → Special Offer
    if (goalId === 'lead_gen') return 'special_offer'
    
    // Educational Content templates → Value Post or based on template
    if (goalId === 'education') {
      if (templateId.includes('warning') || templateId.includes('danger')) return 'warning_post'
      if (templateId.includes('diy') || templateId.includes('tips')) return 'diy_guide'
      if (templateId.includes('quick') || templateId.includes('tip')) return 'quick_tip'
      return 'value_post'
    }
    
    // Promotions templates → Special Offer
    if (goalId === 'promotions') return 'special_offer'
    
    // Social Proof templates → Personal Story
    if (goalId === 'social_proof') return 'personal_story'
    
    // Listings templates → Local Alert
    if (goalId === 'listings' || goalId === 'land_listings') return 'local_alert'
    
    // Market Insights templates → Value Post
    if (goalId === 'market_insights') return 'value_post'
    
    // Default to Value Post
    return 'value_post'
  }

  // AI Generation Function (Placeholder for OpenAI/Grok/Claude)
  const generatePostContent = async (templateId: string, industryId: string, serviceTypeId: string, goalId: string) => {
    const industry = (aiTemplateStructure as any)[industryId]
    if (!industry) return
    
    const serviceType = (industry.serviceTypes as any)[serviceTypeId]
    if (!serviceType) return
    
    const goal = (serviceType.goals as any)[goalId]
    if (!goal) return
    
    const template = goal.templates.find((t: any) => t.id === templateId)
    if (!template) return

    setIsGeneratingAI(true)
    
    try {
      const companyName = companies.find(c => c.id === selectedCompanyId)?.name || 'Your Company'
      let finalPrompt = template.prompt.replace('{company}', companyName)
      
      // Append custom instructions if provided
      if (customInstructions.trim()) {
        finalPrompt += `\n\nAdditional context: ${customInstructions.trim()}`
      }
      
      // TODO: Replace this with actual AI API call (OpenAI, Grok, Claude, etc.)
      // Example structure for when you connect it:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUR_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'user',
            content: finalPrompt
          }]
        })
      })
      const data = await response.json()
      const generatedContent = data.choices[0].message.content
      */

      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store metadata separately (not in content)
      setPostMetadata({
        industry: `${industry.name} - ${serviceType.name}`,
        goal: goal.name,
        template: `${template.icon} ${template.name}`,
        prompt: finalPrompt
      })
      
      // Clean placeholder content - just the actual content, no metadata
      let placeholderContent = `[Your AI-generated content will appear here when you connect OpenAI, Grok, or Claude]`
      
      if (customInstructions.trim()) {
        placeholderContent += `\n\n📝 Custom Instructions:\n${customInstructions}`
      }
      
      setContent(placeholderContent)
      
      // Auto-assign post type based on AI goal
      const autoPostType = getPostTypeFromAIGoal(goalId, templateId)
      setSelectedPostType(autoPostType)
      
      toast.success(`✨ Post generated! Review in preview mode.`)
      setAiContentGenerated(true) // Mark that AI content was generated
      setShowPreview(true) // Show in preview mode first so user can review
      
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate post. Please try again.')
    } finally {
      setIsGeneratingAI(false)
      setSelectedIndustry(null)
      setSelectedServiceType(null)
      setSelectedGoal(null)
    }
  }
  
  // Open AI prompts for regeneration
  const openAIPrompts = () => {
    setAiContentGenerated(false)
    setSelectedIndustry(null)
    setSelectedServiceType(null)
    setSelectedGoal(null)
    setCustomInstructions('') // Reset custom instructions
  }

  // Pre-fill form when editing a post
  useEffect(() => {
    if (editingPost) {
      setIsExpanded(true)
      
      // Clean up old "Generated:" lines from content
      let cleanContent = editingPost.content || ''
      cleanContent = cleanContent.replace(/^[^\n]*Generated:[^\n]*\n\n?/i, '') // Remove "Generated: ..." line at start
      
      setContent(cleanContent)
      setSelectedPostType(editingPost.post_type)
      
      // Scroll to composer
      if (composerRef.current) {
        composerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [editingPost])

  // Auto-suggest groups when post type changes (only in create mode)
  // Auto-recommendation removed - posts go to the currently selected group only

  // Auto-suggest post type when content changes (only in create mode)
  useEffect(() => {
    if (!isEditMode && content.length > 20) {
      const suggested = suggestPostType(content)
      setSelectedPostType(suggested)
    }
  }, [content, isEditMode])

  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }, [])

  // Start undo timer (30 seconds)
  const startUndoTimer = (posts: Array<{ id: string, groupName: string }>) => {
    setRecentBulkPosts(posts)
    setShowUndoBanner(true)
    
    // Clear any existing timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
    }
    
    // Hide banner after 30 seconds
    undoTimerRef.current = setTimeout(() => {
      setShowUndoBanner(false)
      setRecentBulkPosts([])
    }, 30000)
  }

  // Handle bulk undo
  const handleBulkUndo = async () => {
    if (recentBulkPosts.length === 0 || isUndoing) return
    
    setIsUndoing(true)
    const count = recentBulkPosts.length
    let deletedCount = 0
    
    try {
      for (const post of recentBulkPosts) {
        try {
          const response = await fetch(`http://localhost:3001/api/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          if (response.ok) deletedCount++
        } catch (error) {
          console.error(`Failed to delete post from ${post.groupName}:`, error)
        }
      }
      
      if (deletedCount === count) {
        toast.success(`🎉 Undone! Deleted ${count} post${count !== 1 ? 's' : ''}`)
      } else if (deletedCount > 0) {
        toast.success(`⚠️ Deleted ${deletedCount}/${count} posts`)
      } else {
        toast.error('Failed to undo posts. Please delete manually.')
      }
      
      // Force refresh by reloading the page
      window.location.reload()
    } catch (error) {
      toast.error('Failed to undo. Please try again.')
    } finally {
      setIsUndoing(false)
      setShowUndoBanner(false)
      setRecentBulkPosts([])
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }

  const handleSavePost = async () => {
    if (!content.trim() || !selectedGroupId) return

    setIsGenerating(true)
    
    try {
      if (isEditMode && editingPost && onPostUpdated) {
        // Update existing post
        const updates = {
          title: content.substring(0, 50) + '...',
          content: content.trim(),
          post_type: selectedPostType,
          group_id: selectedGroupId // Keep the same group
        }
        
        await onPostUpdated(editingPost.id, updates)
        
        // Reset form
        setContent('')
        setIsExpanded(false)
        setAiContentGenerated(false)
        setPostMetadata(null) // Clear metadata
        
        if (onCancelEdit) onCancelEdit()
      } else {
        // Create new post for the current group
        if (!selectedGroupId) {
          console.error('No group selected')
          return
        }

        const newPost = {
          company_id: selectedCompanyId,
          group_id: selectedGroupId,
          post_type: selectedPostType,
          title: content.substring(0, 50) + '...',
          content: content.trim(),
          status: 'draft',
          created_at: new Date().toISOString()
        }

        // Create post
        onPostCreated(newPost)
        
        // Store created post and show duplicate modal
        setCreatedPost(newPost)
        setShowDuplicateModal(true)

        // Reset form
        setContent('')
        setIsExpanded(false)
        setAiContentGenerated(false)
        setPostMetadata(null) // Clear metadata
      }
      
    } catch (error) {
      console.error('Error saving post:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleCancel = () => {
    setContent('')
    setIsExpanded(false)
    setAiContentGenerated(false) // Reset AI flag when cancelling
    setPostMetadata(null) // Clear metadata
    if (isEditMode && onCancelEdit) {
      onCancelEdit()
    }
  }


  const selectedCompany = companies?.find(c => c.id === selectedCompanyId)

  if (!selectedCompanyId) {
    return (
      <div className="rounded p-4 mb-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus size={20} className="text-white" />
          </div>
          <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Select a Company First</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose a company from the sidebar to start creating posts</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={composerRef} className="rounded mb-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-neutral)' }}>
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 bg-[#336699] rounded-full flex items-center justify-center transition-all hover:bg-[#336699]/80 cursor-pointer"
              title="Create new post"
            >
              <Plus size={16} className="text-white" />
            </button>
            <input
              type="text"
              placeholder={`What's on your mind, ${selectedCompany?.name}? Start typing to create a post...`}
              className="flex-1 border-none outline-none text-sm"
              style={{ 
                backgroundColor: 'var(--post-composer-bg)', 
                color: 'var(--post-composer-text)',
                border: '1px solid var(--post-composer-border)',
                borderRadius: '8px',
                padding: '12px'
              }}
              onFocus={() => setIsExpanded(true)}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Expanded State - Full Screen Modal Overlay */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleCancel}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div 
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
              style={{ backgroundColor: 'var(--card-bg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancel}
                      className="w-8 h-8 bg-[#336699] rounded-full flex items-center justify-center transition-all hover:bg-[#336699]/80"
                      title="Close composer"
                    >
                      {isEditMode ? <Edit size={16} className="text-white" /> : <X size={16} className="text-white" />}
                    </button>
              <div>
                <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {isEditMode ? 'Edit Post' : 'Create New Post'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>for {selectedCompany?.name}</p>
              </div>
            </div>
                </div>

          {/* Split Layout: Full-width AI wizard OR side-by-side editing */}
          <div>

              {/* AI Generation Section (Full width when active) */}
              {!isEditMode && !aiContentGenerated && !content && (
                <div className="max-w-4xl mx-auto">
                  <div className="rounded-lg p-4 border-2 border-dashed transition-all h-full" style={{ 
                    backgroundColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    borderColor: 'rgba(59, 130, 246, 0.3)'
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm">✨</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Generate with AI
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Choose a template
                        </p>
                      </div>
                    </div>

                  {/* Multi-Level AI Template Navigation */}
                    <div className="space-y-3">
                      
                      {/* LEVEL 1: Industry Selection */}
                      {!selectedIndustry && (
                        <>
                          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Step 1 of 4: Select Your Industry
                          </div>
                          <div className="flex flex-col gap-2">
                            {Object.entries(aiTemplateStructure).map(([key, industry]) => (
            <button
                                key={key}
                                onClick={() => setSelectedIndustry(key)}
                                className="p-4 rounded-lg text-left transition-all hover:scale-[1.01] hover:border-blue-500"
              style={{ 
                backgroundColor: 'var(--input-bg)', 
                                  border: '1px solid var(--border-neutral)'
                                }}
                              >
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-2xl">{industry.icon}</span>
                                  <div className="flex-1">
                                    <div className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                      {industry.name}
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                      {industry.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* LEVEL 2: Service Type Selection */}
                      {selectedIndustry && !selectedServiceType && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Step 2 of 4: Select Service Type
                            </div>
                            <button
                              onClick={() => setSelectedIndustry(null)}
                              className="text-xs px-2 py-1 rounded transition-colors"
                              style={{ 
                                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-secondary)' 
              }}
            >
                              ← Back
            </button>
          </div>
                          <div className="mb-2 p-2 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {(aiTemplateStructure as any)[selectedIndustry].icon} {(aiTemplateStructure as any)[selectedIndustry].name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                            {Object.entries((aiTemplateStructure as any)[selectedIndustry].serviceTypes || {}).map(([key, serviceType]: [string, any]) => (
                              <button
                                key={key}
                                onClick={() => setSelectedServiceType(key)}
                                className="p-4 rounded-lg text-left transition-all hover:scale-[1.02] hover:border-blue-500"
                                style={{ 
                                  backgroundColor: 'var(--input-bg)',
                                  border: '1px solid var(--border-neutral)'
                                }}
                              >
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                  {serviceType.name}
                                </div>
                                <p className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                                  {serviceType.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* LEVEL 3: Goal Selection */}
                      {selectedIndustry && selectedServiceType && !selectedGoal && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Step 3 of 4: Choose Your Goal
                            </div>
                            <button
                              onClick={() => setSelectedServiceType(null)}
                              className="text-xs px-2 py-1 rounded transition-colors"
                              style={{ 
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-secondary)' 
                              }}
                            >
                              ← Back
                            </button>
                          </div>
                          <div className="mb-2 p-2 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {(aiTemplateStructure as any)[selectedIndustry].name} → {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                            {Object.entries((aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals).map(([key, goal]: [string, any]) => (
                              <button
                                key={key}
                                onClick={() => setSelectedGoal(key)}
                                className="p-4 rounded-lg text-left transition-all hover:scale-[1.02] hover:border-blue-500"
                                style={{ 
                                  backgroundColor: 'var(--input-bg)',
                                  border: '1px solid var(--border-neutral)'
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{goal.icon}</span>
                                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {goal.name}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* LEVEL 4: Template Selection */}
                      {selectedIndustry && selectedServiceType && selectedGoal && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Step 4 of 4: Select Template
                            </div>
                            <button
                              onClick={() => setSelectedGoal(null)}
                              className="text-xs px-2 py-1 rounded transition-colors"
                              style={{ 
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              ← Back
                            </button>
                          </div>
                          <div className="mb-2 p-2 rounded flex items-center gap-1" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                              {(aiTemplateStructure as any)[selectedIndustry].name}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>→</span>
                            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                              {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].name}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>→</span>
                            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                              {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[selectedGoal].name.split(' ').slice(1).join(' ')}
                            </span>
                          </div>

                          {/* Custom Instructions Field */}
                          <div className="mb-3 p-3 rounded-lg" style={{ 
                            backgroundColor: 'var(--input-bg)',
                            border: '1px solid var(--border-neutral)'
                          }}>
                            <label className="block mb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                                  📝 Custom Instructions (Optional)
                                </span>
                              </div>
                              <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="e.g., Mention our 20 years in business, focus on summer services, include our 24/7 availability..."
                                rows={3}
                                className="w-full px-3 py-2 text-xs rounded resize-none"
                                style={{
                                  backgroundColor: 'var(--carbon-black)',
                                  border: '1px solid var(--border-neutral)',
                                  color: 'var(--text-primary)'
                                }}
                                disabled={isGeneratingAI}
                              />
                            </label>
                            <p className="text-[10px] leading-tight" style={{ color: 'var(--text-disabled)' }}>
                              Add specific details like years in business, seasonal focus, special offers, or service areas
                            </p>
                          </div>

                          {/* Loading Indicator - Transparent Banner */}
                          {isGeneratingAI && (
                            <div className="mb-3 p-3 rounded-lg flex items-center justify-center gap-3" style={{ 
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                              <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>
                                Generating your post...
                              </span>
                            </div>
                          )}

                          {/* Template List */}
                          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                            {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[selectedGoal].templates.map((template: any) => (
                              <button
                                key={template.id}
                                onClick={() => generatePostContent(template.id, selectedIndustry!, selectedServiceType!, selectedGoal!)}
                                disabled={isGeneratingAI}
                                className="p-4 rounded-lg text-left transition-all hover:scale-[1.02] hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ 
                                  backgroundColor: 'var(--input-bg)',
                                  border: '1px solid var(--border-neutral)'
                                }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{template.icon}</span>
                                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {template.name}
                                  </span>
                                </div>
                                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                  {template.prompt.split('.')[0]}...
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Editor (shown after AI generation or when manually editing) */}
              {(isEditMode || aiContentGenerated || content) && (
              <div className="space-y-4">

          {/* Side-by-Side Layout: Metadata + Content */}
          <div className={`${postMetadata ? 'flex gap-4' : ''}`}>
            {/* LEFT: Metadata Sidebar (30%) */}
            {postMetadata && (
              <div className="flex-[3] space-y-3">
                <div 
                  className="p-3 rounded space-y-3 sticky top-4"
                  style={{ 
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-neutral)'
                  }}
                >
                  <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--border-neutral)' }}>
                    <span>📊</span>
                    <span className="text-xs font-medium uppercase tracking-[0.5px]" style={{ color: 'var(--text-primary)' }}>Post Details</span>
                  </div>
                  
                  <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <div>
                      <div className="font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Industry</div>
                      <div>{postMetadata.industry}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Goal</div>
                      <div>{postMetadata.goal}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Template</div>
                      <div>{postMetadata.template}</div>
                    </div>
                    
                    <div className="pt-2" style={{ borderTop: '1px solid var(--border-neutral)' }}>
                      <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Prompt Used</div>
                      <div className="text-[11px] opacity-70 leading-relaxed">{postMetadata.prompt}</div>
                    </div>
                  </div>

                  {/* Regenerate Button */}
                  <button
                    onClick={() => { setContent(''); setPostMetadata(null); setShowPreview(false); openAIPrompts(); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3B82F6'
                    }}
                  >
                    <span>🔄</span>
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* RIGHT: Content Input (70%) */}
            <div className={`space-y-2 ${postMetadata ? 'flex-[7]' : 'flex-1'}`}>
              <div className="flex items-center justify-between">
                {postMetadata?.template && (
                  <span className="text-sm font-medium px-2 py-1 rounded" style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    color: '#3B82F6',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    {postMetadata.template}
                  </span>
                )}
                <div className={`flex items-center gap-2 ${!postMetadata?.template ? 'ml-auto' : ''}`}>
                  <span className="text-xs" style={{ color: content.length > 2000 ? '#dc2626' : content.length > 1500 ? '#f59e0b' : 'var(--text-secondary)' }}>
                    {content.length}/2000
                  </span>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ 
                      backgroundColor: 'var(--input-bg)', 
                      border: '1px solid var(--border-neutral)', 
                      color: 'var(--text-secondary)' 
                    }}
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
              </div>
              
              {showPreview ? (
                <div 
                  className="rounded p-4 min-h-[300px]" 
                  style={{ 
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB', 
                    border: isDarkMode ? '1px solid var(--border-neutral)' : '1px solid #E5E7EB' 
                  }}
                >
                  <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{content || 'No content to preview...'}</div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="w-full min-h-[300px] px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#336699]/40 transition-all resize-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: content.length > 2000 ? '1px solid #dc2626' : content.length > 1500 ? '1px solid #f59e0b' : '1px solid var(--input-border)',
                    color: 'var(--text-primary)'
                  }}
                />
              )}
            </div>
          </div>

          {/* Posting To - Simple info showing current group */}
            <div>
                  {selectedGroupId ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  Posting to:
                </span>
                <span 
                  className="text-sm font-medium flex-1" 
                  style={{ 
                    color: 'var(--text-primary)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflow: 'visible'
                  }}
                  title={groups.find(g => g.id === selectedGroupId)?.name || 'Unknown Group'}
                >
                  {groups.find(g => g.id === selectedGroupId)?.name || 'Unknown Group'}
                </span>
              </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 rounded" style={{ backgroundColor: isDarkMode ? '#FEF3C7' : '#FEF3C7', border: '1px solid #FCD34D' }}>
                      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">Select a group to post to</p>
                        <p className="text-xs text-amber-700">Choose a group from the sidebar to enable posting</p>
              </div>
            </div>
          )}
                </div>
              </div>
              )}
              {/* End Content Editor */}

            </div>
            {/* End Layout */}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 mt-6" style={{ borderTop: '1px solid var(--border-neutral)' }}>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSavePost}
              disabled={!content.trim() || !selectedGroupId || isGenerating}
              className={`flex items-center gap-2 px-4 py-2 bg-[#336699] hover:bg-[#336699]/80 text-white rounded text-sm font-medium uppercase tracking-[0.5px] transition-colors disabled:cursor-not-allowed ${
                (!content.trim() || !selectedGroupId || isGenerating) ? 'opacity-50' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Send size={14} />
                  {isEditMode ? 'Update Post' : 'Create Post'}
                </>
              )}
            </button>
          </div>
            {/* End Action Buttons */}

        </div>
          {/* End p-6 padding div */}
        </div>
        {/* End max-w-6xl modal container */}
      </div>
      {/* End fixed z-[110] modal wrapper */}
    </>
  )}
  {/* End isExpanded conditional */}

      {/* Duplicate to Other Groups Modal */}
      {showDuplicateModal && createdPost && (() => {
        const availableGroups = groups.filter(g => g.company_id === selectedCompanyId && g.id !== selectedGroupId)
        // Only include safe groups (non-at-risk) for "Select All"
        const safeGroups = availableGroups.filter(g => {
          const health = calculateGroupHealth(g)
          return health.status !== 'danger'
        })
        const allGroupIds = safeGroups.map(g => g.id)
        const allSelected = selectedGroupIds.length === safeGroups.length && safeGroups.length > 0
        
        return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
            style={{ 
              backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
              border: '1px solid var(--border-neutral)',
              opacity: 1
            }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-neutral)' }}>
                <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    ✅ Post Created Successfully!
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Duplicate this post to other groups?
                  </p>
                </div>
                <button
                  onClick={() => {
                      if (isDuplicating) return // Prevent closing during duplication
                    setShowDuplicateModal(false)
                    setCreatedPost(null)
                      setSelectedGroupIds([])
                  }}
                    disabled={isDuplicating}
                    className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>
                
                {/* Select All / None */}
                {availableGroups.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedGroupIds(allSelected ? [] : allGroupIds)
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded transition-colors"
                    style={{ 
                      backgroundColor: 'var(--input-bg)',
                      color: '#336699',
                      border: '1px solid var(--border-neutral)'
                    }}
                  >
                    {allSelected ? '✓ Deselect All' : `Select All Safe Groups (${safeGroups.length})`}
                  </button>
                )}
            </div>

              {/* Warning for 20+ Groups */}
              {selectedGroupIds.length >= 20 && (
                <div className="mx-6 mb-2 p-3 rounded-lg border-2 border-yellow-500/40 bg-yellow-500/10 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-500 mb-1">
                      ⚠️ Posting to {selectedGroupIds.length} Groups at Once
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Large bulk posts can trigger spam detection on Facebook. Consider splitting into smaller batches (10-15 groups) if possible.
                    </p>
                  </div>
                </div>
              )}

            {/* Groups List - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-2">
                <List
                  defaultHeight={500}
                  rowCount={availableGroups.length}
                  rowHeight={85}
                  rowProps={{}}
                  rowComponent={({ index, style }) => {
                    const group = availableGroups[index]
                    const health = calculateGroupHealth(group)
                    const isAtRisk = health.status === 'danger'
                    const isSelected = selectedGroupIds.includes(group.id)
                    const isBlocked = isAtRisk // Block at-risk groups
                    
                    return (
                      <div style={style} className="px-0 pb-2">
                        <label
                        key={group.id}
                          className={`p-2.5 rounded-lg transition-all relative ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}
                        style={{ 
                          backgroundColor: 'var(--input-bg)',
                            border: `2px solid ${isSelected ? health.color : 'var(--border-neutral)'}`,
                            display: 'block'
                          }}
                        >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isBlocked}
                            onChange={(e) => {
                              if (isBlocked) return
                              if (e.target.checked) {
                                setSelectedGroupIds([...selectedGroupIds, group.id])
                              } else {
                                setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id))
                              }
                            }}
                            className={`mt-1 w-4 h-4 rounded ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ accentColor: health.color }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{health.icon}</span>
                              <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {group.name}
                              </h3>
                              {isBlocked && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-500 border border-red-500/30">
                                  ⛔ Too Risky
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {health.postsThisWeek}/3 posts this week
                              {health.daysSinceLastPost !== null && ` · Last posted ${health.daysSinceLastPost} days ago`}
                            </p>
                          </div>
                        </div>
                        </label>
                      </div>
                    )
                  }}
                />
              
                {availableGroups.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No other groups available for this company
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
              <div className="p-6 border-t flex items-center gap-3" style={{ borderColor: 'var(--border-neutral)' }}>
              <button
                onClick={() => {
                    if (isDuplicating) return // Prevent closing during duplication
                  setShowDuplicateModal(false)
                  setCreatedPost(null)
                    setSelectedGroupIds([])
                }}
                  disabled={isDuplicating}
                  className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-neutral)'
                }}
              >
                  Skip
                </button>
                
                <button
                  onClick={async () => {
                    if (selectedGroupIds.length === 0 || isDuplicating) return
                    
                    setIsDuplicating(true) // Disable button immediately
                    
                    const count = selectedGroupIds.length
                    let successCount = 0
                    const failedGroups: Array<{ name: string, error: string }> = []
                    const createdPosts: Array<{ id: string, groupName: string }> = []
                    
                    try {
                      // Duplicate to all selected groups (suppress individual toasts)
                      for (const groupId of selectedGroupIds) {
                        const group = groups.find(g => g.id === groupId)
                        const duplicatePost = {
                          ...createdPost,
                          group_id: groupId,
                          created_at: new Date().toISOString()
                        }
                        console.log('🔄 Duplicating post to group:', group?.name)
                        
                        try {
                          const result = await onPostCreated(duplicatePost, false) // Don't show individual toasts
                          if (result) {
                            successCount++
                            createdPosts.push({ 
                              id: result.id, 
                              groupName: group?.name || 'Unknown Group' 
                            })
                          } else {
                            failedGroups.push({ 
                              name: group?.name || 'Unknown Group', 
                              error: 'Failed to save post' 
                            })
                          }
                        } catch (error) {
                          failedGroups.push({ 
                            name: group?.name || 'Unknown Group', 
                            error: error instanceof Error ? error.message : 'Unknown error' 
                          })
                        }
                      }
                      
                      // Show detailed feedback
                      if (successCount === count) {
                        toast.success(`🎉 Post duplicated to ${count} group${count !== 1 ? 's' : ''} successfully!`)
                        // Start undo timer if 2+ posts were created
                        if (createdPosts.length >= 2) {
                          startUndoTimer(createdPosts)
                        }
                      } else if (successCount > 0) {
                        // Some succeeded, some failed
                        const failedList = failedGroups.map(f => `• ${f.name}: ${f.error}`).join('\n')
                        toast.error(
                          `⚠️ ${successCount}/${count} posts created.\n\nFailed groups:\n${failedList}`,
                          { duration: 8000 }
                        )
                        // Start undo timer for successfully created posts (if 2+)
                        if (createdPosts.length >= 2) {
                          startUndoTimer(createdPosts)
                        }
                      } else {
                        // All failed
                        const failedList = failedGroups.slice(0, 3).map(f => `• ${f.name}`).join('\n')
                        const moreCount = failedGroups.length > 3 ? `\n...and ${failedGroups.length - 3} more` : ''
                        toast.error(
                          `❌ Failed to duplicate posts:\n${failedList}${moreCount}\n\nPlease try again or check your connection.`,
                          { duration: 6000 }
                        )
                      }
                    } finally {
                      setIsDuplicating(false)
                      setShowDuplicateModal(false)
                      setCreatedPost(null)
                      setSelectedGroupIds([])
                    }
                  }}
                  disabled={selectedGroupIds.length === 0 || isDuplicating}
                  className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: (selectedGroupIds.length > 0 && !isDuplicating) ? '#336699' : 'var(--input-bg)',
                    color: (selectedGroupIds.length > 0 && !isDuplicating) ? '#FFFFFF' : 'var(--text-disabled)',
                    border: (selectedGroupIds.length > 0 && !isDuplicating) ? 'none' : '1px solid var(--border-neutral)'
                  }}
                >
                  {isDuplicating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Duplicating...</span>
                    </>
                  ) : (
                    `Duplicate to ${selectedGroupIds.length} Group${selectedGroupIds.length !== 1 ? 's' : ''}`
                  )}
              </button>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Floating Undo Banner (Bottom of Screen) */}
      {showUndoBanner && recentBulkPosts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div 
            className="rounded-lg shadow-2xl border-2 border-yellow-500/40 p-4 flex items-center gap-4 min-w-[400px]"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                ⚡ {recentBulkPosts.length} posts created
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Accidentally posted to the wrong groups?
              </p>
            </div>
            
            <button
              onClick={handleBulkUndo}
              disabled={isUndoing}
              className="px-4 py-2 rounded font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
              style={{ 
                backgroundColor: '#EF4444',
                color: '#FFFFFF'
              }}
            >
              {isUndoing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Undoing...</span>
                </>
              ) : (
                <>
                  <X size={16} />
                  <span>Undo All</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowUndoBanner(false)
                setRecentBulkPosts([])
                if (undoTimerRef.current) {
                  clearTimeout(undoTimerRef.current)
                }
              }}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
