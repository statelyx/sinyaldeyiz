'use client'

import { useEffect, useState } from 'react'

interface ChatBubbleProps {
    message: string
    expiresAt: string | null
}

export function ChatBubble({ message, expiresAt }: ChatBubbleProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
        if (!expiresAt) return

        const checkExpiry = () => {
            const now = new Date()
            const expiry = new Date(expiresAt)
            const diff = expiry.getTime() - now.getTime()

            if (diff <= 0) {
                setIsVisible(false)
                setTimeRemaining('')
                return
            }

            // Calculate time remaining
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)

            if (minutes > 0) {
                setTimeRemaining(`${minutes}dk`)
            } else {
                setTimeRemaining(`${seconds}s`)
            }
        }

        // Check immediately
        checkExpiry()

        // Update every second
        const interval = setInterval(checkExpiry, 1000)

        return () => clearInterval(interval)
    }, [expiresAt])

    if (!isVisible || !message) return null

    return (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
            <div className="relative">
                {/* Bubble */}
                <div className="bg-black/90 backdrop-blur-xl border border-yellow-400/30 text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-yellow-400/20 min-w-[120px] max-w-[200px]">
                    <p className="text-sm font-medium text-center break-words">
                        {message}
                    </p>
                    {timeRemaining && (
                        <div className="text-[10px] text-yellow-400/70 text-center mt-1">
                            {timeRemaining}
                        </div>
                    )}
                </div>

                {/* Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/90" />

                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-3xl blur-sm -z-10" />
            </div>
        </div>
    )
}
