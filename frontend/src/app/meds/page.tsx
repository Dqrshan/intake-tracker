'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// --- Icons ---
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)
const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)
const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
)

interface MedicineIntake {
    id: string
    takenAt: string
}

interface Medicine {
    id: string
    name: string
    dosage: string
    time: string
    intakes: MedicineIntake[]
}

export default function Meds() {
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [showContraindication, setShowContraindication] = useState(false)
    const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMedicines()
    }, [])

    const fetchMedicines = async () => {
        try {
            const response = await fetch('/api/medicine')
            const data = await response.json()
            setMedicines(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch medicines:', error)
            setMedicines([])
        } finally {
            setLoading(false)
        }
    }

    const takeMedicine = async (id: string) => {
        try {
            await fetch(`/api/medicine/${id}/take`, { method: 'PATCH' })
            await fetchMedicines()
        } catch (error) {
            console.error('Failed to take medicine:', error)
        }
    }

    const deleteMedicine = async (id: string) => {
        if (!confirm('Delete this medication?')) return
        try {
            await fetch(`/api/medicine/${id}`, { method: 'DELETE' })
            await fetchMedicines()
        } catch (error) {
            console.error('Failed to delete medicine:', error)
        }
    }

    const addMedicine = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newMed.name.toLowerCase().includes('atorvastatin')) {
            setShowContraindication(true)
            return
        }
        await saveMedicine()
    }

    const saveMedicine = async () => {
        try {
            await fetch('/api/medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMed),
            })
            setNewMed({ name: '', dosage: '', time: '' })
            setShowAddForm(false)
            await fetchMedicines()
        } catch (error) {
            console.error('Failed to add medicine:', error)
        }
    }

    const isTakenToday = (intakes: MedicineIntake[]) => {
        const today = new Date().toDateString()
        return intakes?.some(intake => new Date(intake.takenAt).toDateString() === today) ?? false
    }

    const sortedMedicines = [...medicines].sort((a, b) => a.time.localeCompare(b.time))

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
            <header className="px-5 pt-12 pb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Meds</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-9 h-9 bg-[#2C2C2E] rounded-full flex items-center justify-center text-[#0A84FF] active:bg-[#3A3A3C]"
                >
                    <PlusIcon />
                </button>
            </header>

            <main className="px-5 space-y-4">
                {sortedMedicines.length === 0 ? (
                    <div className="ios-card p-10 text-center flex flex-col items-center justify-center h-48">
                        <p className="text-[#8E8E93] mb-4">No medications added</p>
                        <button onClick={() => setShowAddForm(true)} className="btn-primary px-6 py-2">Add Medication</button>
                    </div>
                ) : (
                    <div className="ios-card overflow-hidden">
                        {sortedMedicines.map((med, index) => {
                            const taken = isTakenToday(med.intakes)
                            return (
                                <div
                                    key={med.id}
                                    className={`p-4 flex items-center justify-between ${index !== sortedMedicines.length - 1 ? 'border-b border-[#2C2C2E]' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => !taken && takeMedicine(med.id)}
                                            disabled={taken}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${taken ? 'bg-[#30D158] border-[#30D158]' : 'border-[#8E8E93]'
                                                }`}
                                        >
                                            {taken && <CheckIcon />}
                                        </button>
                                        <div>
                                            <p className={`font-semibold ${taken ? 'text-[#8E8E93] line-through' : 'text-white'}`}>{med.name}</p>
                                            <p className="text-xs text-[#8E8E93]">{med.dosage} · {med.time}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteMedicine(med.id)} className="text-[#8E8E93] hover:text-[#FF453A] p-2">
                                        <TrashIcon />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Add Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <form onSubmit={addMedicine} className="w-full sm:max-w-md bg-[#1C1C1E] rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">New Medication</h2>
                            <button type="button" onClick={() => setShowAddForm(false)} className="text-[#0A84FF] font-medium">Cancel</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-[#8E8E93] ml-1 mb-1 block">Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Aspirin"
                                    value={newMed.name}
                                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                    className="w-full p-3 bg-[#2C2C2E] rounded-xl border-none text-white placeholder-[#636366]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[#8E8E93] ml-1 mb-1 block">Dosage</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 100mg"
                                    value={newMed.dosage}
                                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                                    className="w-full p-3 bg-[#2C2C2E] rounded-xl border-none text-white placeholder-[#636366]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[#8E8E93] ml-1 mb-1 block">Time</label>
                                <input
                                    type="time"
                                    value={newMed.time}
                                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                                    className="w-full p-3 bg-[#2C2C2E] rounded-xl border-none text-white"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary py-3.5 mt-2">Add</button>
                    </form>
                </div>
            )}

            {/* Contraindication Alert */}
            {showContraindication && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="ios-card p-6 w-full max-w-xs text-center space-y-4">
                        <div className="w-12 h-12 bg-[#FF453A]/20 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-[#FF453A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg">Warning</h3>
                        <p className="text-sm text-[#8E8E93]">Atorvastatin interactions detected (Grapefruit). Proceed with caution.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowContraindication(false)} className="flex-1 btn-secondary py-2">Cancel</button>
                            <button onClick={async () => { setShowContraindication(false); await saveMedicine(); }} className="flex-1 btn-primary bg-[#FF453A] py-2">Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full bottom-nav pb-safe pt-2 px-6 z-30">
                <div className="flex justify-between items-center h-14">
                    <Link href="/" className="flex flex-col items-center gap-1 w-16 text-[#8E8E93] hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3.5 13.5L12 5l8.5 8.5V20a1 1 0 0 1-1 1h-5v-5h-5v5h-5a1 1 0 0 1-1-1v-6.5z" />
                        </svg>
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>

                    <Link href="/meds" className="flex flex-col items-center gap-1 w-16 text-[#0A84FF]">
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