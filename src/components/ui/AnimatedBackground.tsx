'use client';

/**
 * AnimatedBackground - Giriş sayfası teması
 * ThreeBackground yerine hafif CSS animasyonları kullanır
 * Performanslı ve reduced-motion desteği var
 */
export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

            {/* Animated Glassmorphism Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-[120px] animate-blob" />
            <div className="absolute top-[30%] right-[-15%] w-[45vw] h-[45vw] bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                        style={{
                            left: `${(i * 7) % 100}%`,
                            top: `${(i * 13) % 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${5 + (i % 5)}s`,
                        }}
                    />
                ))}
            </div>

            {/* Subtle Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -30px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(30px, 10px) scale(1.05); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
                    50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
                }
                .animate-blob {
                    animation: blob 20s infinite ease-in-out;
                }
                .animate-float {
                    animation: float 6s infinite ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-blob, .animate-float {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}
