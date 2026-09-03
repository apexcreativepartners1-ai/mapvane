'use server'

export interface ReviewContext {
  id: string
  authorName: string
  rating: number
  content: string
}

export type ReplyTone = 'professional' | 'friendly' | 'apologetic' | 'short'

export interface SingleReplyInput extends ReviewContext {
  tone?: ReplyTone
}

export interface GeneratedDraftResult {
  reviewId: string
  draft: string
  sentimentDetected: 'positive' | 'neutral' | 'negative' | 'frustrated'
}

const SYSTEM_PROMPT = `You are an elite customer experience manager for multi-location enterprises. 
Analyze the customer's sentiment, emotion, rating, and intent from their review content.
Generate a tailored, empathetic response (40-60 words max).

Rules:
1. Address negative/frustrated reviews with deep empathy, zero defensiveness, and direct contact avenues.
2. Address positive reviews with warm gratitude and brand appreciation.
3. Keep tone natural, concise, and human. Do NOT use generic robotic corporate templates.
4. LEGAL SAFEGUARD: NEVER admit legal fault, liability, or negligence under any circumstances.`

const toneInstructions: Record<ReplyTone, string> = {
  professional: 'Tone: Formal, highly polished, and professional.',
  friendly: 'Tone: Warm, enthusiastic, and highly personable.',
  apologetic: 'Tone: Deeply empathetic, humble, and solution-oriented.',
  short: 'Tone: Direct and concise (target 20-30 words max).',
}

// Single Review AI Generator
export async function generateSingleAIReply({
  id,
  authorName,
  rating,
  content,
  tone = 'professional',
}: SingleReplyInput): Promise<GeneratedDraftResult> {
  // Construct dynamic instruction combining Tone and Negative Review Legal Safeguard
  const dynamicInstructions = `Tone Guidelines: ${toneInstructions[tone]} ${
    rating <= 2
      ? 'Note: This is a negative review. Acknowledge their concern without admitting legal fault.'
      : ''
  }`

  const fullSystemInstruction = `${SYSTEM_PROMPT}\n\n${dynamicInstructions}`
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set in environment variables. Falling back to static draft.')
    return {
      reviewId: id,
      draft: `Hi ${authorName}, thank you for taking the time to leave us a review!`,
      sentimentDetected: rating <= 2 ? 'frustrated' : rating === 3 ? 'neutral' : 'positive',
    }
  }

  const userPrompt = `Reviewer: ${authorName}
Rating: ${rating}/5 Stars
Review: "${content}"`

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
          { role: 'system', content: fullSystemInstruction },
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
      reviewId: id,
      draft,
      sentimentDetected: rating <= 2 ? 'frustrated' : rating === 3 ? 'neutral' : 'positive',
    }
  } catch (error) {
    console.error('AI Single Generation Error:', error)
    return {
      reviewId: id,
      draft: `Hi ${authorName}, thank you for reaching out and sharing your feedback!`,
      sentimentDetected: rating <= 2 ? 'frustrated' : 'neutral',
    }
  }
}

// Parallel Bulk Review AI Generator
export async function generateBulkAIReplies(reviews: ReviewContext[]): Promise<GeneratedDraftResult[]> {
  const draftPromises = reviews.map((review) => generateSingleAIReply(review))
  return Promise.all(draftPromises)
}