import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminLogin - Modo DEMO
 * Acceso directo sin autenticación para demostración
 */
export default function AdminLogin() {
    const navigate = useNavigate();

    const handleAccess = () => {
        // MODO DEMO: Acceso directo sin validación
        console.log('AdminLogin: MODO DEMO - Acceso directo permitido');

        // Set demo admin token
        localStorage.setItem('adminToken', 'demo-admin-token-123');
        // Also set jwt for other components if needed, but admin dashboard uses adminToken
        localStorage.setItem('bezhas-jwt', 'demo-admin-token-123');

        navigate('/admin');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                        Panel Admin BeZhas
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Modo Demo - Acceso directo
                    </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Modo Demostración
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                La autenticación está desactivada. En producción, se requiere login con credenciales válidas.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAccess}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                    🚀 Acceder al Panel Admin
                </button>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                        ← Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
