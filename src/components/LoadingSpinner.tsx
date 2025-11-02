import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full`}
          style={{ borderColor: 'var(--border-neutral)' }}
        />
        <div 
          className={`${sizeClasses[size]} border-[#336699] border-t-transparent rounded-full animate-spin absolute top-0 left-0`}
        />
      </div>
      {text && (
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {text}
        </div>
      )}
    </div>
  )
}

export const InlineSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3 border-2',
    md: 'w-4 h-4 border-2'
  }

  return (
    <div className="inline-flex items-center justify-center">
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full`}
          style={{ borderColor: 'var(--border-neutral)' }}
        />
        <div 
          className={`${sizeClasses[size]} border-[#336699] border-t-transparent rounded-full animate-spin absolute top-0 left-0`}
        />
      </div>
    </div>
  )
}

