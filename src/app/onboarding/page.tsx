'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import { createSupabase } from '@/lib/supabase/client'

// 50 Avatar options (emoji-based for now)
const AVATAR_OPTIONS = [
  '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👱‍♂️', '👱‍♀️', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲',
  '🧔', '🧔‍♀️', '👨', '👩', '🧑', '👴', '👵', '🧓', '👲', '👳‍♂️',
  '👳‍♀️', '🧕', '👮‍♂️', '👮‍♀️', '👷‍♂️', '👷‍♀️', '💂‍♂️', '💂‍♀️', '🕵️‍♂️', '🕵️‍♀️',
  '👨‍⚕️', '👩‍⚕️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🎓', '👩‍🎓', '👨‍🎤', '👩‍🎤',
  '👨‍🏫', '👩‍🏫', '👨‍🏭', '👩‍🏭', '👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧',
]

interface VehicleBrand {
  id: number
  name: string
  type: 'car' | 'motorcycle'
}

interface VehicleModel {
  id: number
  brand_id: number
  name: string
}

const YEARS = Array.from({ length: 30 }, (_, i) => 2024 - i)

type Step = 'avatar' | 'vehicle' | 'permissions'
type VehicleType = 'car' | 'motorcycle'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, authState, refreshProfile, updateProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('avatar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Avatar selection
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [nickname, setNickname] = useState('')

  // Vehicle selection
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [brand, setBrand] = useState('')
  const [brandId, setBrandId] = useState<number | null>(null)
  const [model, setModel] = useState('')
  const [year, setYear] = useState<number | ''>('')

  // Vehicle data from Supabase
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Permissions
  const [locationGranted, setLocationGranted] = useState(false)
  const [notificationGranted, setNotificationGranted] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect during loading - let auth state settle
    if (authState === 'loading') {
      return
    }

    // Only redirect unauthenticated users
    if (authState === 'unauthenticated') {
      // Check if we just came from auth modal or callback
      if (typeof window !== 'undefined') {
        const isRedirecting = sessionStorage.getItem('auth_modal_redirect') === 'true'
        const timestamp = sessionStorage.getItem('auth_modal_timestamp')
        const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 10000 // 10 seconds

        if (isRedirecting && isRecent) {
          console.log('Onboarding: Recent auth redirect detected, waiting for hydration...')
          return
        }
      }

      router.push('/')
      return
    }

    // If user is already onboarded, redirect to dashboard
    if (authState === 'authenticated_onboarded') {
      router.push('/dashboard')
      return
    }

    // Set flag to prevent home page from redirecting back here
    // This handles the case where auth callback sends us here before profile is fully loaded
    if (authState === 'authenticated_not_onboarded') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('onboarding_page_visited', 'true')
        // Also set a timestamp to prevent stale flags
        sessionStorage.setItem('onboarding_visit_timestamp', Date.now().toString())
      }
    }
  }, [authState, router])

  // Fetch brands when vehicle type changes
  useEffect(() => {
    fetchBrands(vehicleType)
  }, [vehicleType])

  // Fetch models when brand changes
  useEffect(() => {
    if (brandId) {
      fetchModels(brandId)
    } else {
      setModels([])
    }
  }, [brandId])

  const fetchBrands = async (type: VehicleType) => {
    setLoadingData(true)
    try {
      const supabase = createSupabase()
      const { data, error } = await supabase
        .from('vehicle_brands')
        .select('id, name, type')
        .eq('type', type)
        .order('name')

      if (error) throw error
      setBrands(data || [])
    } catch (err) {
      console.error('Error fetching brands:', err)
      setBrands([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchModels = async (selectedBrandId: number) => {
    setLoadingData(true)
    try {
      const supabase = createSupabase()
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('id, brand_id, name')
        .eq('brand_id', selectedBrandId)
        .order('name')

      if (error) throw error
      setModels(data || [])
    } catch (err) {
      console.error('Error fetching models:', err)
      setModels([])
    } finally {
      setLoadingData(false)
    }
  }

  const handleBrandChange = (brandName: string) => {
    setBrand(brandName)
    setModel('')
    const selectedBrand = brands.find(b => b.name === brandName)
    setBrandId(selectedBrand?.id || null)
  }

  const handleAvatarSubmit = () => {
    if (!selectedAvatar) {
      setError('Lütfen bir avatar seçin')
      return
    }
    if (!nickname || nickname.length < 3) {
      setError('Takma ad en az 3 karakter olmalı')
      return
    }
    setError('')
    setCurrentStep('vehicle')
  }

  const handleVehicleSubmit = () => {
    if (!brand) {
      setError('Lütfen marka seçin')
      return
    }
    // Model is optional if not available
    if (!year) {
      setError('Lütfen yıl seçin')
      return
    }
    setError('')
    setCurrentStep('permissions')
  }

  const requestLocationPermission = async () => {
    try {
      navigator.geolocation.getCurrentPosition(
        () => setLocationGranted(true),
        () => setError('Konum izni reddedildi'),
        { timeout: 10000 }
      )
    } catch (err) {
      console.log('Location permission error:', err)
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      if (result === 'granted') {
        setNotificationGranted(true)
      }
    } catch (err) {
      console.log('Notification permission error:', err)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const supabase = createSupabase()

      // Update profile with onboarding_completed = true
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname,
          avatar_url: selectedAvatar,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        } as any)

      if (profileError) throw profileError

      // Save vehicle
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
          brand: brand,
          model: model || null,
          year: year as number,
          vehicle_type: vehicleType,
          nickname: `${brand} ${model || ''}`.trim(),
          is_primary: true,
        } as any)

      if (vehicleError) {
        console.error('Vehicle save error:', vehicleError)
        // Don't block onboarding if vehicle save fails
      }

      // Refresh profile and redirect
      await refreshProfile()
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Kayıt tamamlanamadı')
    } finally {
      setLoading(false)
    }
  }

  const stepNumber = currentStep === 'avatar' ? 1 : currentStep === 'vehicle' ? 2 : 3

  // Don't render if not authenticated (but allow loading state to show content)
  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show loading spinner only if we're still loading AND don't have a user yet
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-black/50 px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm font-medium">Adım {stepNumber}/3</span>
              <span className="text-yellow-400 text-sm font-medium">
                {currentStep === 'avatar' && 'Profil'}
                {currentStep === 'vehicle' && 'Araç'}
                {currentStep === 'permissions' && 'İzinler'}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                style={{ width: `${(stepNumber / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Step 1: Avatar Selection */}
            {currentStep === 'avatar' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Profilini Oluştur</h2>
                  <p className="text-white/60">Seni tanıyalım</p>
                </div>

                {/* Nickname Input */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Takma Ad *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    placeholder="ArabaSever123"
                    minLength={3}
                    maxLength={20}
                  />
                </div>

                {/* Avatar Grid */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Avatar Seç *
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-3 bg-white/5 rounded-xl border border-white/10">
                    {AVATAR_OPTIONS.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all ${selectedAvatar === avatar
                          ? 'bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/30'
                          : 'bg-white/10 hover:bg-white/20'
                          }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedAvatar && (
                  <div className="text-center py-4">
                    <span className="text-5xl">{selectedAvatar}</span>
                    <p className="text-white/40 text-sm mt-2">Seçilen Avatar</p>
                  </div>
                )}

                <button
                  onClick={handleAvatarSubmit}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl transition-all hover:from-yellow-300 hover:to-orange-400"
                >
                  Devam Et →
                </button>
              </div>
            )}

            {/* Step 2: Vehicle Selection */}
            {currentStep === 'vehicle' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Aracını Ekle</h2>
                  <p className="text-white/60">Araç bilgilerini gir</p>
                </div>

                {/* Vehicle Type Toggle */}
                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                  <button
                    onClick={() => {
                      setVehicleType('car')
                      setBrand('')
                      setModel('')
                      setBrandId(null)
                    }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${vehicleType === 'car'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : 'text-white/50 hover:text-white'
                      }`}
                  >
                    <span className="text-xl">🚗</span>
                    Otomobil
                  </button>
                  <button
                    onClick={() => {
                      setVehicleType('motorcycle')
                      setBrand('')
                      setModel('')
                      setBrandId(null)
                    }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${vehicleType === 'motorcycle'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : 'text-white/50 hover:text-white'
                      }`}
                  >
                    <span className="text-xl">🏍️</span>
                    Motorsiklet
                  </button>
                </div>

                {/* Brand Select */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Marka *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    disabled={loadingData}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-900">
                      {loadingData ? 'Yükleniyor...' : brands.length === 0 ? 'Marka yok (DB\'yi kontrol edin)' : 'Marka Seçin'}
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name} className="bg-slate-900">{b.name}</option>
                    ))}
                  </select>
                  {brands.length === 0 && !loadingData && (
                    <p className="text-yellow-400 text-xs mt-2">
                      ⚠️ Supabase&apos;de migration çalıştırın: 003_comprehensive_schema_v2.sql
                    </p>
                  )}
                </div>

                {/* Model Select */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Model {models.length > 0 && '*'}
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!brand || loadingData}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-900">
                      {loadingData ? 'Yükleniyor...' : models.length === 0 && brand ? 'Model yok (manuel yazabilirsiniz)' : 'Model Seçin'}
                    </option>
                    {models.map((m) => (
                      <option key={m.id} value={m.name} className="bg-slate-900">{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Year Select */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Yıl *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  >
                    <option value="" className="bg-slate-900">Yıl Seçin</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-slate-900">{y}</option>
                    ))}
                  </select>
                </div>

                {brand && year && (
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <p className="text-white/50 text-sm">Seçilen {vehicleType === 'car' ? 'Araç' : 'Motor'}:</p>
                    <p className="text-lg font-bold text-white">{brand} {model} ({year})</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep('avatar')}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={handleVehicleSubmit}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl transition-all"
                  >
                    Devam Et →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Permissions */}
            {currentStep === 'permissions' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Son Adım</h2>
                  <p className="text-white/60">İzinleri ayarla</p>
                </div>

                {/* Location Permission */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📍</span>
                      <div>
                        <p className="text-white font-medium">Konum İzni</p>
                        <p className="text-white/50 text-sm">Haritada görünmek için</p>
                      </div>
                    </div>
                    {locationGranted ? (
                      <span className="text-green-400 font-medium">✓ OK</span>
                    ) : (
                      <button
                        onClick={requestLocationPermission}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg text-sm font-medium transition-colors"
                      >
                        İzin Ver
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification Permission */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🔔</span>
                      <div>
                        <p className="text-white font-medium">Bildirim İzni</p>
                        <p className="text-white/50 text-sm">Etkinlik bildirimleri</p>
                      </div>
                    </div>
                    {notificationGranted ? (
                      <span className="text-green-400 font-medium">✓ OK</span>
                    ) : (
                      <button
                        onClick={requestNotificationPermission}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg text-sm font-medium transition-colors"
                      >
                        İzin Ver
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-white/40 text-sm text-center">
                  İzinleri daha sonra ayarlardan değiştirebilirsiniz
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep('vehicle')}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : '🏁 Tamamla'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
