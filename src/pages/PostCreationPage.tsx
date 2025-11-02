import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Company, Group, Post } from '../types/database'
import { aiTemplateStructure } from '../components/aiTemplates'

interface PostCreationPageProps {
  companies: Company[]
  groups: Group[]
  selectedCompanyId: string | null
  selectedGroupId: string | null
  onPostCreated: (post: Post) => void
  setPendingAIContent: (content: { content: string; companyId: string; groupId: string } | null) => void
}

export const PostCreationPage: React.FC<PostCreationPageProps> = ({
  companies,
  groups,
  selectedCompanyId,
  selectedGroupId,
  onPostCreated,
  setPendingAIContent
}) => {
  const navigate = useNavigate()
  
  // State
  const [companyId, setCompanyId] = useState(selectedCompanyId || '')
  const [groupId, setGroupId] = useState(selectedGroupId || '')
  
  // AI Generation States
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  
  // Keep companyId in sync with selectedCompanyId from context
  useEffect(() => {
    if (selectedCompanyId) {
      setCompanyId(selectedCompanyId)
    }
  }, [selectedCompanyId])

  // Keep groupId in sync with selectedGroupId from sidebar selection
  useEffect(() => {
    if (selectedGroupId) {
      setGroupId(selectedGroupId)
    }
  }, [selectedGroupId])
  
  const company = companies.find(c => c.id === (companyId || selectedCompanyId))

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
      const companyName = company?.name || 'Your Company'
      let finalPrompt = template.prompt.replace('{company}', companyName)
      
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock content for now - replace with actual AI API call
      const mockContent = `🏠 ${companyName} - Premium Service Alert!

Experience top-quality service that exceeds your expectations.

✨ Why choose us?
• Professional & certified team
• Fast, reliable service
• Customer satisfaction guaranteed

Call us today for a free quote!

#HomeServices #LocalBusiness #QualityService`
      
      // Pass content to the drawer - it will auto-open on current page
      setPendingAIContent({
        content: mockContent,
        companyId: selectedCompanyId || companyId || '',
        groupId: groupId
      })
      
      toast.success('✨ Post generated! Opening drawer for customization...')
      
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate post. Please try again.')
    } finally {
      setIsGeneratingAI(false)
      // Clear selections after generation
      setSelectedIndustry(null)
      setSelectedServiceType(null)
      setSelectedGoal(null)
      setSelectedTemplateId(null)
    }
  }

  // Calculate current step
  const getCurrentStep = () => {
    if (!selectedIndustry) return 1
    if (!selectedServiceType) return 2
    return 3
  }
  
  // Get all templates, filtered by goal if selected
  const getTemplates = () => {
    if (!selectedIndustry || !selectedServiceType) return []
    
    const serviceType = (aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType]
    if (!serviceType) return []
    
    const goals = serviceType.goals || {}
    
    // If no goal selected, return all templates from all goals
    if (!selectedGoal) {
      const allTemplates: any[] = []
      Object.entries(goals).forEach(([goalKey, goal]: [string, any]) => {
        goal.templates.forEach((template: any) => {
          allTemplates.push({ ...template, goalKey, goalName: goal.name })
        })
      })
      return allTemplates
    }
    
    // If goal selected, return only templates from that goal
    const goal = goals[selectedGoal]
    if (!goal) return []
    
    return goal.templates.map((template: any) => ({
      ...template,
      goalKey: selectedGoal,
      goalName: goal.name
    }))
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--carbon-black)' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-neutral)' }}>
        <div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Create New Post
          </h1>
          {company && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              for {company.name}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/posts')}
          className="text-white/60 hover:text-white/90 transition-colors"
          title="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* AI Generator Section - Part of Page */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)' }}
          >
            <Sparkles size={24} style={{ color: '#EAB308' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Generate with AI
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {currentStep === 1 && 'Choose your industry to get started'}
              {currentStep === 2 && 'Select the type of service you offer'}
              {currentStep === 3 && 'Select a template that fits your needs'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div
          className="inline-flex px-4 py-2 rounded-full mb-6 text-sm font-semibold"
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.2)',
            color: '#EAB308'
          }}
        >
          Step {currentStep} of 3
        </div>


          {/* STEP 1: Select Industry */}
          {!selectedIndustry && (
            <>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Select Your Industry
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(aiTemplateStructure).map(([key, industry]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedIndustry(key)}
                    className="p-4 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-neutral)'
                    }}
                  >
                    <div className="text-2xl mb-2">{industry.icon}</div>
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {industry.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {industry.description}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 2: Select Service Type */}
          {selectedIndustry && !selectedServiceType && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Select Service Type
                </h3>
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)'
                  }}
                >
                  ← Back
                </button>
              </div>
              <div className="mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {(aiTemplateStructure as any)[selectedIndustry].name}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
                {Object.entries((aiTemplateStructure as any)[selectedIndustry].serviceTypes || {}).map(([key, serviceType]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedServiceType(key)}
                    className="p-3 rounded-lg text-left transition-all hover:border-[#EAB308]"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-neutral)'
                    }}
                  >
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {serviceType.name}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {serviceType.description}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 3: Select Template - TWO COLUMN LAYOUT */}
          {selectedIndustry && selectedServiceType && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Select Template
                </h3>
                <button
                  onClick={() => {
                    setSelectedServiceType(null)
                    setSelectedGoal(null)
                    setSelectedTemplateId(null)
                  }}
                  className="text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)'
                  }}
                >
                  ← Back
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {(aiTemplateStructure as any)[selectedIndustry].name}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>→</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {(aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].name}
                </span>
                <span className="text-sm ml-auto">
                  <select
                    value={selectedGoal || ''}
                    onChange={(e) => setSelectedGoal(e.target.value || null)}
                    className="px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-neutral)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-neutral)'
                    }}
                  >
                    <option value="">All</option>
                    {Object.entries((aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals || {}).map(([key, goal]: [string, any]) => (
                      <option key={key} value={key}>
                        {goal.name.replace(/[🎁💡💰⚡🔨⚠️⭐📍📧🏆]/g, '').trim()}
                      </option>
                    ))}
                  </select>
                </span>
              </div>

              {/* Loading Indicator */}
              {isGeneratingAI && (
                <div className="mb-4 p-4 rounded-lg flex items-center justify-center gap-3" style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#EAB308' }} />
                  <span className="text-sm font-medium" style={{ color: '#EAB308' }}>
                    Generating your post...
                  </span>
                </div>
              )}

              {/* Two-Column Layout: Templates List + Detail Panel */}
              {!isGeneratingAI && (
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* LEFT: Template List (60%) */}
                  <div className="flex-1 lg:flex-[6]">
                    <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
                      {getTemplates().map((template: any) => {
                        const isSelected = selectedTemplateId === template.id
                        // Need to find the actual goal key for this template
                        const templateGoalKey = template.goalKey || selectedGoal || Object.keys((aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals || {}).find((goalKey: string) => {
                          const goal = (aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[goalKey]
                          return goal?.templates?.some((t: any) => t.id === template.id)
                        })
                        return (
                          <button
                            key={`${template.goalKey || 'all'}-${template.id}`}
                            onMouseEnter={() => setSelectedTemplateId(template.id)}
                            onClick={() => {
                              if (!templateGoalKey) {
                                toast.error('Unable to determine template goal')
                                return
                              }
                              generatePostContent(template.id, selectedIndustry!, selectedServiceType!, templateGoalKey)
                            }}
                            disabled={isGeneratingAI}
                            className="p-4 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between"
                            style={{
                              backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--input-bg)',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: isSelected ? '#EAB308' : 'var(--border-neutral)',
                              boxShadow: isSelected ? '0 0 0 1px #EAB308, 0 2px 8px rgba(234, 179, 8, 0.2)' : 'none',
                              minHeight: '180px'
                            }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">{template.icon}</span>
                                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {template.name}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {template.prompt}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* RIGHT: Template Detail Panel (40%) */}
                  <div className="flex-1 lg:flex-[4]">
                    {selectedTemplateId ? (
                      (() => {
                        const templates = getTemplates()
                        const template = templates.find((t: any) => t.id === selectedTemplateId)
                        if (!template) return null
                        
                        // Find the goal key for this template
                        const templateGoalKey = template.goalKey || selectedGoal || Object.keys((aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals || {}).find((goalKey: string) => {
                          const goal = (aiTemplateStructure as any)[selectedIndustry].serviceTypes[selectedServiceType].goals[goalKey]
                          return goal?.templates?.some((t: any) => t.id === template.id)
                        })
                        if (!templateGoalKey) return null
                        
                        const companyName = company?.name || 'Your Company'
                        const samplePrompt = template.prompt.replace('{company}', companyName)
                        
                        return (
                          <div className="sticky top-0 p-4 rounded-lg" style={{
                            backgroundColor: 'var(--input-bg)',
                            border: '2px solid #EAB308'
                          }}>
                            {/* Template Header */}
                            <div className="flex items-start gap-2.5 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-neutral)' }}>
                              <span className="text-2xl">{template.icon}</span>
                              <div className="flex-1">
                                <h3 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                  {template.name}
                                </h3>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  Click to generate your post
                                </p>
                              </div>
                            </div>

                            {/* Template Preview */}
                            <div className="mb-3">
                              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Template Preview
                              </div>
                              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-neutral)' }}>
                                <p className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                  {samplePrompt}
                                </p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() => generatePostContent(template.id, selectedIndustry!, selectedServiceType!, templateGoalKey)}
                              disabled={isGeneratingAI || !selectedCompanyId || !groupId}
                              className="w-full h-10 rounded-lg font-medium text-sm transition-all disabled:opacity-50 hover:opacity-90"
                              style={{
                                backgroundColor: '#EAB308',
                                color: '#000000'
                              }}
                            >
                              Generate Post
                            </button>
                          </div>
                        )
                      })()
                    ) : (
                      <div className="p-4 rounded-lg border-2 border-dashed flex items-center justify-center h-full" style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-neutral)'
                      }}>
                        <div className="text-center">
                          <span className="text-3xl mb-2 block">👈</span>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Hover over a template to see details
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  )
}
