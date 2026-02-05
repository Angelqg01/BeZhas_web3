import React, { useState } from 'react';
import BankTransferModal from './BankTransferModal';
import { CreditCard, Building2, Wallet } from 'lucide-react';

/**
 * BuyBezOptions Component
 * Main component that displays all available methods to purchase BEZ tokens
 * Can be integrated in the Wallet page, Dashboard, or as a standalone page
 */
const BuyBezOptions = () => {
    const [showBankTransfer, setShowBankTransfer] = useState(false);
    const [showCryptoSwap, setShowCryptoSwap] = useState(false);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Buy BEZ Tokens</h2>
                <p className="text-gray-400">Choose your preferred payment method</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Option 1: Bank Transfer (Fiat) */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition cursor-pointer"
                    onClick={() => setShowBankTransfer(true)}>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Building2 className="text-purple-400" size={32} />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Bank Transfer</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Pay with EUR via SEPA transfer. Best for large purchases.
                            </p>
                        </div>

                        <div className="w-full space-y-2 text-xs text-gray-300">
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Processing Time:</span>
                                <span className="font-semibold">1-24 hours</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Gas Fees:</span>
                                <span className="font-semibold text-green-400">FREE ✓</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Min Amount:</span>
                                <span className="font-semibold">10 EUR</span>
                            </div>
                        </div>

                        <button className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-bold transition">
                            Pay with Bank
                        </button>
                    </div>
                </div>

                {/* Option 2: Crypto Swap (Native DEX) */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition cursor-pointer"
                    onClick={() => setShowCryptoSwap(true)}>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Wallet className="text-blue-400" size={32} />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Crypto Swap</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Swap MATIC or USDC instantly. No intermediaries.
                            </p>
                        </div>

                        <div className="w-full space-y-2 text-xs text-gray-300">
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Processing Time:</span>
                                <span className="font-semibold">Instant</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Gas Fees:</span>
                                <span className="font-semibold text-yellow-400">~$0.01</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Available:</span>
                                <span className="font-semibold">24/7</span>
                            </div>
                        </div>

                        <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition">
                            Swap Now
                        </button>
                    </div>
                </div>

                {/* Option 3: Credit Card (Coming Soon - Transak/MoonPay) */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 opacity-60 relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        COMING SOON
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center">
                            <CreditCard className="text-green-400" size={32} />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Credit Card</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Buy instantly with Visa/Mastercard via Transak.
                            </p>
                        </div>

                        <div className="w-full space-y-2 text-xs text-gray-300">
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Processing Time:</span>
                                <span className="font-semibold">5 minutes</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">Fees:</span>
                                <span className="font-semibold">~3-5%</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-700">
                                <span className="text-gray-400">KYC:</span>
                                <span className="font-semibold">Required</span>
                            </div>
                        </div>

                        <button className="w-full bg-gray-600 py-3 rounded-lg font-bold cursor-not-allowed">
                            Coming Q2 2026
                        </button>
                    </div>
                </div>
            </div>

            {/* Bank Transfer Modal */}
            <BankTransferModal
                isOpen={showBankTransfer}
                onClose={() => setShowBankTransfer(false)}
            />

            {/* Crypto Swap Modal (To be implemented separately) */}
            {showCryptoSwap && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full text-white">
                        <h2 className="text-xl font-bold mb-4">Crypto Swap</h2>
                        <p className="text-gray-400 mb-4">
                            This feature will connect to your internal TokenVendor smart contract.
                        </p>
                        <button
                            onClick={() => setShowCryptoSwap(false)}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyBezOptions;
