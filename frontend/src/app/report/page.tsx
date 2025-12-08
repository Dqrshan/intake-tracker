'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// --- Icons ---
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)
const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
)

export default function Report() {
    const [meals, setMeals] = useState<any[]>([])
    const [medicines, setMedicines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week')
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch('/api/meal').then(r => r.json()),
            fetch('/api/medicine').then(r => r.json())
        ]).then(([mealsData, medsData]) => {
            setMeals(Array.isArray(mealsData) ? mealsData : [])
            setMedicines(Array.isArray(medsData) ? medsData : [])
            setLoading(false)
        })
    }, [])

    const filteredMeals = meals.filter(meal => {
        const date = new Date(meal.createdAt)
        const now = new Date()
        if (dateRange === 'today') return date.toDateString() === now.toDateString()
        if (dateRange === 'week') return date.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000
        return date.getMonth() === now.getMonth()
    })

    const averageCalories = Math.round(
        filteredMeals.reduce((acc, curr) => acc + curr.kcal, 0) / (filteredMeals.length || 1)
    )

    const downloadPDF = async () => {
        setGenerating(true)
        const element = document.getElementById('report-content')
        if (element) {
            const canvas = await html2canvas(element, { backgroundColor: '#000000' })
            const pdf = new jsPDF()
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
            pdf.save('health-report.pdf')
        }
        setGenerating(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#2C2C2E] border-t-[#0A84FF] rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white pb-28">
            <header className="px-5 pt-12 pb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Report</h1>
                <button
                    onClick={downloadPDF} disabled={generating}
                    className="w-9 h-9 bg-[#2C2C2E] rounded-full flex items-center justify-center text-[#0A84FF] active:bg-[#3A3A3C]"
                >
                    <DownloadIcon />
                </button>
            </header>

            <main className="px-5 space-y-4" id="report-content">
                {/* Date Filter */}
                <div className="bg-[#1C1C1E] p-1 rounded-xl flex mb-6">
                    {['today', 'week', 'month'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range as any)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${dateRange === range ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93]'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="ios-card p-4">
                        <p className="text-[#8E8E93] text-xs font-semibold uppercase mb-1">Avg Calories</p>
                        <p className="text-2xl font-bold">{averageCalories}</p>
                        <p className="text-xs text-[#8E8E93] mt-1">per meal</p>
                    </div>
                    <div className="ios-card p-4">
                        <p className="text-[#8E8E93] text-xs font-semibold uppercase mb-1">Total Meals</p>
                        <p className="text-2xl font-bold">{filteredMeals.length}</p>
                        <p className="text-xs text-[#8E8E93] mt-1">in range</p>
                    </div>
                </div>

                {/* Insights */}
                <div className="ios-card p-5">
                    <h3 className="font-bold mb-4">AI Insights</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full bg-[#0A84FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-[#0A84FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Protein Intake</p>
                                <p className="text-xs text-[#8E8E93] leading-relaxed">Your protein intake averages {Math.round(filteredMeals.reduce((a, c) => a + c.protein_g, 0) / filteredMeals.length || 0)}g per meal. Consider increasing slightly for better muscle maintenance.</p>
                            </div>
                        </div>
                        <div className="border-t border-[#2C2C2E]"></div>
                        <div className="flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-full bg-[#30D158]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-[#30D158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Medicine Adherence</p>
                                <p className="text-xs text-[#8E8E93] leading-relaxed">You have maintained consistent medication logging this week. Great job staying on track!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full bottom-nav pb-safe pt-2 px-6 z-30">
                <div className="flex justify-between items-center h-14">
                    <Link href="/" className="flex flex-col items-center gap-1 w-16 text-[#8E8E93] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3.5 13.5L12 5l8.5 8.5V20a1 1 0 0 1-1 1h-5v-5h-5v5h-5a1 1 0 0 1-1-1v-6.5z" />
                        </svg>
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>

                    <Link href="/meds" className="flex flex-col items-center gap-1 w-16 text-[#8E8E93] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 9h-2V8h2v4zm4 0h-2V8h2v4z" />
                        </svg>
                        <span className="text-[10px] font-medium">Meds</span>
                    </Link>

                    <div className="relative -top-5">
                        <Link href="/capture" className="w-14 h-14 bg-[#0A84FF] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-transform border-[4px] border-black">
                            <PlusIcon />
                        </Link>
                    </div>

                    <Link href="/report" className="flex flex-col items-center gap-1 w-16 text-[#0A84FF]">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-3h2v3zm0-5h-2v-2h2v2zm4 5h-2V7h2v10z" />
                        </svg>
                        <span className="text-[10px] font-medium">Report</span>
                    </Link>

                    <Link href="/settings" className="flex flex-col items-center gap-1 w-16 text-[#8E8E93] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                        </svg>
                        <span className="text-[10px] font-medium">Settings</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}