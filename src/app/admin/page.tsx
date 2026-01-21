'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUser } from '@/lib/supabase/server'

// Simple admin check (in production, use proper RBAC)
async function isAdmin(): Promise<boolean> {
  try {
    const user = await getUser()
    if (!user) return false

    // Check if user email is in admin list
    const adminEmails = ['furkan.avcilar@example.com', 'admin@sinyaldeyiz.com'] // Replace with actual admin emails
    return adminEmails.includes(user.email || '')
  } catch {
    return false
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'vehicles' | 'brands' | 'icons'>('users')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBrands: 0,
    activeSignals: 0,
  })

  // Data states
  const [users, setUsers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const authorized = await isAdmin()
    if (!authorized) {
      router.push('/')
      return
    }
    setIsAuthorized(true)
    loadData()
    setLoading(false)
  }

  const loadData = async () => {
    const supabase = createClient()

    // Load stats
    const [{ count: userCount }, { count: vehicleCount }, { count: brandCount }, { count: signalCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('vehicle_brands').select('*', { count: 'exact', head: true }),
      supabase.from('location_status').select('*', { count: 'exact', head: true }).eq('is_visible', true),
    ])

    setStats({
      totalUsers: userCount || 0,
      totalVehicles: vehicleCount || 0,
      totalBrands: brandCount || 0,
      activeSignals: signalCount || 0,
    })

    // Load users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (usersData) setUsers(usersData)

    // Load vehicles with user info
    const { data: vehiclesData } = await supabase
      .from('vehicles')
      .select('*, profiles(nickname)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (vehiclesData) setVehicles(vehiclesData)

    // Load brands
    const { data: brandsData } = await supabase
      .from('vehicle_brands')
      .select('*')
      .order('name', { ascending: true })

    if (brandsData) setBrands(brandsData)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-xl font-bold">
              Sinyal<span className="text-yellow-400">deyiz</span> Admin
            </h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            ← Panele Dön
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Toplam Kullanıcı', value: stats.totalUsers, icon: '👥', color: 'from-blue-500/20 to-cyan-500/20' },
            { label: 'Toplam Araç', value: stats.totalVehicles, icon: '🚗', color: 'from-yellow-500/20 to-orange-500/20' },
            { label: 'Marka Sayısı', value: stats.totalBrands, icon: '🏷️', color: 'from-green-500/20 to-emerald-500/20' },
            { label: 'Aktif Sinyal', value: stats.activeSignals, icon: '📍', color: 'from-red-500/20 to-pink-500/20' },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-white/10`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-white/60 text-sm">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'users', label: 'Kullanıcılar', icon: '👥' },
            { id: 'vehicles', label: 'Araçlar', icon: '🚗' },
            { id: 'brands', label: 'Markalar', icon: '🏷️' },
            { id: 'icons', label: 'İkonlar', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Kullanıcı Listesi</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Kullanıcı</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Şehir</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url && (
                              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            )}
                            <span className="font-medium">{user.nickname}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white/60">{user.email || '-'}</td>
                        <td className="py-3 px-4 text-white/60">{user.city || '-'}</td>
                        <td className="py-3 px-4 text-white/60">
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Araç Listesi</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Sahibi</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Marka</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Model</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Yıl</th>
                      <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Plaka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          {(vehicle as any).profiles?.nickname || '-'}
                        </td>
                        <td className="py-3 px-4 text-yellow-400">{vehicle.catalog_id || '-'}</td>
                        <td className="py-3 px-4 text-white/60">-</td>
                        <td className="py-3 px-4 text-white/60">{vehicle.year || '-'}</td>
                        <td className="py-3 px-4 text-white/60 font-mono">{vehicle.plate_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'brands' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Marka Listesi</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-400/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`/vehicles/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={brand.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/vehicles/brands/default.png'
                        }}
                      />
                      <span className="text-sm font-medium truncate">{brand.name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          brand.type === 'car'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {brand.type === 'car' ? '🚗 Araba' : '🏍️ Motor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'icons' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Araç İkonları</h2>
              <p className="text-white/60 mb-6">
                Mevcut {brands.length} marka ikonu bulunuyor. İkonları{' '}
                <code className="px-2 py-1 bg-white/10 rounded">public/vehicles/brands/</code> klasörüne ekleyebilirsiniz.
              </p>
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
                {brands.map((brand) => {
                  const iconPath = `/vehicles/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}.png`
                  return (
                    <div
                      key={brand.id}
                      className="aspect-square p-4 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-400/50 transition-all flex items-center justify-center"
                    >
                      <img
                        src={iconPath}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/vehicles/brands/default.png'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-2xl border border-yellow-400/20">
          <h3 className="text-lg font-bold mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm"
            >
              👥 Kullanıcı Yönetimi
            </button>
            <button
              onClick={() => router.push('/admin/vehicles')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm"
            >
              🚗 Araç Onayı
            </button>
            <button
              onClick={() => router.push('/admin/reports')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm"
            >
              🚩 Şikayetler
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm"
            >
              ⚙️ Ayarlar
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
