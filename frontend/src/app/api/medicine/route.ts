import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const medicines = await prisma.medicine.findMany({
            include: {
                intakes: true
            },
            orderBy: {
                time: 'asc'
            }
        })

        // Transform to match the expected format
        const transformedMedicines = medicines.map(med => ({
            ...med,
            takenAt: med.intakes.map(intake => intake.takenAt.toISOString())
        }))

        return NextResponse.json(transformedMedicines)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json([], { status: 200 }) // Return empty array on error
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, dosage, time } = body

        const medicine = await prisma.medicine.create({
            data: {
                name,
                dosage,
                time
            },
            include: {
                intakes: true
            }
        })

        // Transform to match expected format
        const transformedMedicine = {
            ...medicine,
            takenAt: medicine.intakes.map(intake => intake.takenAt.toISOString())
        }

        return NextResponse.json(transformedMedicine)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to save medicine' }, { status: 500 })
    }
}