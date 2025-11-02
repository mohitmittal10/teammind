'use server'

import { prisma } from '@/lib/prisma'
import { generateCardEnrichment } from '@/lib/ai'
import { auth } from '@/app/api/auth/[...nextauth]/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const cardSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  access: z.enum(['PUBLIC', 'PRIVATE']),
})

export async function createCard(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    access: formData.get('access') as 'PUBLIC' | 'PRIVATE',
  }

  const validated = cardSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: 'Invalid input data' }
  }

  const { title, content, access } = validated.data

  try {
    // Get existing cards for AI to find related ones
    const existingCards = await prisma.knowledgeCard.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      },
      take: 20,
    })

    // Generate AI enrichment
    const aiContent = await generateCardEnrichment(
      title,
      content,
      existingCards
    )

    // Create card
    const card = await prisma.knowledgeCard.create({
      data: {
        title,
        content,
        summary: aiContent.summary,
        tags: aiContent.tags,
        relatedCards: aiContent.relatedCards,
        access,
        createdBy: session.user.id,
        teamId: session.user.teamId,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/team')

    return { success: true, card }
  } catch (error) {
    console.error('Error creating card:', error)
    return { error: 'Failed to create card' }
  }
}

export async function updateCard(cardId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    access: formData.get('access') as 'PUBLIC' | 'PRIVATE',
  }

  const validated = cardSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: 'Invalid input data' }
  }

  // Check ownership
  const existingCard = await prisma.knowledgeCard.findUnique({
    where: { id: cardId },
  })

  if (!existingCard || existingCard.createdBy !== session.user.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get existing cards for AI
    const existingCards = await prisma.knowledgeCard.findMany({
      where: { id: { not: cardId } },
      select: {
        id: true,
        title: true,
        content: true,
      },
      take: 20,
    })

    // Generate AI enrichment
    const aiContent = await generateCardEnrichment(
      rawData.title,
      rawData.content,
      existingCards
    )

    // Update card
    const card = await prisma.knowledgeCard.update({
      where: { id: cardId },
      data: {
        title: rawData.title,
        content: rawData.content,
        summary: aiContent.summary,
        tags: aiContent.tags,
        relatedCards: aiContent.relatedCards,
        access: rawData.access,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/team')

    return { success: true, card }
  } catch (error) {
    console.error('Error updating card:', error)
    return { error: 'Failed to update card' }
  }
}

export async function deleteCard(cardId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  // Check ownership
  const card = await prisma.knowledgeCard.findUnique({
    where: { id: cardId },
  })

  if (!card || card.createdBy !== session.user.id) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.knowledgeCard.delete({
      where: { id: cardId },
    })

    revalidatePath('/dashboard')
    revalidatePath('/team')

    return { success: true }
  } catch (error) {
    console.error('Error deleting card:', error)
    return { error: 'Failed to delete card' }
  }
}

