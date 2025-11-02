'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const commentSchema = z.object({
  text: z.string().min(1).max(1000),
})

export async function createComment(cardId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const text = formData.get('text') as string

  const validated = commentSchema.safeParse({ text })
  if (!validated.success) {
    return { error: 'Invalid comment text' }
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text: validated.data.text,
        cardId,
        createdBy: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/team')

    return { success: true, comment }
  } catch (error) {
    console.error('Error creating comment:', error)
    return { error: 'Failed to create comment' }
  }
}

export async function getComments(cardId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { cardId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, comments }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { error: 'Failed to fetch comments', comments: [] }
  }
}

