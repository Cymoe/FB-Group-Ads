import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../EnhancedApp'
import { Sun, Moon } from 'lucide-react'

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout, isAuthenticated } = useAuth()
  const { isDarkMode, toggleTheme } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="bg-[#EAB308] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#D97706] transition-colors"
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sidebar Footer Layout */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
      >
        <div className="w-10 h-10 bg-[#EAB308] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-black font-medium text-sm">
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-text)' }}>
            {user?.name || 'User'}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-secondary)' }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleTheme()
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun size={16} style={{ color: 'var(--sidebar-text-secondary)' }} />
          ) : (
            <Moon size={16} style={{ color: 'var(--sidebar-text-secondary)' }} />
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute bottom-full left-0 right-0 mb-2 rounded shadow-2xl z-[100] overflow-hidden"
          style={{ 
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--border-neutral)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/companies')
              }}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-primary)' }}
            >
              Manage Companies
            </button>
            
            <div className="my-1 border-t" style={{ borderColor: isDarkMode ? '#333333' : '#E5E7EB' }}></div>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-red-500/10 text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
