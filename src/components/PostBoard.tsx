import type { Post, PostStatus } from '../types/database'
import { Users, FileText, CheckCircle, Send, Award, Users2 } from 'lucide-react'

interface PostBoardProps {
  posts: Post[]
  onStatusChange: (postId: string, status: PostStatus) => void
}

const columns: { status: PostStatus; title: string; color: string; bgColor: string; icon: any }[] = [
  { status: 'draft', title: 'Draft', color: 'var(--industrial-silver)', bgColor: 'bg-[var(--concrete-gray)]', icon: FileText },
  { status: 'ready_to_post', title: 'Ready to Post', color: 'var(--steel-blue)', bgColor: 'bg-[var(--concrete-gray)]', icon: CheckCircle },
  { status: 'posted', title: 'Posted', color: 'var(--success-green)', bgColor: 'bg-[var(--concrete-gray)]', icon: Send },
  { status: 'leads_collected', title: 'Leads Collected', color: 'var(--equipment-yellow)', bgColor: 'bg-[var(--concrete-gray)]', icon: Award },
]

const postTypeLabels: Record<string, string> = {
  value_post: 'Value Post',
  feature_friday: 'Feature Friday',
  diy_guide: 'DIY Guide',
  cost_saver: 'Cost Saver',
  warning_post: 'Warning Post',
  quick_tip: 'Quick Tip',
  local_alert: 'Local Alert',
  myth_buster: 'Myth Buster',
}

export default function PostBoard({ posts, onStatusChange }: PostBoardProps) {
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.dataTransfer.setData('postId', postId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: PostStatus) => {
    e.preventDefault()
    const postId = e.dataTransfer.getData('postId')
    onStatusChange(postId, status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {columns.map((column) => {
        const columnPosts = posts.filter((post) => post.status === column.status)
        const Icon = column.icon
        
        return (
          <div
            key={column.status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
            className="bg-[var(--concrete-gray)] rounded-lg border border-[var(--border-neutral)] p-4"
            style={{ boxShadow: `inset 4px 0 0 0 ${column.color}` }}
          >
            <div className="sticky top-0 z-10 -mx-4 px-4 pt-2 pb-3 mb-3 bg-[var(--concrete-gray)] border-b border-[var(--border-neutral)]/60">
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: column.color }} />
                <h3 className="text-white font-bold text-[12px] tracking-wide uppercase">{column.title}</h3>
                <span className="ml-auto text-[11px] text-white/60 border border-[var(--border-neutral)] rounded px-1.5 py-0.5">{columnPosts.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {columnPosts.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  No posts yet. Create a post or drag one here.
                </div>
              ) : (
                columnPosts.map((post) => (
                  <div
                    key={post.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, post.id)}
                    className="bg-[var(--carbon-black)] rounded-lg border border-[var(--border-neutral)] p-3 cursor-move hover:border-[var(--steel-blue)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] px-2 py-0.5 rounded border border-[var(--border-neutral)] text-white/80">
                        {postTypeLabels[post.post_type]}
                      </span>
                      {post.leads_count > 0 && (
                        <div className="flex items-center gap-1 text-[var(--equipment-yellow)]">
                          <Users size={14} />
                          <span className="text-xs font-medium">{post.leads_count}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-white mb-1 line-clamp-2 text-[13px]">
                      {post.title}
                    </h4>
                    <p className="text-[12px] text-white/60 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[var(--border-neutral)]/60 space-y-1">
                      {post.company && (
                        <p className="text-[11px] text-white/45">
                          Company: {post.company.name}
                        </p>
                      )}
                      {post.group && (
                        <div className="flex items-center gap-1 text-[11px] text-white/60">
                          <Users2 size={12} className="text-[var(--steel-blue)]" />
                          <span>{post.group.name}</span>
                        </div>
                      )}
                      {post.posted_at && (
                        <p className="text-xs text-white/40">
                          Posted: {new Date(post.posted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}