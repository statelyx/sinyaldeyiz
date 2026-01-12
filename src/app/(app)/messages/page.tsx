'use client';

import { useState } from 'react';

interface Message {
    id: string;
    sender: {
        id: string;
        nickname: string;
        avatar: string;
        is_online: boolean;
    };
    lastMessage: string;
    unread: number;
    timestamp: string;
}

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);

    // Demo conversations
    const conversations: Message[] = [
        {
            id: '1',
            sender: {
                id: 'user1',
                nickname: 'AhmetR34',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmetR34',
                is_online: true,
            },
            lastMessage: 'Yarın akşam cruise var mısın?',
            unread: 2,
            timestamp: '5 dk önce',
        },
        {
            id: '2',
            sender: {
                id: 'user2',
                nickname: 'ZeynepM3',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynepM3',
                is_online: true,
            },
            lastMessage: 'Arabanı çok beğendim 🔥',
            unread: 0,
            timestamp: '1 saat önce',
        },
        {
            id: '3',
            sender: {
                id: 'user3',
                nickname: 'EmreTurbo',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emreTurbo',
                is_online: false,
            },
            lastMessage: 'Bağdat caddesinde buluşalım',
            unread: 0,
            timestamp: 'Dün',
        },
        {
            id: '4',
            sender: {
                id: 'user4',
                nickname: 'SelimRider',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=selimRider',
                is_online: false,
            },
            lastMessage: 'Motor grubuna katılır mısın?',
            unread: 1,
            timestamp: '2 gün önce',
        },
    ];

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-1">
                        Mesajlar
                    </h1>
                    {totalUnread > 0 && (
                        <p className="text-yellow-400 text-sm">{totalUnread} okunmamış mesaj</p>
                    )}
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Sohbet ara..."
                            className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/50"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Conversations */}
                <div className="space-y-2">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedChat(conv.id)}
                            className={`w-full p-4 rounded-xl border transition-all text-left ${selectedChat === conv.id
                                    ? 'bg-yellow-400/10 border-yellow-400/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={conv.sender.avatar}
                                        alt={conv.sender.nickname}
                                        className="w-12 h-12 rounded-full bg-white/10"
                                    />
                                    {conv.sender.is_online && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-bold text-white truncate">
                                            {conv.sender.nickname}
                                        </h3>
                                        <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                                            {conv.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/60 truncate">
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unread > 0 && (
                                    <span className="w-6 h-6 rounded-full bg-yellow-400 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {conv.unread}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {conversations.length === 0 && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">💬</span>
                        <p className="text-white/60">Henüz mesaj yok</p>
                        <p className="text-white/40 text-sm mt-2">Sürücülerle sohbet etmeye başla!</p>
                    </div>
                )}

                {/* New Message FAB */}
                <button className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-xl shadow-yellow-500/30 flex items-center justify-center text-black hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
