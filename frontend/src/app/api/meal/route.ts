import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const meals = await prisma.meal.findMany({
            where: {
                createdAt: {
                    gte: today
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(meals)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json([], { status: 200 }) // Return empty array on error
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, weight_g, kcal, protein_g, carbs_g, fat_g } = body

        const meal = await prisma.meal.create({
            data: {
                name,
                weight_g: parseInt(weight_g),
                kcal: parseInt(kcal),
                protein_g: parseInt(protein_g),
                carbs_g: parseInt(carbs_g),
                fat_g: parseInt(fat_g),
            }
        })

        return NextResponse.json(meal)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to save meal' }, { status: 500 })
    }
}