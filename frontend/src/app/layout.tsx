import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'Intake Tracker - AI Nutrition & Health Companion',
    description: 'Track your meals, calories, and medications with AI-powered insights from Google Gemini. Get accurate nutrition analysis from food photos or text descriptions.',
    manifest: '/manifest.json',
    keywords: ['nutrition tracker', 'calorie counter', 'meal logging', 'AI food recognition', 'health app', 'diet tracker'],
    authors: [{ name: 'Intake Tracker' }],
    openGraph: {
        title: 'Intake Tracker - AI Nutrition & Health Companion',
        description: 'Track your meals with AI-powered nutrition analysis',
        type: 'website',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Intake Tracker',
    },
    formatDetection: {
        telephone: false,
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
        { media: '(prefers-color-scheme: light)', color: '#10b981' },
    ],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} dark`}>
            <head>
                <link rel="icon" href="/icon-512.png" />
                <link rel="apple-touch-icon" href="/icon-512.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body className="font-sans antialiased bg-slate-900 text-white">
                {children}
            </body>
        </html>
    )
}