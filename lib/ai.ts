import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIGeneratedContent {
  summary: string
  tags: string[]
  relatedCards: string[]
}

export async function generateCardEnrichment(
  title: string,
  content: string,
  existingCards?: Array<{ id: string; title: string; content: string }>
): Promise<AIGeneratedContent> {
  try {
    const existingCardsText = existingCards
      ? existingCards.map((c) => `ID: ${c.id}\nTitle: ${c.title}\nContent: ${c.content.substring(0, 200)}...`).join('\n\n')
      : 'No existing cards available.'

    const prompt = `You are an AI assistant helping to enrich knowledge cards.

Given a knowledge card with:
Title: ${title}
Content: ${content}

Please provide:
1. A concise 2-3 sentence summary
2. 3-5 relevant tags (comma-separated, no hashtags)
3. Up to 3 related card IDs from the existing cards list (if any are similar), or empty array if none are related

Existing cards:
${existingCardsText}

Respond in this exact JSON format:
{
  "summary": "2-3 sentence summary here",
  "tags": ["tag1", "tag2", "tag3"],
  "relatedCards": ["cardId1", "cardId2"] // or [] if none
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const response = JSON.parse(
      completion.choices[0]?.message?.content || '{}'
    )

    return {
      summary: response.summary || 'AI-generated summary unavailable.',
      tags: Array.isArray(response.tags)
        ? response.tags.slice(0, 5)
        : response.tags?.split(',').map((t: string) => t.trim()).slice(0, 5) || [],
      relatedCards: Array.isArray(response.relatedCards)
        ? response.relatedCards.slice(0, 3)
        : [],
    }
  } catch (error) {
    console.error('AI generation error:', error)
    return {
      summary: 'AI-generated summary unavailable at this time.',
      tags: [],
      relatedCards: [],
    }
  }
}



