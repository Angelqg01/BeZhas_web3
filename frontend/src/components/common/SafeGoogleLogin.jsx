import React, { useState, useEffect } from 'react';
import { GoogleLogin, hasGrantedAllScopesGoogle } from '@react-oauth/google';

/**
 * SafeGoogleLogin - Wrapper seguro para GoogleLogin
 * Maneja el caso cuando GoogleOAuthProvider no está disponible o no hay clientId
 */
const SafeGoogleLogin = ({
    onSuccess,
    onError,
    useOneTap = false,
    type = "standard",
    theme = "filled_blue",
    size = "large",
    text = "continue_with",
    shape = "rectangular",
    logo_alignment = "left",
    width = "100%",
    ...props
}) => {
    const [isGoogleAvailable, setIsGoogleAvailable] = useState(true);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        // Verificar si Google OAuth está disponible
        if (!clientId) {
            setIsGoogleAvailable(false);
        }
    }, [clientId]);

    // Si no hay clientId configurado, mostrar botón alternativo
    if (!isGoogleAvailable) {
        return (
            <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg cursor-not-allowed text-sm font-medium text-gray-400 opacity-60"
                title="Google OAuth no configurado"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google no disponible
            </button>
        );
    }

    // Renderizar GoogleLogin normal con manejo de errores
    try {
        return (
            <GoogleLogin
                onSuccess={onSuccess}
                onError={(error) => {
                    console.warn('Google Login error:', error);
                    if (onError) onError(error);
                }}
                useOneTap={useOneTap}
                type={type}
                theme={theme}
                size={size}
                text={text}
                shape={shape}
                logo_alignment={logo_alignment}
                width={width}
                {...props}
            />
        );
    } catch (error) {
        // Si GoogleLogin lanza error (no hay provider), mostrar botón alternativo
        console.warn('GoogleLogin not available:', error);
        return (
            <button
                type="button"
                onClick={() => onError && onError('Google OAuth no configurado')}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
            </button>
        );
    }
};

export default SafeGoogleLogin;
