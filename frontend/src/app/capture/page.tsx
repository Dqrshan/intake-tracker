'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// --- Icons ---
const CameraIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)
const UploadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
)
const TextIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
)
const LightningIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
)

type Mode = 'quick' | 'text' | 'camera' | 'upload'

export default function Capture() {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>('quick')
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    // Camera handling
    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Camera API not supported in this browser. Please use a modern browser or ensure you are on HTTPS.')
            return
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (err) {
            console.error('Camera error (environment):', err)
            // Fallback to any camera
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true
                })
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (fallbackErr) {
                console.error('Camera error (fallback):', fallbackErr)
                alert('Unable to access camera. Please ensure you have granted permission and are using HTTPS.')
            }
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    useEffect(() => {
        if (mode === 'camera') startCamera()
        else stopCamera()
        return () => stopCamera()
    }, [mode])

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth
                canvasRef.current.height = videoRef.current.videoHeight
                context.drawImage(videoRef.current, 0, 0)
                canvasRef.current.toBlob((blob) => {
                    if (blob) handleFile(new File([blob], "capture.jpg", { type: "image/jpeg" }))
                }, 'image/jpeg')
            }
        }
    }

    const handleFile = async (file: File) => {
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/infer', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.dishes && data.dishes.length > 0) {
                setResult(data.dishes[0])
                setShowConfirm(true)
            } else {
                alert('Could not recognize food. Please try again.')
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Analysis failed')
        } finally {
            setLoading(false)
        }
    }

    const handleTextSubmit = async () => {
        if (!input.trim()) return
        setLoading(true)
        try {
            const endpoint = mode === 'quick' ? '/api/quick-log' : '/api/analyze-text'
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: input })
            })
            const data = await res.json()
            if (data.dishes && data.dishes.length > 0) {
                setResult(data.dishes[0])
                setShowConfirm(true)
            } else if (data.name && data.kcal !== undefined) {
                setResult(data)
                setShowConfirm(true)
            }
        } catch (error) {
            console.error('Analysis failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveMeal = async () => {
        try {
            await fetch('/api/meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
            })
            router.push('/')
        } catch (error) {
            console.error('Failed to save:', error)
        }
    }

    if (showConfirm && result) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-center">
                <div className="ios-card p-6 space-y-4">
                    <h2 className="text-xl font-bold text-center">Confirm Log</h2>

                    <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[#8E8E93]">Name</span>
                            <span className="font-semibold text-lg">{result.name}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center mt-4">
                            <div className="bg-[#1C1C1E] p-2 rounded-lg border border-[#38383A]">
                                <p className="text-xs text-[#8E8E93]">Cals</p>
                                <p className="font-bold">{result.kcal}</p>
                            </div>
                            <div className="bg-[#1C1C1E] p-2 rounded-lg border border-[#38383A]">
                                <p className="text-xs text-[#8E8E93]">Prot</p>
                                <p className="font-bold text-[#30D158]">{result.protein_g}g</p>
                            </div>
                            <div className="bg-[#1C1C1E] p-2 rounded-lg border border-[#38383A]">
                                <p className="text-xs text-[#8E8E93]">Carbs</p>
                                <p className="font-bold text-[#0A84FF]">{result.carbs_g}g</p>
                            </div>
                            <div className="bg-[#1C1C1E] p-2 rounded-lg border border-[#38383A]">
                                <p className="text-xs text-[#8E8E93]">Fat</p>
                                <p className="font-bold text-[#FF9F0A]">{result.fat_g}g</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                        <button onClick={saveMeal} className="flex-1 btn-primary py-3">Save Meal</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col pb-safe">
            {/* Header */}
            <div className="p-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="text-[#0A84FF]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-lg font-bold">Log Meal</h1>
            </div>

            {/* Mode Selector - Segmented Control style */}
            <div className="px-4 mb-6">
                <div className="bg-[#1C1C1E] p-1 rounded-xl flex">
                    {[
                        { id: 'quick', icon: <LightningIcon />, label: 'Quick' },
                        { id: 'text', icon: <TextIcon />, label: 'Details' },
                        { id: 'camera', icon: <CameraIcon />, label: 'Scan' },
                        { id: 'upload', icon: <UploadIcon />, label: 'File' }
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id as Mode)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium transition-all ${mode === m.id ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93]'
                                }`}
                        >
                            {m.icon}
                            <span className="mt-1">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 px-4 flex flex-col items-center">
                {mode === 'quick' && (
                    <div className="w-full max-w-md space-y-4 animate-fade-in">
                        <p className="text-center text-[#8E8E93] text-sm">Validating simple entries, e.g. &quot;1 apple&quot;</p>
                        <input
                            type="text"
                            placeholder="Type food name..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full p-4 bg-[#1C1C1E] rounded-xl border border-[#38383A] text-white focus:border-[#0A84FF] outline-none text-lg"
                        />
                        <button
                            onClick={handleTextSubmit}
                            disabled={loading || !input}
                            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Analyzing...' : 'Log It'}
                        </button>
                    </div>
                )}

                {mode === 'text' && (
                    <div className="w-full max-w-md space-y-4 animate-fade-in">
                        <textarea
                            placeholder="Describe your meal in detail... e.g., Grilled chicken breast with 1 cup of brown rice and steamed broccoli"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={6}
                            className="w-full p-4 bg-[#1C1C1E] rounded-xl border border-[#38383A] text-white focus:border-[#0A84FF] outline-none resize-none"
                        />
                        <button
                            onClick={handleTextSubmit}
                            disabled={loading || !input}
                            className="w-full btn-primary py-3.5"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Text'}
                        </button>
                    </div>
                )}

                {mode === 'camera' && (
                    <div className="w-full max-w-md flex flex-col items-center space-y-4 animate-fade-in">
                        <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-[#38383A]">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <button
                            onClick={captureImage}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center mb-4"
                        >
                            <div className="w-16 h-16 bg-white rounded-full"></div>
                        </button>
                    </div>
                )}

                {mode === 'upload' && (
                    <div className="w-full max-w-md animate-fade-in">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#38383A] rounded-2xl p-12 flex flex-col items-center justify-center text-[#8E8E93] hover:border-[#0A84FF] hover:text-white transition-colors cursor-pointer"
                        >
                            <UploadIcon />
                            <p className="mt-4 font-medium">Click to select photo</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </div>
                )}

                {loading && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="ios-card p-6 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-[#2C2C2E] border-t-[#0A84FF] rounded-full animate-spin mb-3"></div>
                            <p className="text-sm font-medium">Analyzing...</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}