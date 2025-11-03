'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface DashboardFiltersProps {
  tags: string[]
}

export function DashboardFilters({ tags }: DashboardFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const tag = searchParams.get('tag')
    if (tag) params.set('tag', tag)
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams()
    const currentSearch = searchParams.get('search')
    if (currentSearch) params.set('search', currentSearch)
    if (tag !== searchParams.get('tag')) {
      params.set('tag', tag)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/dashboard')
    setSearch('')
  }

  const activeTag = searchParams.get('tag')

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
        {(search || activeTag) && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </form>

      {tags.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Filter by tags:</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}



