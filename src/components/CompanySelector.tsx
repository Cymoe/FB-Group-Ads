import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, Plus, Building2 } from 'lucide-react'
import type { Company } from '../types/database'

interface CompanySelectorProps {
  companies: Company[]
  selectedCompanyId: string | null
  onSelectCompany: (companyId: string | null) => void
  onAddCompany: () => void
  isDarkMode?: boolean
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onAddCompany,
  isDarkMode = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [recentCompanies, setRecentCompanies] = useState<string[]>([])
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Load recent companies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCompanies')
    if (saved) {
      try {
        setRecentCompanies(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent companies:', e)
      }
    }
  }, [])

  // Save to recent companies when selection changes
  useEffect(() => {
    if (selectedCompanyId) {
      setRecentCompanies(prev => {
        const updated = [selectedCompanyId, ...prev.filter(id => id !== selectedCompanyId)].slice(0, 3)
        localStorage.setItem('recentCompanies', JSON.stringify(updated))
        return updated
      })
    }
  }, [selectedCompanyId])

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.service_type && company.service_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get recent companies that exist in current companies list
  const validRecentCompanies = recentCompanies
    .map(id => companies.find(c => c.id === id))
    .filter(Boolean) as Company[]

  // Create options list for keyboard navigation
  // Note: Removed "Show All Groups" for multi-tenant scalability
  const allOptions = [
    ...validRecentCompanies.map(c => ({ type: 'recent', id: c.id, company: c })),
    ...filteredCompanies
      .filter(c => !recentCompanies.includes(c.id))
      .map(c => ({ type: 'company', id: c.id, company: c })),
    { type: 'add-company', id: 'add', label: 'Add Company' }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        buttonRef.current?.focus()
        break
      
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev < allOptions.length - 1 ? prev + 1 : 0))
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : allOptions.length - 1))
        break
      
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < allOptions.length) {
          const option = allOptions[focusedIndex]
          if (option.type === 'add-company') {
            onAddCompany()
          } else {
            onSelectCompany(option.id)
          }
          setIsOpen(false)
          setSearchTerm('')
          setFocusedIndex(-1)
        }
        break
    }
  }

  const selectedCompany = selectedCompanyId ? companies.find(c => c.id === selectedCompanyId) : null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button - Minimal integrated style */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 rounded text-sm font-normal focus:outline-none transition-all flex items-center justify-between h-10 hover:bg-white/5"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-neutral)'
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 flex-1 text-left min-w-0">
          <Building2 size={14} style={{ color: 'var(--steel-blue)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            {selectedCompany ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {selectedCompany.name}
                </span>
                <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {selectedCompany.service_type}
                </span>
              </div>
            ) : (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select company...</span>
            )}
          </div>
        </div>
        <ChevronDown 
          size={14} 
          className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        />
      </button>
      
      {/* Dropdown Menu - Sleek minimal design */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded shadow-2xl z-50 max-h-80 overflow-hidden" 
          style={{ 
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            border: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB',
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Search Input - Clean minimal style */}
          <div className="p-3 space-y-2 border-b" style={{ borderColor: isDarkMode ? '#333333' : '#E5E7EB' }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setFocusedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="w-full h-8 pl-9 pr-3 rounded text-xs focus:outline-none transition-all"
                style={{ 
                  backgroundColor: 'transparent', 
                  color: 'var(--text-primary)',
                  border: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB'
                }}
              />
            </div>
            
            {/* Add Company Button - Minimal secondary action */}
            <button
              onClick={() => {
                onAddCompany()
                setIsOpen(false)
                setSearchTerm('')
                setFocusedIndex(-1)
              }}
              className="w-full px-3 py-1.5 text-xs rounded transition-all flex items-center gap-2"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: isDarkMode ? '1px solid #333333' : '1px solid #E5E7EB'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Plus size={12} style={{ color: 'var(--text-secondary)' }} />
              <span>Add Company</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Removed "Show All Groups" for multi-tenant scalability */}

            {/* Recent Companies Section - Only show when NOT searching */}
            {validRecentCompanies.length > 0 && searchTerm === '' && (
              <div className="px-3 py-2">
                <div className="space-y-0.5">
                  {validRecentCompanies.map((company, index) => {
                    const optionIndex = index
                    const isSelected = selectedCompanyId === company.id
                    return (
                      <button
                        key={`recent-${company.id}`}
                        onClick={() => {
                          onSelectCompany(company.id)
                          setIsOpen(false)
                          setSearchTerm('')
                          setFocusedIndex(-1)
                        }}
                        className="w-full px-2 py-2 text-left text-xs transition-all flex items-center gap-2 rounded"
                        style={{
                          backgroundColor: isSelected ? 'var(--steel-blue)/10' : (focusedIndex === optionIndex ? (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent'),
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <Building2 size={12} style={{ color: isSelected ? 'var(--steel-blue)' : 'var(--text-secondary)' }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{company.name}</div>
                        </div>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--steel-blue)' }}></div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Companies Section - Minimal design */}
            {/* When searching, show ALL filtered companies. When not searching, exclude recent ones. */}
            {filteredCompanies.filter(c => searchTerm !== '' || !recentCompanies.includes(c.id)).length > 0 && (
              <div className="px-3 pb-2">
                {validRecentCompanies.length > 0 && searchTerm === '' && (
                  <div className="text-xs font-medium mb-2 mt-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                    All Companies
                  </div>
                )}
                <div className="space-y-0.5">
                  {filteredCompanies
                    .filter(c => searchTerm !== '' || !recentCompanies.includes(c.id))
                    .map((company, index) => {
                      const optionIndex = validRecentCompanies.length + index
                      const isSelected = selectedCompanyId === company.id
                      return (
                        <button
                          key={company.id}
                          onClick={() => {
                            onSelectCompany(company.id)
                            setIsOpen(false)
                            setSearchTerm('')
                            setFocusedIndex(-1)
                          }}
                          className="w-full px-2 py-2 text-left text-xs transition-all flex items-center gap-2 rounded"
                          style={{
                            backgroundColor: isSelected ? 'var(--steel-blue)/10' : (focusedIndex === optionIndex ? (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent'),
                            color: 'var(--text-primary)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <Building2 size={12} style={{ color: isSelected ? 'var(--steel-blue)' : 'var(--text-secondary)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{company.name}</div>
                          </div>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--steel-blue)' }}></div>
                          )}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}


            {/* Empty State - Minimal */}
            {filteredCompanies.length === 0 && searchTerm && (
              <div className="px-4 py-8 text-center">
                <Search size={16} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                <div className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>No companies found</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Try a different search</div>
              </div>
            )}

            {companies.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Building2 size={16} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                <div className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>No companies yet</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add your first company</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
