import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const medicine = await prisma.medicine.findUnique({
            where: { id: params.id }
        })

        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
        }

        // Create a new intake record
        await prisma.medicineIntake.create({
            data: {
                medicineId: params.id
            }
        })

        // Return updated medicine with intakes
        const updatedMedicine = await prisma.medicine.findUnique({
            where: { id: params.id },
            include: {
                intakes: true
            }
        })

        // Transform to match expected format
        const transformedMedicine = {
            ...updatedMedicine,
            takenAt: updatedMedicine!.intakes.map(intake => intake.takenAt.toISOString())
        }

        return NextResponse.json(transformedMedicine)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 })
    }
}