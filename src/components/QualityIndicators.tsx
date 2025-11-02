import React from 'react'
import { TrendingUp, MessageCircle, Clock, CheckCircle, Calendar, Sparkles } from 'lucide-react'
import type { GlobalGroup } from '../types/database'

interface QualityIndicatorsProps {
  group: GlobalGroup
  variant?: 'compact' | 'detailed'
}

export const QualityIndicators: React.FC<QualityIndicatorsProps> = ({ group, variant = 'compact' }) => {
  const indicators = group.quality_indicators

  if (!indicators) return null

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {/* Engagement Rate */}
        {indicators.engagement_rate && (
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981'
            }}
          >
            <TrendingUp size={10} />
            <span>{indicators.engagement_rate}% engagement</span>
          </div>
        )}

        {/* Business Friendly */}
        {indicators.business_friendly && (
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6'
            }}
          >
            <CheckCircle size={10} />
            <span>Business-friendly</span>
          </div>
        )}

        {/* Active Businesses */}
        {indicators.active_businesses_count && indicators.active_businesses_count > 10 && (
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ 
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              color: '#EAB308'
            }}
          >
            <Sparkles size={10} />
            <span>{indicators.active_businesses_count} businesses</span>
          </div>
        )}

        {/* Admin Response Time */}
        {indicators.admin_response_time && (
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8B5CF6'
            }}
          >
            <Clock size={10} />
            <span>{indicators.admin_response_time}</span>
          </div>
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          📊 Performance Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {indicators.engagement_rate && (
            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} style={{ color: '#10B981' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Engagement Rate</span>
              </div>
              <div className="text-lg font-bold" style={{ color: '#10B981' }}>
                {indicators.engagement_rate}%
              </div>
            </div>
          )}

          {indicators.avg_comments_per_post && (
            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={14} style={{ color: '#3B82F6' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Avg Comments</span>
              </div>
              <div className="text-lg font-bold" style={{ color: '#3B82F6' }}>
                {indicators.avg_comments_per_post}
              </div>
            </div>
          )}

          {indicators.response_rate && (
            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} style={{ color: '#EAB308' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Response Rate</span>
              </div>
              <div className="text-lg font-bold" style={{ color: '#EAB308' }}>
                {indicators.response_rate}%
              </div>
            </div>
          )}

          {indicators.active_businesses_count !== undefined && (
            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: '#8B5CF6' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Active Businesses</span>
              </div>
              <div className="text-lg font-bold" style={{ color: '#8B5CF6' }}>
                {indicators.active_businesses_count}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Best Posting Times */}
      {indicators.best_posting_times && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            ⏰ Best Times to Post
          </h4>
          <div className="p-3 rounded" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-neutral)' }}>
            <div className="flex items-start gap-2">
              <Calendar size={16} style={{ color: '#3B82F6', marginTop: '2px' }} />
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {indicators.best_posting_times.days.join(', ')}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {indicators.best_posting_times.hours}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Rules */}
      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          📋 Group Guidelines
        </h4>
        <div className="space-y-2">
          {indicators.business_friendly !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle 
                size={16} 
                style={{ color: indicators.business_friendly ? '#10B981' : '#EF4444' }} 
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                {indicators.business_friendly ? 'Business-friendly admin' : 'Strict business posting rules'}
              </span>
            </div>
          )}

          {indicators.posting_limit && (
            <div className="flex items-start gap-2 text-sm">
              <div style={{ color: '#3B82F6', marginTop: '2px' }}>⚠️</div>
              <div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Posting Limit: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{indicators.posting_limit}</span>
              </div>
            </div>
          )}

          {indicators.admin_response_time && (
            <div className="flex items-start gap-2 text-sm">
              <Clock size={16} style={{ color: '#8B5CF6', marginTop: '2px' }} />
              <div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Admin responds: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{indicators.admin_response_time}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Preferences */}
      {indicators.content_preferences && indicators.content_preferences.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            ✨ What Works Best
          </h4>
          <div className="flex flex-wrap gap-2">
            {indicators.content_preferences.map((pref, index) => (
              <div 
                key={index}
                className="px-3 py-1.5 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981'
                }}
              >
                {pref}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

