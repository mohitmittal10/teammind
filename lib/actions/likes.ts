'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/auth'
import { revalidatePath } from 'next/cache'

export async function toggleLike(cardId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      // Decrement likes count
      await prisma.knowledgeCard.update({
        where: { id: cardId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      })

      revalidatePath('/dashboard')
      revalidatePath('/team')

      return { success: true, liked: false }
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          cardId,
        },
      })

      // Increment likes count
      await prisma.knowledgeCard.update({
        where: { id: cardId },
        data: {
          likes: {
            increment: 1,
          },
        },
      })

      revalidatePath('/dashboard')
      revalidatePath('/team')

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { error: 'Failed to toggle like' }
  }
}

export async function getUserLikes(userId: string): Promise<string[]> {
  const likes = await prisma.like.findMany({
    where: { userId },
    select: { cardId: true },
  })

  return likes.map((like) => like.cardId)
}

