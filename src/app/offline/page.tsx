'use client'

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-6">📡</div>
                <h1 className="text-3xl font-bold text-white mb-4">
                    Bağlantı Yok
                </h1>
                <p className="text-white/60 mb-8">
                    İnternet bağlantınız kesilmiş görünüyor.
                    Lütfen bağlantınızı kontrol edip tekrar deneyin.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    Tekrar Dene
                </button>
            </div>
        </div>
    )
}
