import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Heart, MessageCircle, Share2, Trophy, Loader2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function CommunityPage() {
  const { user } = useAuthStore()
  const [newPost, setNewPost] = useState('')
  const [commentInputs, setCommentInputs] = useState({})
  const qc = useQueryClient()

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => communityAPI.getPosts({ limit: 20 }).then(r => r.data),
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => communityAPI.getLeaderboard().then(r => r.data.leaderboard),
  })

  const postMutation = useMutation({
    mutationFn: () => communityAPI.createPost({ content: newPost }),
    onSuccess: () => { setNewPost(''); qc.invalidateQueries(['posts']); toast.success('Posted!') },
    onError: (e) => toast.error(e.response?.data?.error || 'Post failed'),
  })

  const likeMutation = useMutation({
    mutationFn: (id) => communityAPI.likePost(id),
    onSuccess: () => qc.invalidateQueries(['posts']),
  })

  const commentMutation = useMutation({
    mutationFn: ({ id, content }) => communityAPI.addComment(id, content),
    onSuccess: (_, { id }) => { setCommentInputs(p => ({ ...p, [id]: '' })); qc.invalidateQueries(['posts']) },
  })

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const MEDAL = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div className="mb-8 page-header"><h1>Community</h1><p>Connect, share wins, and grow together</p></div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Feed */}
        <div>
          {/* Post composer */}
          <div className="card mb-5">
            <textarea rows={3} className="input resize-none mb-3 text-sm" placeholder="Share a win, ask a question, or help someone out… ✨"
              value={newPost} onChange={e => setNewPost(e.target.value)} />
            <div className="flex justify-end">
              <button disabled={!newPost.trim() || postMutation.isPending} onClick={() => postMutation.mutate()} className="btn-primary text-sm flex items-center gap-2">
                {postMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-accent" /></div>
          ) : (
            postsData?.posts?.map(post => (
              <div key={post._id} className="card mb-4">
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent2/15 text-accent2/90 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials(post.authorId?.name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{post.authorId?.name || 'Anonymous'}</div>
                    <div className="text-xs text-slate-600">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 mb-3">
                  <button onClick={() => likeMutation.mutate(post._id)} className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors text-sm">
                    <Heart size={14} /> {post.likes?.length || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-accent transition-colors text-sm">
                    <MessageCircle size={14} /> {post.comments?.length || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-accent3 transition-colors text-sm">
                    <Share2 size={14} /> Share
                  </button>
                </div>

                {/* Comments */}
                {post.comments?.slice(-2).map((c, ci) => (
                  <div key={ci} className="flex items-start gap-2 mb-2 pl-3 border-l-2 border-border/50">
                    <div className="w-6 h-6 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {initials(c.authorId?.name)}
                    </div>
                    <p className="text-xs text-slate-400">{c.content}</p>
                  </div>
                ))}

                {/* Comment input */}
                <div className="flex gap-2 mt-3">
                  <input className="input flex-1 text-xs py-2" placeholder="Add a comment…"
                    value={commentInputs[post._id] || ''} onChange={e => setCommentInputs(p => ({ ...p, [post._id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && commentMutation.mutate({ id: post._id, content: commentInputs[post._id] })} />
                  <button onClick={() => commentMutation.mutate({ id: post._id, content: commentInputs[post._id] })} className="btn-outline text-xs px-3 py-2">→</button>
                </div>
              </div>
            ))
          )}
          {!postsData?.posts?.length && !isLoading && (
            <div className="text-center py-16 text-slate-600">No posts yet. Be the first to share! 🚀</div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card mb-5">
            <div className="flex items-center gap-2 mb-4"><Trophy size={16} className="text-accent4" /><span className="font-semibold">Leaderboard</span></div>
            {leaderboard?.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <span className="text-lg w-6 flex-shrink-0">{MEDAL[i] || '⭐'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                </div>
                <div className="font-mono text-sm text-accent font-bold">{u.points}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="font-semibold mb-4">📅 Events</div>
            {[
              { title: 'Resume Review Workshop', date: 'Mar 5', attendees: 48 },
              { title: 'Mock Interview Session', date: 'Mar 8', attendees: 32 },
              { title: 'System Design AMA', date: 'Mar 12', attendees: 91 },
            ].map(e => (
              <div key={e.title} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
                <div>
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-slate-600">{e.attendees} attending</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-accent mb-1">{e.date}</div>
                  <button className="btn-outline text-[10px] px-2 py-1">Join</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
