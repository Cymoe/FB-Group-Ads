import React from 'react'
import type { Post } from '../types/database'

type Props = {
  post: Post
  theme: 'dark' | 'light'
}

export default function PostPreviewFacebook({ post, theme }: Props) {
  const companyName = post.company?.name || 'Your Company'
  const groupName = post.group?.name || 'Facebook Group'
  const avatar = companyName.charAt(0).toUpperCase()
  const dateStr = new Date(post.created_at).toLocaleDateString()
  const textColorPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const textColorSecondary = theme === 'dark' ? 'text-white/60' : 'text-gray-500'
  const cardBg = theme === 'dark' ? 'bg-[#333333] border-[#555555]' : 'bg-white border-[#E5E7EB]'
  const actionHover = theme === 'dark' ? 'hover:bg-[#2A2A2A]' : 'hover:bg-gray-100'

  return (
    <div className={`rounded-xl border ${cardBg} overflow-hidden`}>      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {avatar}
            </div>
            <div>
              <div className={`text-sm font-semibold ${textColorPrimary}`}>{companyName}</div>
              <div className={`text-xs ${textColorSecondary}`}>{dateStr} • {groupName}</div>
            </div>
          </div>
          <button className={`w-8 h-8 rounded-full flex items-center justify-center ${actionHover}`}>
            <span className={textColorSecondary}>⋯</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className={`font-semibold text-lg ${textColorPrimary}`}>{post.title}</div>
          <div className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{post.content}</div>
        </div>
      </div>

      <div className={`px-4 pb-2 ${textColorSecondary}`}>
        <div className="text-xs">👍 {post.likes} • 💬 {post.comments} • 📤 {post.shares}</div>
      </div>

      <div className={`grid grid-cols-3 text-center border-t ${theme === 'dark' ? 'border-[#555555]' : 'border-[#E5E7EB]'}`}>
        <button className={`py-2 text-sm font-medium ${textColorSecondary} ${actionHover}`}>Like</button>
        <button className={`py-2 text-sm font-medium ${textColorSecondary} ${actionHover}`}>Comment</button>
        <button className={`py-2 text-sm font-medium ${textColorSecondary} ${actionHover}`}>Share</button>
      </div>
    </div>
  )
}
