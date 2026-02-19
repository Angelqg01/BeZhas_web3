import React from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { ShieldCheck, X, ArrowRight, Wallet } from 'lucide-react';

const ConnectWalletModal = ({ isOpen, onClose, onSkip }) => {
    const { open } = useWeb3Modal();
    const { isConnected } = useAccount();

    if (!isOpen) return null;

    if (isConnected) {
        return null; // Don't show if already connected (or handle as "Success" state)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative bg-[#0f0f16] border border-purple-500/20 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scaleUp">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full mb-6 border border-purple-500/30 relative">
                        <Wallet className="w-10 h-10 text-purple-400" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-[#0f0f16]">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-display font-bold text-white mb-3">
                        Desbloquea el Poder de la Web3
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Has creado tu cuenta exitosamente. Para acceder a pagos instantáneos, RWA y finanzas DeFi, conecta tu billetera digital.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => open()}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-3 group"
                    >
                        <Wallet className="w-6 h-6" />
                        Conectar Billetera Ahora
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onSkip}
                        className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-medium transition-colors text-sm"
                    >
                        Lo haré más tarde
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">
                        Al conectar tu wallet, aceptas firmar una transacción gratuita para verificar tu identidad en la Blockchain.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletModal;
