import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import BuyTokensButton from './BuyTokensButton';

/**
 * TokenPurchaseModal - Modal completo para compra de tokens BEZ
 * Incluye selector de cantidad, cálculo de precio, y botón de pago
 */
const TokenPurchaseModal = ({ isOpen, onClose }) => {
    const { address, isConnected } = useAccount();
    const [tokenAmount, setTokenAmount] = useState(100);

    const PRICE_PER_TOKEN = 0.10; // $0.10 USD por token
    const MIN_PURCHASE = 10;
    const MAX_PURCHASE = 10000;

    // Paquetes predefinidos con descuento
    const packages = [
        { amount: 100, bonus: 0, label: 'Starter' },
        { amount: 500, bonus: 25, label: 'Pro' },
        { amount: 1000, bonus: 100, label: 'Business' },
        { amount: 5000, bonus: 750, label: 'Enterprise' }
    ];

    const totalTokens = tokenAmount;
    const totalPrice = (tokenAmount * PRICE_PER_TOKEN).toFixed(2);

    const handleAmountChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value >= MIN_PURCHASE && value <= MAX_PURCHASE) {
            setTokenAmount(value);
        }
    };

    const selectPackage = (pkg) => {
        setTokenAmount(pkg.amount + pkg.bonus);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Comprar Tokens BEZ
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Wallet Status */}
                    {!isConnected ? (
                        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                            <p className="text-yellow-400 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Conecta tu wallet para continuar
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                            <p className="text-green-400 flex items-center text-sm">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Wallet conectada: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                        </div>
                    )}

                    {/* Packages */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">Paquetes Populares</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.amount}
                                    onClick={() => selectPackage(pkg)}
                                    className={`
                                        p-4 rounded-lg border-2 transition-all
                                        ${tokenAmount === pkg.amount + pkg.bonus
                                            ? 'border-blue-500 bg-blue-900/30'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }
                                    `}
                                >
                                    <div className="text-white font-semibold">{pkg.label}</div>
                                    <div className="text-2xl text-blue-400 font-bold my-1">
                                        {pkg.amount + pkg.bonus} BEZ
                                    </div>
                                    {pkg.bonus > 0 && (
                                        <div className="text-green-400 text-sm">
                                            +{pkg.bonus} Bonus
                                        </div>
                                    )}
                                    <div className="text-gray-400 text-sm mt-1">
                                        ${(pkg.amount * PRICE_PER_TOKEN).toFixed(2)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div>
                        <label className="text-white font-semibold mb-2 block">
                            Cantidad Personalizada
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min={MIN_PURCHASE}
                                max={MAX_PURCHASE}
                                value={tokenAmount}
                                onChange={handleAmountChange}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Cantidad de tokens"
                            />
                            <span className="text-gray-400 font-semibold">BEZ</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Mínimo: {MIN_PURCHASE} BEZ | Máximo: {MAX_PURCHASE} BEZ
                        </p>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-gray-400">
                            <span>Cantidad de tokens:</span>
                            <span className="font-semibold">{totalTokens} BEZ</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Precio por token:</span>
                            <span>${PRICE_PER_TOKEN}</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 mt-2"></div>
                        <div className="flex justify-between text-white text-xl font-bold">
                            <span>Total:</span>
                            <span className="text-blue-400">${totalPrice} USD</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                        <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ¿Cómo funciona?
                        </h4>
                        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                            <li>Haz clic en "Proceder al Pago"</li>
                            <li>Completa el pago con tarjeta en Stripe (seguro)</li>
                            <li>Los tokens se enviarán automáticamente a tu wallet</li>
                            <li>Recibirás una notificación cuando estén disponibles</li>
                        </ol>
                    </div>

                    {/* Buy Button */}
                    <BuyTokensButton
                        tokenAmount={tokenAmount}
                        customClass="w-full text-lg py-4"
                    />

                    {/* Cancel Button */}
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenPurchaseModal;
