'use client';

import { useAuth } from '@/components/providers/supabase-provider';

export default function StatsPage() {
    const { user } = useAuth();

    // Demo stats
    const stats = {
        signals_sent: 24,
        signals_received: 156,
        profile_views: 89,
        messages_sent: 45,
        followers: 23,
        following: 31,
        cruise_joined: 5,
        km_driven: 1250,
    };

    const weeklyData = [
        { day: 'Pzt', signals: 3 },
        { day: 'Sal', signals: 5 },
        { day: 'Çar', signals: 2 },
        { day: 'Per', signals: 8 },
        { day: 'Cum', signals: 12 },
        { day: 'Cmt', signals: 15 },
        { day: 'Paz', signals: 7 },
    ];

    const maxSignal = Math.max(...weeklyData.map(d => d.signals));

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">
                        İstatistikler
                    </h1>
                    <p className="text-white/60">Sinyaldeyiz aktiviteleriniz</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Sinyal Gönderilen', value: stats.signals_sent, icon: '📡', color: 'from-yellow-400 to-orange-500' },
                        { label: 'Sinyal Alınan', value: stats.signals_received, icon: '📲', color: 'from-green-400 to-emerald-500' },
                        { label: 'Profil Görüntüleme', value: stats.profile_views, icon: '👁️', color: 'from-yellow-400 to-orange-500' },
                        { label: 'Mesaj Gönderilen', value: stats.messages_sent, icon: '💬', color: 'from-purple-400 to-pink-500' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
                        >
                            <span className="text-2xl mb-2 block">{stat.icon}</span>
                            <p className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                            </p>
                            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Weekly Chart */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-8">
                    <h2 className="text-lg font-bold text-white mb-6">Haftalık Sinyal Aktivitesi</h2>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {weeklyData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-yellow-400 to-orange-500 rounded-t-lg transition-all"
                                    style={{ height: `${(day.signals / maxSignal) * 100}%`, minHeight: '8px' }}
                                />
                                <span className="text-xs text-white/50">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Takipçi', value: stats.followers, icon: '👥' },
                        { label: 'Takip Edilen', value: stats.following, icon: '➕' },
                        { label: 'Cruise Katılım', value: stats.cruise_joined, icon: '🏎️' },
                        { label: 'Toplam KM', value: `${stats.km_driven}+`, icon: '🛣️' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center"
                        >
                            <span className="text-2xl mb-2 block">{stat.icon}</span>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Achievements */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Rozetler</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { emoji: '🚀', label: 'İlk Sinyal', earned: true },
                            { emoji: '🎯', label: '10 Sinyal', earned: true },
                            { emoji: '🔥', label: '50 Sinyal', earned: false },
                            { emoji: '💬', label: 'Sohbetçi', earned: true },
                            { emoji: '🏆', label: 'Cruise Şampiyonu', earned: false },
                            { emoji: '⭐', label: 'Popüler Sürücü', earned: false },
                        ].map((badge, i) => (
                            <div
                                key={i}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 ${badge.earned
                                        ? 'bg-yellow-400/20 border border-yellow-400/50'
                                        : 'bg-white/5 border border-white/10 opacity-50'
                                    }`}
                            >
                                <span className="text-xl">{badge.emoji}</span>
                                <span className={`text-sm ${badge.earned ? 'text-white' : 'text-white/50'}`}>
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
