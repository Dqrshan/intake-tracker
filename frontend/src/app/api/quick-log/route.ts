import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { description, weight_g } = body

        if (!description) {
            return NextResponse.json({ error: 'No description provided' }, { status: 400 })
        }

        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001'

        try {
            const response = await fetch(`${mlServiceUrl}/quick-log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description, weight_g }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || `AI service error: ${response.status}`)
            }

            const result = await response.json()
            return NextResponse.json(result)
        } catch (error: any) {
            console.error('Quick log error:', error)
            return NextResponse.json({
                error: error.message || 'Quick log service unavailable'
            }, { status: 503 })
        }
    } catch (error) {
        console.error('Quick log error:', error)
        return NextResponse.json({ error: 'Quick log failed' }, { status: 500 })
    }
}
