'use client'

import { useState, useEffect } from 'react'
import {
    startSignal,
    stopSignal,
    checkSignalStatus,
    requestGeolocationWithFallback,
    updateLocation
} from '@/lib/services/location-service'
import type { LocationData } from '@/lib/services/location-service'

interface SignalButtonProps {
    onSignalChange: (active: boolean, location?: { lat: number; lon: number }) => void
    isMobile?: boolean
    initialLocation?: { lat: number; lon: number } | null
}

type DurationOption = 10 | 30 | 60

const DURATION_OPTIONS: { value: DurationOption; label: string; description: string }[] = [
    { value: 10, label: '10 dakika', description: 'Kısa süreli' },
    { value: 30, label: '30 dakika', description: 'Orta süreli' },
    { value: 60, label: '1 saat', description: 'Uzun süreli' },
]

export function SignalButton({ onSignalChange, isMobile = false, initialLocation }: SignalButtonProps) {
    const [isActive, setIsActive] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<Date | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string>('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<DurationOption>(60)
    const [statusMessage, setStatusMessage] = useState('')
    const [showStatusInput, setShowStatusInput] = useState(false)
    const [lastKnownLocation, setLastKnownLocation] = useState<LocationData | null>(
        initialLocation ? { lat: initialLocation.lat, lon: initialLocation.lon } : null
    )
    const [usedFallback, setUsedFallback] = useState(false)
    const [fallbackMessage, setFallbackMessage] = useState<string | null>(null)
    const [loadingProgress, setLoadingProgress] = useState<string>('')

    // initialLocation değiştiğinde lastKnownLocation'ı güncelle
    useEffect(() => {
        if (initialLocation) {
            setLastKnownLocation({ lat: initialLocation.lat, lon: initialLocation.lon })
        }
    }, [initialLocation])

    // Check initial status
    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkSignalStatus()
            setIsActive(status.isActive)
            if (status.expiresAt) {
                setExpiresAt(status.expiresAt)
            }
        }
        checkStatus()
    }, [])

    // Update countdown timer
    useEffect(() => {
        if (!isActive || !expiresAt) {
            setTimeRemaining('')
            return
        }

        const updateTimer = () => {
            const now = new Date()
            const diff = expiresAt.getTime() - now.getTime()

            if (diff <= 0) {
                setIsActive(false)
                setExpiresAt(null)
                setTimeRemaining('')
                onSignalChange(false)
                return
            }

            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [isActive, expiresAt, onSignalChange])

    // Update location while signal is active
    useEffect(() => {
        if (!isActive) return

        const watchId = navigator.geolocation?.watchPosition(
            (position) => {
                updateLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy_meters: position.coords.accuracy,
                })
            },
            (error) => console.log('Location watch error:', error),
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
        )

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation?.clearWatch(watchId)
            }
        }
    }, [isActive])

    const handleStartSignal = async () => {
        setError(null)
        setUsedFallback(false)
        setFallbackMessage(null)
        setLoading(true)
        setLoadingProgress('Konum alınıyor...')

        try {
            // Yedekli konum isteği — son bilinen konum varsa fallback olarak kullanılır
            const result = await requestGeolocationWithFallback(lastKnownLocation)

            if (result.usedFallback) {
                setUsedFallback(true)
                setFallbackMessage(result.fallbackReason || 'Son bilinen konum kullanıldı')
            }

            setLoadingProgress('Sinyal başlatılıyor...')

            // Son bilinen konumu güncelle
            setLastKnownLocation(result.location)

            // Seçilen süre ve durum mesajı ile sinyal başlat
            const signalResult = await startSignal(result.location, selectedDuration, statusMessage.trim() || undefined)

            if (signalResult.success) {
                setIsActive(true)
                const expires = new Date(Date.now() + selectedDuration * 60 * 1000)
                setExpiresAt(expires)
                onSignalChange(true, { lat: result.location.lat, lon: result.location.lon })
                setStatusMessage('')
            } else {
                setError(signalResult.error || 'Sinyal başlatılamadı')
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu')
        } finally {
            setLoading(false)
            setLoadingProgress('')
            setShowConfirm(false)
        }
    }

    const handleStopSignal = async () => {
        setError(null)
        setLoading(true)

        try {
            const result = await stopSignal()

            if (result.success) {
                setIsActive(false)
                setExpiresAt(null)
                onSignalChange(false)
            } else {
                setError(result.error || 'Sinyal durdurulamadı')
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    // Mobile FAB version
    if (isMobile) {
        return (
            <>
                {/* Confirmation Modal */}
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-xl">
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">📍</div>
                                <h3 className="text-xl font-bold text-white mb-2">Sinyal Ver</h3>
                                <p className="text-white/70 text-sm mb-4">
                                    Konumunuz diğer sürücülere gösterilecektir. İstediğiniz zaman kapatabilirsiniz.
                                </p>
                            </div>

                            {/* Duration Options */}
                            <div className="mb-4 space-y-2">
                                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Süre Seçin</p>
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedDuration(option.value)}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${
                                            selectedDuration === option.value
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{option.label}</span>
                                            {selectedDuration === option.value && (
                                                <span className="text-xl">✓</span>
                                            )}
                                        </div>
                                        <div className={`text-xs ${selectedDuration === option.value ? 'text-white/80' : 'text-white/60'}`}>
                                            {option.description}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Status Message Toggle */}
                            <button
                                onClick={() => setShowStatusInput(!showStatusInput)}
                                className="w-full mb-4 p-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span>💬</span>
                                <span>{showStatusInput ? 'Durum mesajını gizle' : 'Durum mesajı ekle'}</span>
                            </button>

                            {/* Status Message Input */}
                            {showStatusInput && (
                                <div className="mb-4">
                                    <textarea
                                        placeholder="Ne yapıyorsun? (örn: Kadıköy'e doğru gidiyorum)"
                                        maxLength={100}
                                        value={statusMessage}
                                        onChange={(e) => setStatusMessage(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-yellow-400/50 transition-colors"
                                        rows={2}
                                    />
                                    <div className="text-right text-xs text-white/40 mt-1">
                                        {statusMessage.length}/100
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                                    <p>{error}</p>
                                    <button
                                        onClick={handleStartSignal}
                                        className="mt-2 w-full py-2 bg-red-500/30 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        🔄 Yeniden Dene
                                    </button>
                                </div>
                            )}

                            {usedFallback && fallbackMessage && !error && (
                                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm">
                                    ⚠️ {fallbackMessage} — son bilinen konum kullanıldı.
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleStartSignal}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {loadingProgress || 'Yükleniyor...'}
                                        </span>
                                    ) : (
                                        'Sinyal Ver'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAB Button */}
                {isActive ? (
                    <button
                        onClick={handleStopSignal}
                        disabled={loading}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-lg">🟢</span>
                                <span className="text-[10px] font-medium">{timeRemaining}</span>
                            </div>
                        )}
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
                    </button>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={loading}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/30 flex items-center justify-center text-2xl transition-all active:scale-95 hover:shadow-xl"
                    >
                        🚨
                    </button>
                )}
            </>
        )
    }

    // Masaüstü versiyonu
    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm max-w-xs">
                    <p>{error}</p>
                    <button
                        onClick={handleStartSignal}
                        className="mt-2 w-full py-2 bg-red-500/30 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-colors"
                    >
                        🔄 Yeniden Dene
                    </button>
                </div>
            )}

            {usedFallback && fallbackMessage && !error && (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm max-w-xs">
                    ⚠️ {fallbackMessage} — son bilinen konum kullanıldı.
                </div>
            )}

            {isActive ? (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-green-500/20 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                                🟢
                            </div>
                            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Sinyal Aktif</p>
                            <p className="text-green-400 text-sm font-mono">{timeRemaining} kaldı</p>
                        </div>
                    </div>

                    <button
                        onClick={handleStopSignal}
                        disabled={loading}
                        className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Durduruluyor...' : '⏹️ Sinyali Kapat'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl px-8 py-4 font-bold text-lg shadow-lg shadow-red-500/30 transition-all hover:shadow-xl disabled:opacity-50"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        <span className="text-2xl">🚨</span>
                        Sinyal Ver
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-xl">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">📍</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Sinyal Vermek Üzeresiniz</h3>
                            <p className="text-white/70">
                                Konumunuz haritada diğer sürücülere gösterilecektir.
                            </p>
                            <p className="text-white/60 text-sm mt-2">
                                İstediğiniz zaman sinyali kapatabilirsiniz.
                            </p>
                        </div>

                        {/* Duration Options */}
                        <div className="mb-6 space-y-2">
                            <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Süre Seçin</p>
                            <div className="grid grid-cols-3 gap-2">
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedDuration(option.value)}
                                        className={`p-3 rounded-lg text-center transition-all ${
                                            selectedDuration === option.value
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                    >
                                        <div className="text-lg font-bold">{option.label}</div>
                                        <div className={`text-xs ${selectedDuration === option.value ? 'text-white/80' : 'text-white/60'}`}>
                                            {option.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Message Toggle */}
                        <button
                            onClick={() => setShowStatusInput(!showStatusInput)}
                            className="w-full mb-6 p-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <span>💬</span>
                            <span>{showStatusInput ? 'Durum mesajını gizle' : 'Durum mesajı ekle'}</span>
                        </button>

                        {/* Status Message Input */}
                        {showStatusInput && (
                            <div className="mb-6">
                                <textarea
                                    placeholder="Ne yapıyorsun? (örn: Kadıköy'e doğru gidiyorum)"
                                    maxLength={100}
                                    value={statusMessage}
                                    onChange={(e) => setStatusMessage(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-yellow-400/50 transition-colors"
                                    rows={2}
                                />
                                <div className="text-right text-xs text-white/40 mt-1">
                                    {statusMessage.length}/100
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                                <p>{error}</p>
                                <button
                                    onClick={handleStartSignal}
                                    className="mt-2 w-full py-2 bg-red-500/30 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                    🔄 Yeniden Dene
                                </button>
                            </div>
                        )}

                        {usedFallback && fallbackMessage && !error && (
                            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm">
                                ⚠️ {fallbackMessage} — son bilinen konum kullanıldı.
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleStartSignal}
                                disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {loadingProgress || 'Yükleniyor...'}
                                    </span>
                                ) : (
                                    '🚨 Sinyal Ver'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
