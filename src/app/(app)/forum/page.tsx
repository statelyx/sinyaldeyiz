'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/supabase-provider'

interface ForumPost {
    id: string
    author: string
    avatar: string
    content: string
    timestamp: string
    likes: number
    comments: number
    tags: string[]
}

// Mock forum data
const MOCK_POSTS: ForumPost[] = [
    {
        id: '1',
        author: 'BMWFan34',
        avatar: '👨‍🦱',
        content: 'Bugün M Performans fren kaliperleri taktırdım, harika sonuç! Fren hissi çok daha keskin oldu. Tavsiye ederim! 🔥',
        timestamp: '2 saat önce',
        likes: 24,
        comments: 8,
        tags: ['BMW', 'Modifikasyon']
    },
    {
        id: '2',
        author: 'MercedesStar',
        avatar: '👩‍🦰',
        content: 'Bu hafta sonu Sapanca sürüşüne kim katılmak ister? Güzel bir konvoy organize edelim! 🚗💨',
        timestamp: '4 saat önce',
        likes: 56,
        comments: 23,
        tags: ['Etkinlik', 'Konvoy']
    },
    {
        id: '3',
        author: 'TeslaDriver',
        avatar: '👨‍💻',
        content: 'Tesla V12 yazılım güncellemesi geldi! Full Self Driving çok daha akıcı çalışıyor artık. Deneyimlerinizi paylaşın.',
        timestamp: '6 saat önce',
        likes: 89,
        comments: 45,
        tags: ['Tesla', 'Teknoloji']
    },
    {
        id: '4',
        author: 'AudiQuattro',
        avatar: '🧔',
        content: 'Quattro sisteminin kar performansı efsane! Bugün dağda test ettim, kayma yok. 4x4 aşkına! ❄️',
        timestamp: '8 saat önce',
        likes: 67,
        comments: 19,
        tags: ['Audi', 'Kış Sürüşü']
    },
    {
        id: '5',
        author: 'PorscheLover',
        avatar: '👱‍♂️',
        content: '911 Turbo S ile 0-100 2.7 saniye yaptım! Video çekimini yarın paylaşacağım. 🏁',
        timestamp: '12 saat önce',
        likes: 156,
        comments: 67,
        tags: ['Porsche', 'Performans']
    },
]

const CATEGORIES = ['Tümü', 'Etkinlik', 'Modifikasyon', 'Teknik Yardım', 'Satılık', 'Sohbet']

export default function ForumPage() {
    const { profile } = useAuth()
    const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS)
    const [selectedCategory, setSelectedCategory] = useState('Tümü')
    const [newPost, setNewPost] = useState('')
    const [showNewPostForm, setShowNewPostForm] = useState(false)

    const handlePost = () => {
        if (!newPost.trim()) return

        const post: ForumPost = {
            id: Date.now().toString(),
            author: profile?.nickname || 'Kullanıcı',
            avatar: profile?.avatar_url || '👤',
            content: newPost,
            timestamp: 'Şimdi',
            likes: 0,
            comments: 0,
            tags: ['Sohbet']
        }

        setPosts([post, ...posts])
        setNewPost('')
        setShowNewPostForm(false)
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white">Forum 💬</h1>
                            <p className="text-slate-400 text-sm mt-1">Toplulukla sohbet et, paylaş, keşfet</p>
                        </div>
                        <button
                            onClick={() => setShowNewPostForm(true)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl"
                        >
                            + Paylaş
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Post Form */}
            {showNewPostForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Yeni Paylaşım</h3>
                            <button onClick={() => setShowNewPostForm(false)} className="text-slate-400 hover:text-white">
                                ✕
                            </button>
                        </div>
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Ne düşünüyorsun?"
                            className="w-full h-32 p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowNewPostForm(false)}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handlePost}
                                disabled={!newPost.trim()}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg disabled:opacity-50"
                            >
                                Paylaş
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Feed */}
            <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-slate-800 rounded-2xl border border-slate-700 p-4 lg:p-6 hover:border-slate-600 transition-all"
                    >
                        {/* Author */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl">
                                {post.avatar}
                            </div>
                            <div>
                                <p className="text-white font-medium">{post.author}</p>
                                <p className="text-slate-400 text-sm">{post.timestamp}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <p className="text-white text-lg mb-4">{post.content}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 pt-4 border-t border-slate-700">
                            <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
                                <span>❤️</span>
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                                <span>💬</span>
                                <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                                <span>🔗</span>
                                <span>Paylaş</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
