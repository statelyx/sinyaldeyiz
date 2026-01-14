'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/supabase-provider'
import { createSupabase } from '@/lib/supabase/client'

interface Vehicle {
    id: string
    nickname: string | null
    year: number | null
    is_primary: boolean
    photo_urls: string[]
    catalog_id: string | null
}

export default function GaragePage() {
    const { user, profile } = useAuth()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetchVehicles()
    }, [user])

    const fetchVehicles = async () => {
        if (!user) return

        try {
            const supabase = createSupabase()
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', user.id)
                .order('is_primary', { ascending: false })

            if (!error && data) {
                setVehicles(data)
            }
        } catch (err) {
            console.error('Error fetching vehicles:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Garajım 🚗</h1>
                    <p className="text-white/60 mt-1">Araçlarını yönet ve sergile</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all"
                >
                    + Araç Ekle
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && vehicles.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-6xl mb-4">🚘</div>
                    <h3 className="text-xl font-bold text-white mb-2">Henüz araç eklenmedi</h3>
                    <p className="text-white/60 mb-6">İlk aracını ekleyerek garajına başla!</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                    >
                        + Araç Ekle
                    </button>
                </div>
            )}

            {/* Vehicles Grid */}
            {!loading && vehicles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all"
                        >
                            {/* Vehicle Image */}
                            <div className="h-48 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                                {vehicle.photo_urls.length > 0 ? (
                                    <img
                                        src={vehicle.photo_urls[0]}
                                        alt={vehicle.nickname || 'Araç'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-6xl">🚗</span>
                                )}
                            </div>

                            {/* Vehicle Info */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">
                                        {vehicle.nickname || 'İsimsiz Araç'}
                                    </h3>
                                    {vehicle.is_primary && (
                                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                            Ana Araç
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/60 text-sm">
                                    {vehicle.year ? `${vehicle.year} Model` : 'Yıl belirtilmedi'}
                                </p>

                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                                        Düzenle
                                    </button>
                                    <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                                        Fotoğraf Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Section */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white">{vehicles.length}</p>
                    <p className="text-white/60 text-sm">Toplam Araç</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-orange-400">{vehicles.filter(v => v.is_primary).length}</p>
                    <p className="text-white/60 text-sm">Ana Araç</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-green-400">{vehicles.reduce((acc, v) => acc + v.photo_urls.length, 0)}</p>
                    <p className="text-white/60 text-sm">Fotoğraf</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-blue-400">0</p>
                    <p className="text-white/60 text-sm">Beğeni</p>
                </div>
            </div>
        </div>
    )
}
