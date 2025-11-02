'use client'

import { useState, useTransition } from 'react'
import { createCard } from '@/lib/actions/cards'

export function CreateCardForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [access, setAccess] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('access', access)

    startTransition(async () => {
      const result = await createCard(formData)
      if (result?.success) {
        setTitle('')
        setContent('')
        setAccess('PUBLIC')
        setIsOpen(false)
        window.location.reload()
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center text-gray-600 transition-colors hover:border-blue-500 hover:bg-blue-50"
      >
        + Create New Knowledge Card
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold">Create Knowledge Card</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="access" className="block text-sm font-medium text-gray-700">
            Access
          </label>
          <select
            id="access"
            value={access}
            onChange={(e) => setAccess(e.target.value as 'PUBLIC' | 'PRIVATE')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Card'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setTitle('')
              setContent('')
            }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

