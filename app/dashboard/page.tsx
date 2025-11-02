import { redirect } from 'next/navigation'
import { auth } from '@/app/api/auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { getUserLikes } from '@/lib/actions/likes'
import { Card } from '@/components/Card'
import { CreateCardForm } from '@/components/CreateCardForm'
import { Navbar } from '@/components/Navbar'
import { DashboardFilters } from '@/components/DashboardFilters'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { search?: string; tag?: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get all PUBLIC cards only
  const where: any = {
    access: 'PUBLIC',
  }
  const { search, tag } = searchParams;
  if (search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { content: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  if (searchParams.tag) {
    where.tags = { has: searchParams.tag }
  }

  const cards = await prisma.knowledgeCard.findMany({
    where,
    include: {
      team: {
        select: {
          name: true,
        },
      },
      creator: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const userLikes = await getUserLikes(session.user.id)

  // Get all unique tags from PUBLIC cards
  const allTags = await prisma.knowledgeCard.findMany({
    where: { access: 'PUBLIC' },
    select: { tags: true },
  })

  const uniqueTags = Array.from(
    new Set(allTags.flatMap((card) => card.tags))
  ).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View all public knowledge cards from all teams
          </p>
        </div>

        <DashboardFilters tags={uniqueTags} />

        <div className="mb-6">
          <CreateCardForm />
        </div>

        {cards.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No cards found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                isLiked={userLikes.includes(card.id)}
                userLikes={userLikes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

