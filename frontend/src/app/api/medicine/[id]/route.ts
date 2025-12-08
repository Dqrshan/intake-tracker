import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Delete the medicine (intakes will be cascade deleted due to onDelete: Cascade)
        await prisma.medicine.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const medicine = await prisma.medicine.findUnique({
            where: { id },
            include: {
                intakes: true
            }
        })

        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
        }

        return NextResponse.json({
            ...medicine,
            takenAt: medicine.intakes.map(intake => intake.takenAt.toISOString())
        })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch medicine' }, { status: 500 })
    }
}
