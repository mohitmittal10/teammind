import { redirect } from 'next/navigation'
import { auth } from '@/app/api/auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { getUserLikes } from '@/lib/actions/likes'
import { Card } from '@/components/Card'
import { CreateCardForm } from '@/components/CreateCardForm'
import { Navbar } from '@/components/Navbar'

export default async function TeamPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get all teams
  const teams = await prisma.team.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  // Get cards grouped by team with access control
  const teamCards: Record<string, any[]> = {}
  const teamCounts: Record<string, number> = {}

  for (const team of teams) {
    // For user's own team: show all cards (PUBLIC + PRIVATE)
    // For other teams: show only PUBLIC cards
    const where: any = {
      teamId: team.id,
    }

    if (team.id !== session.user.teamId) {
      where.access = 'PUBLIC'
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

    // Count all cards for each team (for display)
    const allCardsCount = await prisma.knowledgeCard.count({
      where: { teamId: team.id },
    })

    teamCards[team.id] = cards
    teamCounts[team.id] = allCardsCount
  }

  const userLikes = await getUserLikes(session.user.id)

  // Get user's team name
  const userTeam = teams.find((t) => t.id === session.user.teamId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team View</h1>
          <p className="mt-2 text-gray-600">
            View knowledge cards organized by team. Your team ({userTeam?.name}) shows
            all cards. Other teams show only public cards.
          </p>
        </div>

        <div className="mb-6">
          <CreateCardForm />
        </div>

        <div className="space-y-8">
          {teams.map((team) => {
            const cards = teamCards[team.id] || []
            const totalCount = teamCounts[team.id] || 0
            const isUserTeam = team.id === session.user.teamId

            return (
              <div key={team.id} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {team.name}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {totalCount} {totalCount === 1 ? 'Card' : 'Cards'} Total
                    {isUserTeam && cards.length < totalCount && (
                      <span className="ml-2 text-yellow-600">
                        ({cards.length} visible, {totalCount - cards.length} private)
                      </span>
                    )}
                  </div>
                </div>

                {cards.length === 0 ? (
                  <p className="text-gray-500">No cards available.</p>
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
            )
          })}
        </div>
      </div>
    </div>
  )
}

