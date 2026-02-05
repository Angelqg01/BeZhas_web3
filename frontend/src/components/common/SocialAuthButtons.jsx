import React from 'react';
import SafeGoogleLogin from './SafeGoogleLogin';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function SocialAuthButtons({ onError, onSuccess }) {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await loginWithGoogle(credentialResponse.credential);
            if (onSuccess) onSuccess();
            navigate('/feed');
        } catch (err) {
            console.error(err);
            if (onError) onError(err.message || 'Error al iniciar sesión con Google');
        }
    };

    const handleGitHubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const scope = 'read:user user:email';

        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    };

    return (
        <div className="space-y-3">
            {/* Google Login */}
            <div className="w-full">
                <SafeGoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => onError && onError('Error al conectar con Google')}
                    useOneTap={false}
                    type="standard"
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="100%"
                />
            </div>

            {/* GitHub Login */}
            <button
                type="button"
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors text-sm font-medium text-white shadow-sm"
            >
                <FaGithub className="text-white text-lg" />
                Continuar con GitHub
            </button>
        </div>
    );
}
