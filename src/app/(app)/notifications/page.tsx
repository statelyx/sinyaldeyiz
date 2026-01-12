'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Notification {
    id: string;
    type: 'signal' | 'message' | 'follow' | 'like' | 'system';
    title: string;
    body: string;
    avatar?: string;
    read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            // Demo notifications
            setNotifications([
                {
                    id: '1',
                    type: 'signal',
                    title: 'AhmetR34 sinyal verdi',
                    body: 'Bağdat Caddesi yakınlarında',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmetR34',
                    read: false,
                    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                },
                {
                    id: '2',
                    type: 'message',
                    title: 'ZeynepM3 sana yazdı',
                    body: 'Yarın cruise var mısın?',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynepM3',
                    read: false,
                    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                },
                {
                    id: '3',
                    type: 'follow',
                    title: 'EmreTurbo seni takip etti',
                    body: '',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emreTurbo',
                    read: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                },
                {
                    id: '4',
                    type: 'like',
                    title: 'Araç fotoğrafın beğenildi',
                    body: '5 kişi beğendi',
                    read: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                },
                {
                    id: '5',
                    type: 'system',
                    title: 'Hoş geldin!',
                    body: 'Sinyaldeyiz ailesine katıldın',
                    read: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'signal': return '📡';
            case 'message': return '💬';
            case 'follow': return '👤';
            case 'like': return '❤️';
            case 'system': return '🔔';
            default: return '📢';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 1000 * 60) return 'Az önce';
        if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))} dk önce`;
        if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))} saat önce`;
        return `${Math.floor(diff / (1000 * 60 * 60 * 24))} gün önce`;
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">
                            Bildirimler
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-yellow-400 text-sm">{unreadCount} okunmamış</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all text-sm"
                        >
                            Tümünü oku
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-xl border transition-all ${notification.read
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-yellow-400/10 border-yellow-400/30'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {notification.avatar ? (
                                        <img
                                            src={notification.avatar}
                                            alt=""
                                            className="w-10 h-10 rounded-full bg-white/10"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                            {getIcon(notification.type)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white">
                                            {notification.title}
                                        </p>
                                        {notification.body && (
                                            <p className="text-sm text-white/60 mt-0.5">
                                                {notification.body}
                                            </p>
                                        )}
                                        <p className="text-xs text-white/40 mt-1">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🔕</span>
                        <p className="text-white/60">Henüz bildirim yok</p>
                    </div>
                )}
            </div>
        </div>
    );
}
