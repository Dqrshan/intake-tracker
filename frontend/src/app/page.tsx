'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Chatbot from '@/components/Chatbot'

// --- Icons ---
const SunIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
)
const MoonIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
)
const CloudIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
)
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)
const ChevronRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

interface Meal {
    id: string
    name: string
    kcal: number
    protein_g: number
    carbs_g: number
    fat_g: number
    weight_g: number
    createdAt: string
}

interface Medicine {
    id: string
    name: string
    dosage: string
    time: string
    intakes: { id: string; takenAt: string }[]
}

interface NutritionGoals {
    calories: number
    protein: number
    carbs: number
    fat: number
}

export default function Dashboard() {
    const [meals, setMeals] = useState<Meal[]>([])
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [goals, setGoals] = useState<NutritionGoals>({
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65
    })

    useEffect(() => {
        const savedGoals = localStorage.getItem('nutritionGoals')
        if (savedGoals) setGoals(JSON.parse(savedGoals))

        Promise.all([
            fetch('/api/meal').then(r => r.json()).catch(() => []),
            fetch('/api/medicine').then(r => r.json()).catch(() => [])
        ]).then(([mealsData, medsData]) => {
            setMeals(Array.isArray(mealsData) ? mealsData : [])
            setMedicines(Array.isArray(medsData) ? medsData : [])
            setLoading(false)
        })

        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const totalCalories = meals.reduce((sum, meal) => sum + meal.kcal, 0)
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein_g, 0)
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs_g, 0)
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat_g, 0)

    const calorieProgress = Math.min(totalCalories / goals.calories, 1)

    const getGreeting = () => {
        const hour = currentTime.getHours()
        if (hour < 12) return { text: 'Good Morning', icon: <SunIcon className="w-5 h-5 text-yellow-500" /> }
        if (hour < 17) return { text: 'Good Afternoon', icon: <CloudIcon className="w-5 h-5 text-blue-400" /> }
        return { text: 'Good Evening', icon: <MoonIcon className="w-5 h-5 text-indigo-400" /> }
    }
    const greeting = getGreeting()

    const remainingCalories = Math.max(goals.calories - totalCalories, 0)

    // Next Medicine
    const nextMedicine = medicines.find(med => {
        const [hours, minutes] = med.time.split(':').map(Number)
        const medTime = new Date()
        medTime.setHours(hours, minutes, 0, 0)
        return medTime > currentTime
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#2C2C2E] border-t-[#0A84FF] rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white pb-28">
            {/* Header */}
            <header className="px-5 pt-12 pb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-[#8E8E93] text-sm font-medium mb-1">
                            {greeting.icon}
                            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">{greeting.text}</h1>
                    </div>
                </div>
            </header>

            <main className="px-5 space-y-6">

                {/* Main Calorie Card */}
                <div className="ios-card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[#8E8E93] text-sm font-medium mb-1">Calories Remaining</p>
                        <h2 className="text-4xl font-bold text-white tracking-tight">{remainingCalories}</h2>
                        <p className="text-sm mt-2 text-[#8E8E93]">
                            Goal: <span className="text-white font-semibold">{goals.calories}</span>
                        </p>
                    </div>
                    {/* Ring Chart */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" stroke="#2C2C2E" strokeWidth="10" fill="none" />
                            <circle
                                cx="50" cy="50" r="42"
                                stroke={calorieProgress >= 1 ? '#FF453A' : '#0A84FF'}
                                strokeWidth="10" fill="none" strokeLinecap="round"
                                strokeDasharray={`${calorieProgress * 264} 264`}
                            />
                        </svg>
                        <span className="absolute text-sm font-semibold">{Math.round(calorieProgress * 100)}%</span>
                    </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="ios-card p-4">
                        <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2">Protein</p>
                        <p className="text-xl font-bold text-[#30D158]">{totalProtein}g</p>
                        <div className="w-full bg-[#2C2C2E] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-[#30D158] h-full" style={{ width: `${Math.min(totalProtein / goals.protein * 100, 100)}%` }} />
                        </div>
                    </div>
                    <div className="ios-card p-4">
                        <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2">Carbs</p>
                        <p className="text-xl font-bold text-[#0A84FF]">{totalCarbs}g</p>
                        <div className="w-full bg-[#2C2C2E] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-[#0A84FF] h-full" style={{ width: `${Math.min(totalCarbs / goals.carbs * 100, 100)}%` }} />
                        </div>
                    </div>
                    <div className="ios-card p-4">
                        <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-2">Fat</p>
                        <p className="text-xl font-bold text-[#FF9F0A]">{totalFat}g</p>
                        <div className="w-full bg-[#2C2C2E] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-[#FF9F0A] h-full" style={{ width: `${Math.min(totalFat / goals.fat * 100, 100)}%` }} />
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Upcoming */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/meds" className="ios-card p-4 flex flex-col justify-between h-32 active:scale-95 transition-transform">
                        <div className="flex justify-between items-start">
                            <div className="w-8 h-8 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            {nextMedicine && <span className="text-[10px] font-bold bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">UPCOMING</span>}
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-xs font-semibold uppercase">Next Dose</p>
                            <p className="text-white font-semibold truncate mt-0.5">{nextMedicine ? `${nextMedicine.name} at ${nextMedicine.time}` : 'No upcoming'}</p>
                        </div>
                    </Link>

                    <Link href="/settings" className="ios-card p-4 flex flex-col justify-between h-32 active:scale-95 transition-transform">
                        <div className="w-8 h-8 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[#8E8E93] text-xs font-semibold uppercase">Settings</p>
                            <p className="text-white font-semibold mt-0.5">Edit Goals</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Meals List */}
                <div>
                    <h3 className="text-xl font-bold mb-4 px-1">Today&apos;s Meals</h3>
                    {meals.length === 0 ? (
                        <div className="ios-card p-8 flex flex-col items-center justify-center text-center">
                            <span className="text-[#8E8E93] mb-3">No meals logged yet</span>
                            <Link href="/capture" className="btn-primary px-6 py-2 text-sm">Log first meal</Link>
                        </div>
                    ) : (
                        <div className="ios-card overflow-hidden">
                            {meals.map((meal, index) => (
                                <div key={meal.id} className={`p-4 flex items-center justify-between ${index !== meals.length - 1 ? 'border-b border-[#2C2C2E]' : ''}`}>
                                    <div>
                                        <p className="font-semibold text-white">{meal.name}</p>
                                        <p className="text-xs text-[#8E8E93]">
                                            {new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {meal.weight_g ? ` · ${meal.weight_g}g` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-[#0A84FF]">{meal.kcal}</span>
                                        <span className="text-[#8E8E93] text-xs">kcal</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full bottom-nav pb-safe pt-2 px-6 z-30">
                <div className="flex justify-between items-center h-14">
                    <Link href="/" className="flex flex-col items-center gap-1 w-16 text-[#0A84FF]">
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
                            <PlusIcon className="w-7 h-7 text-white" />
                        </Link>
                    </div>

                    <Link href="/report" className="flex flex-col items-center gap-1 w-16 text-[#8E8E93] hover:text-white transition-colors">
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

            <Chatbot />
        </div>
    )
}