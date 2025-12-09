'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// --- Icons ---
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)

interface NutritionGoals {
    calories: number
    protein: number
    carbs: number
    fat: number
}

interface UserProfile {
    name: string
    age: number
    weight: number
    height: number
    activityLevel: string
    goal: string
}

export default function Settings() {
    const [goals, setGoals] = useState<NutritionGoals>({
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65
    })
    const [profile, setProfile] = useState<UserProfile>({
        name: '', age: 25, weight: 70, height: 170, activityLevel: 'moderate', goal: 'maintain'
    })
    const [notifications, setNotifications] = useState(true)
    const [darkMode, setDarkMode] = useState(true)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const installApp = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setDeferredPrompt(null)
        }
    }

    useEffect(() => {
        const savedGoals = localStorage.getItem('nutritionGoals')
        if (savedGoals) setGoals(JSON.parse(savedGoals))
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) setProfile(JSON.parse(savedProfile))
    }, [])

    const saveSettings = () => {
        localStorage.setItem('nutritionGoals', JSON.stringify(goals))
        localStorage.setItem('userProfile', JSON.stringify(profile))
        alert('Settings saved')
    }

    const clearData = () => {
        if (confirm('Clear all local data? This cannot be undone.')) {
            localStorage.clear()
            window.location.reload()
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pb-28">
            <header className="px-5 pt-12 pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </header>

            <main className="px-5 space-y-6">

                {/* Profile Section */}
                <div>
                    <h2 className="text-[#8E8E93] text-xs font-semibold uppercase ml-3 mb-2">Profile</h2>
                    <div className="ios-card overflow-hidden">
                        <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                            <span className="font-medium">Name</span>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Name"
                                className="bg-transparent text-right outline-none text-[#0A84FF] placeholder-[#636366] w-1/2 border-none"
                            />
                        </div>
                        <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                            <span className="font-medium">Weight (kg)</span>
                            <input
                                type="number"
                                value={profile.weight}
                                onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                                className="bg-transparent text-right outline-none text-[#0A84FF] w-20 border-none"
                            />
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <span className="font-medium">Height (cm)</span>
                            <input
                                type="number"
                                value={profile.height}
                                onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                                className="bg-transparent text-right outline-none text-[#0A84FF] w-20 border-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Goals Section */}
                <div>
                    <h2 className="text-[#8E8E93] text-xs font-semibold uppercase ml-3 mb-2">Nutrition Targets</h2>
                    <div className="ios-card overflow-hidden">
                        <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                            <span className="font-medium">Daily Calories</span>
                            <input
                                type="number"
                                value={goals.calories}
                                onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                                className="bg-transparent text-right outline-none text-[#0A84FF] w-24 border-none"
                            />
                        </div>
                        <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                            <span className="font-medium">Protein (g)</span>
                            <input
                                type="number"
                                value={goals.protein}
                                onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                                className="bg-transparent text-right outline-none text-[#0A84FF] w-24 border-none"
                            />
                        </div>
                        <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                            <span className="font-medium">Carbs (g)</span>
                            <input
                                type="number"
                                value={goals.carbs}
                                onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                                className="bg-transparent text-right outline-none text-[#0A84FF] w-24 border-none"
                            />
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <span className="font-medium">Fat (g)</span>
                            <input
                                type="number"
                                value={goals.fat}
                                onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                                className="bg-transparent text-right outline-none text-[#0A84FF] w-24 border-none"
                            />
                        </div>
                    </div>
                </div>

                {/* App Preferences */}
                <div>
                    <h2 className="text-[#8E8E93] text-xs font-semibold uppercase ml-3 mb-2">App</h2>
                    <div className="ios-card overflow-hidden">
                        {deferredPrompt && (
                            <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                                <span className="font-medium">Install App</span>
                                <button onClick={installApp} className="text-[#0A84FF] text-sm font-semibold">Install</button>
                            </div>
                        )}
                        <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                            <span className="font-medium">Notifications</span>
                            <div
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${notifications ? 'bg-[#30D158]' : 'bg-[#3A3A3C]'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <span className="font-medium text-[#FF453A]">Reset Data</span>
                            <button onClick={clearData} className="text-[#FF453A] text-sm font-semibold">Clear</button>
                        </div>
                    </div>
                </div>

                <button onClick={saveSettings} className="w-full btn-primary py-3.5 text-lg">Save Changes</button>

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

                    <Link href="/report" className="flex flex-col items-center gap-1 w-16 text-[#8E8E93] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2v-3h2v3zm0-5h-2v-2h2v2zm4 5h-2V7h2v10z" />
                        </svg>
                        <span className="text-[10px] font-medium">Report</span>
                    </Link>

                    <Link href="/settings" className="flex flex-col items-center gap-1 w-16 text-[#0A84FF]">
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
