import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateHealthReport(data: {
    meals: Array<{ name: string; kcal: number; createdAt: Date }>
    medicines: Array<{ name: string; dosage: string; takenAt: string[] }>
    dateRange: { start: Date; end: Date }
}) {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()
    let yPosition = height - 50

    // Title
    page.drawText('Health Report', {
        x: 50,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
    })
    yPosition -= 40

    // Date range
    page.drawText(`Period: ${data.dateRange.start.toDateString()} - ${data.dateRange.end.toDateString()}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0.4, 0.4, 0.4),
    })
    yPosition -= 40

    // Meals section
    page.drawText('Meals Summary', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
    })
    yPosition -= 25

    const totalCalories = data.meals.reduce((sum, meal) => sum + meal.kcal, 0)
    page.drawText(`Total Calories: ${totalCalories} kcal`, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
    })
    yPosition -= 20

    data.meals.slice(0, 10).forEach((meal) => {
        page.drawText(`• ${meal.name} - ${meal.kcal} kcal`, {
            x: 70,
            y: yPosition,
            size: 10,
            font,
        })
        yPosition -= 15
    })

    yPosition -= 20

    // Medicine adherence
    page.drawText('Medicine Adherence', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
    })
    yPosition -= 25

    data.medicines.forEach((med) => {
        const adherenceRate = Math.round((med.takenAt.length / 7) * 100) // Assuming 7 days
        page.drawText(`• ${med.name} ${med.dosage} - ${adherenceRate}% adherence`, {
            x: 70,
            y: yPosition,
            size: 10,
            font,
        })
        yPosition -= 15
    })

    // Note: PDF encryption would require additional libraries
    // For now, the PDF is generated without encryption

    return await pdfDoc.save()
}