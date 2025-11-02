'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/lib/actions/likes'
import { deleteCard } from '@/lib/actions/cards'
import { createComment, getComments } from '@/lib/actions/comments'
import { useSession } from 'next-auth/react'

interface CardProps {
  card: {
    id: string
    title: string
    content: string
    summary?: string | null
    tags: string[]
    likes: number
    access: 'PUBLIC' | 'PRIVATE'
    createdAt: Date
    createdBy: string
    teamId: string
    team?: { name: string } | null
    creator?: { email: string; name?: string | null } | null
  }
  isLiked: boolean
  userLikes: string[]
}

export function Card({ card, isLiked: initialIsLiked, userLikes }: CardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(card.likes)
  const [isPending, startTransition] = useTransition()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const { data: session } = useSession()
  const isOwner = session?.user?.id === card.createdBy

  const handleLike = () => {
    const optimisticLiked = !isLiked
    const optimisticCount = optimisticLiked ? likesCount + 1 : likesCount - 1

    setIsLiked(optimisticLiked)
    setLikesCount(optimisticCount)

    startTransition(async () => {
      const result = await toggleLike(card.id)
      if (result?.error) {
        // Revert on error
        setIsLiked(isLiked)
        setLikesCount(likesCount)
      }
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return

    startTransition(async () => {
      const result = await deleteCard(card.id)
      if (result?.success) {
        window.location.reload()
      }
    })
  }

  const handleLoadComments = async () => {
    if (showComments) {
      setShowComments(false)
      return
    }

    setLoadingComments(true)
    const result = await getComments(card.id)
    if (result?.comments) {
      setComments(result.comments)
      setShowComments(true)
    }
    setLoadingComments(false)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const formData = new FormData()
    formData.append('text', commentText)

    startTransition(async () => {
      const result = await createComment(card.id, formData)
      if (result?.comment) {
        setComments([result.comment, ...comments])
        setCommentText('')
      }
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            {card.access === 'PRIVATE' && (
              <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                🔒 Private
              </span>
            )}
          </div>
          {card.summary && (
            <p className="mb-2 text-sm text-gray-600">{card.summary}</p>
          )}
          <p className="text-gray-700">{card.content}</p>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            title="Delete card"
          >
            Delete
          </button>
        )}
      </div>

      {card.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {card.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition-colors ${
              isLiked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            ❤️ {likesCount}
          </button>
          <button
            onClick={handleLoadComments}
            disabled={loadingComments}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            💬 {showComments ? 'Hide' : 'Comments'}
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {card.creator?.name || card.creator?.email || 'Unknown'} •{' '}
          {card.team?.name || 'Team'} • {new Date(card.createdAt).toLocaleDateString()}
        </div>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isPending || !commentText.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded bg-gray-50 p-3">
                <div className="mb-1 text-sm font-medium text-gray-900">
                  {comment.author?.name || comment.author?.email || 'Unknown'}
                </div>
                <div className="text-sm text-gray-700">{comment.text}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

