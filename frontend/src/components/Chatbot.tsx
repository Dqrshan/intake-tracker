'use client'

import { useState, useRef, useEffect } from 'react'

// --- Icons ---
const ChatIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
)
const SendIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
)
const SparklesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
)
const XIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

interface Message {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello. I can help with nutrition questions and meal suggestions.',
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const sendMessage = async (text: string) => {
        if (!text.trim()) return
        const userMessage: Message = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)
        setInput('')

        try {
            const response = await fetch('/api/nutrition-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            })
            if (!response.ok) throw new Error('Service unavailable')
            const result = await response.json()
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: result.response || 'I couldn\'t process that.',
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: 'Connection error. Please try again.',
                isUser: false,
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const quickActions = [
        'Low calorie snacks',
        'Protein in 2 eggs',
        'Healthy dinner ideas'
    ]

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-5 w-14 h-14 bg-[#2C2C2E] text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform active:scale-95 border border-[#38383A]"
            >
                <ChatIcon />
            </button>
        )
    }

    return (
        <div className="fixed bottom-24 right-5 w-[90vw] max-w-[360px] h-[500px] bg-[#1C1C1E] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[#38383A] animate-fade-in">
            {/* Header */}
            <div className="bg-[#1C1C1E] p-4 flex items-center justify-between border-b border-[#38383A]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0A84FF] rounded-full flex items-center justify-center text-white">
                        <SparklesIcon />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">Assistant</h3>
                        <p className="text-[10px] text-[#8E8E93]">Powered by Gemini</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-[#8E8E93] hover:text-white transition-colors"
                >
                    <XIcon />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] px-4 py-2 text-sm rounded-2xl ${message.isUser
                                    ? 'bg-[#0A84FF] text-white rounded-br-none'
                                    : 'bg-[#2C2C2E] text-white rounded-bl-none'
                                }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#2C2C2E] px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                            <div className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-[#8E8E93] rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && !isLoading && (
                <div className="px-4 py-2 bg-black overflow-x-auto no-scrollbar flex gap-2">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(action)}
                            className="whitespace-nowrap text-xs px-3 py-1.5 bg-[#2C2C2E] rounded-full text-white border border-[#38383A]"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-3 bg-[#1C1C1E] border-t border-[#38383A]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask something..."
                        className="flex-1 bg-[#2C2C2E] text-white rounded-full px-4 py-2 text-sm border border-[#38383A] focus:border-[#0A84FF] outline-none placeholder-[#636366]"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-9 h-9 bg-[#0A84FF] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SendIcon />
                    </button>
                </div>
            </form>
        </div>
    )
}