'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Driver {
    id: string;
    nickname: string;
    avatar_url: string;
    vehicle_type: string;
    vehicle_brand: string;
    vehicle_model: string;
    is_online: boolean;
    last_seen: string;
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'car' | 'motorcycle'>('all');
    const [onlineOnly, setOnlineOnly] = useState(false);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const supabase = createBrowserClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('id, nickname, avatar_url, vehicle_type, vehicle_brand, vehicle_model, is_online, last_seen')
                .order('is_online', { ascending: false })
                .limit(50);

            if (error) throw error;
            setDrivers(data || []);
        } catch (error) {
            console.error('Error loading drivers:', error);
            // Demo data for preview
            setDrivers(generateDemoDrivers());
        } finally {
            setLoading(false);
        }
    };

    const generateDemoDrivers = (): Driver[] => {
        const names = ['AhmetR34', 'ZeynepM3', 'EmreTurbo', 'CanDrift', 'SelimRider',
            'ElifSpeed', 'BurakGTI', 'AyseBiker', 'KeremMotor', 'DenizRace'];
        const cars = [
            { brand: 'BMW', model: 'M3' },
            { brand: 'Mercedes', model: 'AMG C63' },
            { brand: 'Audi', model: 'RS6' },
            { brand: 'Volkswagen', model: 'Golf R' },
            { brand: 'Ford', model: 'Mustang' },
        ];
        const motos = [
            { brand: 'Yamaha', model: 'R1' },
            { brand: 'Kawasaki', model: 'Ninja' },
            { brand: 'Honda', model: 'CBR' },
            { brand: 'Ducati', model: 'Panigale' },
            { brand: 'KTM', model: 'Duke' },
        ];

        return names.map((name, i) => {
            const isMotorcycle = i % 2 === 1;
            const vehicle = isMotorcycle ? motos[i % motos.length] : cars[i % cars.length];
            return {
                id: `demo-${i}`,
                nickname: name,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase()}`,
                vehicle_type: isMotorcycle ? 'motorcycle' : 'car',
                vehicle_brand: vehicle.brand,
                vehicle_model: vehicle.model,
                is_online: Math.random() > 0.5,
                last_seen: new Date().toISOString(),
            };
        });
    };

    const filteredDrivers = drivers.filter(d => {
        if (filter !== 'all' && d.vehicle_type !== filter) return false;
        if (onlineOnly && !d.is_online) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">
                        Sürücüler
                    </h1>
                    <p className="text-white/60">Yakındaki araba ve motor tutkunları</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: 'Tümü', icon: '🏎️' },
                            { value: 'car', label: 'Araba', icon: '🚗' },
                            { value: 'motorcycle', label: 'Motor', icon: '🏍️' },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value as any)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${filter === f.value
                                        ? 'bg-yellow-400 text-black font-bold'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                <span>{f.icon}</span>
                                <span>{f.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setOnlineOnly(!onlineOnly)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${onlineOnly
                                ? 'bg-green-500 text-white font-bold'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${onlineOnly ? 'bg-white' : 'bg-green-400'}`} />
                        <span>Online</span>
                    </button>
                </div>

                {/* Drivers Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredDrivers.map((driver) => (
                            <div
                                key={driver.id}
                                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-yellow-400/50 transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="relative">
                                        <img
                                            src={driver.avatar_url}
                                            alt={driver.nickname}
                                            className="w-12 h-12 rounded-full bg-white/10"
                                        />
                                        {driver.is_online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                                            {driver.nickname}
                                        </h3>
                                        <p className="text-sm text-white/50">
                                            {driver.is_online ? 'Şu an online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-xl">
                                        {driver.vehicle_type === 'motorcycle' ? '🏍️' : '🚗'}
                                    </span>
                                    <span className="text-white/70">
                                        {driver.vehicle_brand} {driver.vehicle_model}
                                    </span>
                                </div>

                                <button className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white/70 hover:bg-yellow-400 hover:text-black font-medium transition-all">
                                    Profil Gör
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {filteredDrivers.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">👻</span>
                        <p className="text-white/60">Henüz kimse yok</p>
                    </div>
                )}
            </div>
        </div>
    );
}
