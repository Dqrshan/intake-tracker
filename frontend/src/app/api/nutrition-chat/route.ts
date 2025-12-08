import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, context } = body

        if (!message) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 })
        }

        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001'

        try {
            const response = await fetch(`${mlServiceUrl}/nutrition-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, context }),
            })

            if (!response.ok) {
                throw new Error(`AI service error: ${response.status}`)
            }

            const result = await response.json()
            return NextResponse.json(result)
        } catch (error) {
            console.error('AI service error:', error)
            return NextResponse.json({
                response: "I'm currently unable to process your request. Please try again later.",
                confidence: 0.5,
                urgency: 'low'
            })
        }
    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json({
            response: "An error occurred. Please try again.",
            confidence: 0.5,
            urgency: 'low'
        })
    }
}
