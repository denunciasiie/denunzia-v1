import React, { useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000); // 3 segundos

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex items-center justify-center z-[10000]">
            {/* Logo animado */}
            <div className="flex flex-col items-center">
                <img
                    src="/denunzia_logo.png"
                    alt="DenunZIA Logo"
                    className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]"
                />
                <h1 className="text-white text-2xl md:text-3xl font-heading font-bold mt-6 tracking-wide">
                    DENUNCIA
                </h1>
            </div>
        </div>
    );
};
