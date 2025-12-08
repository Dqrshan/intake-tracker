import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const image = formData.get('image') as File

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // Forward to Python ML service
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001'
        const mlFormData = new FormData()
        mlFormData.append('file', image)

        try {
            const response = await fetch(`${mlServiceUrl}/infer`, {
                method: 'POST',
                body: mlFormData,
            })

            if (!response.ok) {
                throw new Error(`ML service error: ${response.status}`)
            }

            const result = await response.json()

            // Validate that we have high-confidence results
            if (!result.dishes || result.dishes.length === 0) {
                return NextResponse.json({
                    error: 'No food detected with sufficient confidence'
                }, { status: 422 })
            }

            return NextResponse.json(result)
        } catch (error) {
            console.error('ML service error:', error)
            return NextResponse.json({
                error: 'Food analysis service unavailable. Please try again later.'
            }, { status: 503 })
        }
    } catch (error) {
        console.error('Inference error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}