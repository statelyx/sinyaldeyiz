'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Avatar {
    id: number;
    url: string;
    category: string;
}

interface AvatarPickerProps {
    selectedAvatar: string | null;
    onSelect: (url: string) => void;
    className?: string;
}

export default function AvatarPicker({ selectedAvatar, onSelect, className = '' }: AvatarPickerProps) {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        loadAvatars();
    }, []);

    const loadAvatars = async () => {
        try {
            const supabase = createBrowserClient();
            const { data, error } = await supabase
                .from('avatars')
                .select('*')
                .order('id');

            if (error) {
                console.error('Error loading avatars:', error);
                // Fallback to generated avatars
                const fallbackAvatars = Array.from({ length: 50 }, (_, i) => ({
                    id: i + 1,
                    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=avatar${i + 1}`,
                    category: 'avataaars',
                }));
                setAvatars(fallbackAvatars);
            } else {
                setAvatars(data || []);
            }
        } catch (error) {
            console.error('Failed to load avatars:', error);
        } finally {
            setLoading(false);
        }
    };

    // Default avatar seeds for fallback
    const defaultAvatars = [
        'driver1', 'driver2', 'driver3', 'driver4', 'driver5',
        'racer1', 'racer2', 'racer3', 'racer4', 'racer5',
        'speed1', 'speed2', 'speed3', 'speed4', 'speed5',
        'turbo1', 'turbo2', 'turbo3', 'turbo4', 'turbo5',
        'drift1', 'drift2', 'drift3', 'drift4', 'drift5',
        'motor1', 'motor2', 'motor3', 'motor4', 'motor5',
        'bike1', 'bike2', 'bike3', 'bike4', 'bike5',
        'rider1', 'rider2', 'rider3', 'rider4', 'rider5',
        'crew1', 'crew2', 'crew3', 'crew4', 'crew5',
        'night1', 'night2', 'night3', 'night4', 'night5',
    ];

    const displayAvatars = avatars.length > 0
        ? avatars
        : defaultAvatars.map((seed, i) => ({
            id: i + 1,
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
            category: 'avataaars',
        }));

    return (
        <div className={`relative ${className}`}>
            {/* Selected Avatar Preview */}
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="relative group"
            >
                <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden hover:border-yellow-400/50 transition-all">
                    {selectedAvatar ? (
                        <img
                            src={selectedAvatar}
                            alt="Seçili Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            </button>

            {/* Avatar Picker Modal */}
            {showPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">Avatar Seç</h3>
                            <button
                                type="button"
                                onClick={() => setShowPicker(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Avatar Grid */}
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                    {displayAvatars.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => {
                                                onSelect(avatar.url);
                                                setShowPicker(false);
                                            }}
                                            className={`
                        aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105
                        ${selectedAvatar === avatar.url
                                                    ? 'border-yellow-400 ring-2 ring-yellow-400/50'
                                                    : 'border-white/10 hover:border-white/30'
                                                }
                      `}
                                        >
                                            <img
                                                src={avatar.url}
                                                alt={`Avatar ${avatar.id}`}
                                                className="w-full h-full object-cover bg-white/5"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPicker(false)}
                                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
