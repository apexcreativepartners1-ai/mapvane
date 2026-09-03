'use server'

export interface ReviewContext {
  id: string
  authorName: string
  rating: number
  content: string
}

export interface GeneratedDraftResult {
  reviewId: string
  draft: string
  sentimentDetected: 'positive' | 'neutral' | 'negative' | 'frustrated'
}

const SYSTEM_PROMPT = `You are an elite customer experience manager for multi-location enterprises. 
Analyze the customer's sentiment, emotion, rating, and intent from their review content.
Generate a tailored, empathetic, professional response (40-60 words max).
Rules:
1. Address negative/frustrated reviews with deep empathy, zero defensiveness, and direct contact avenues.
2. Address positive reviews with warm gratitude and brand appreciation.
3. Keep tone natural, concise, and human. Do NOT use generic robotic corporate templates.`

// Single Review AI Generator
export async function generateSingleAIReply(review: ReviewContext): Promise<GeneratedDraftResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set in environment variables. Falling back to static draft.')
    return {
      reviewId: review.id,
      draft: `Hi ${review.authorName}, thank you for taking the time to leave us a review!`,
      sentimentDetected: review.rating <= 2 ? 'frustrated' : review.rating === 3 ? 'neutral' : 'positive',
    }
  }

  const userPrompt = `Reviewer: ${review.authorName}
Rating: ${review.rating}/5 Stars
Review: "${review.content}"`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('OpenAI API Call Failed:', errorData)
      throw new Error(`OpenAI request failed with status ${res.status}`)
    }

    const data = await res.json()
    const draft = data.choices?.[0]?.message?.content?.trim() || ''

    return {
      reviewId: review.id,
      draft,
      sentimentDetected: review.rating <= 2 ? 'frustrated' : review.rating === 3 ? 'neutral' : 'positive',
    }
  } catch (error) {
    console.error('AI Single Generation Error:', error)
    return {
      reviewId: review.id,
      draft: `Hi ${review.authorName}, thank you for reaching out and sharing your feedback!`,
      sentimentDetected: review.rating <= 2 ? 'frustrated' : 'neutral',
    }
  }
}

// Parallel Bulk Review AI Generator
export async function generateBulkAIReplies(reviews: ReviewContext[]): Promise<GeneratedDraftResult[]> {
  const draftPromises = reviews.map((review) => generateSingleAIReply(review))
  return Promise.all(draftPromises)
}