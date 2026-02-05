/**
 * InsufficientFundsModal.jsx
 * 
 * Modal que se muestra cuando el usuario no tiene suficientes tokens BEZ
 * para realizar una acción (crear DAO, donar, etc.)
 * 
 * Características:
 * - Muestra saldo actual vs. requerido
 * - Botón directo para comprar tokens
 * - Callback para continuar acción después de compra
 * - Diseño atractivo con animaciones
 * 
 * Ubicación: frontend/src/components/modals/InsufficientFundsModal.jsx
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle, FaCoins, FaArrowRight } from 'react-icons/fa';
import BuyBezCoinModal from './BuyBezCoinModal';

const InsufficientFundsModal = ({
    isOpen,
    onClose,
    requiredAmount,
    currentBalance,
    actionName,
    onPurchaseComplete
}) => {
    const [showBuyModal, setShowBuyModal] = useState(false);

    const shortfall = parseFloat(requiredAmount) - parseFloat(currentBalance);

    const handleBuyClick = () => {
        setShowBuyModal(true);
    };

    const handleBuyModalClose = () => {
        setShowBuyModal(false);
        // Si se completó la compra, ejecutar callback y cerrar
        if (onPurchaseComplete) {
            onPurchaseComplete();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FaExclamationTriangle className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Fondos Insuficientes
                                    </h2>
                                    <p className="text-white/80 text-sm">
                                        Necesitas más BEZ tokens
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Action Info */}
                            <div className="text-center">
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    Para realizar la acción:
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {actionName || 'Esta acción'}
                                </p>
                            </div>

                            {/* Balance Comparison */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Tu balance actual:
                                    </span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FaCoins className="text-yellow-500" />
                                        {parseFloat(currentBalance).toFixed(2)} BEZ
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Cantidad requerida:
                                    </span>
                                    <span className="text-lg font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                        <FaCoins className="text-orange-500" />
                                        {parseFloat(requiredAmount).toFixed(2)} BEZ
                                    </span>
                                </div>

                                <div className="border-t-2 border-gray-300 dark:border-gray-500 pt-3 flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                        Te faltan:
                                    </span>
                                    <span className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <FaCoins className="text-red-500" />
                                        {shortfall.toFixed(2)} BEZ
                                    </span>
                                </div>
                            </div>

                            {/* Info Message */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    💡 <strong>Tip:</strong> Puedes comprar tokens BEZ con ETH o tarjeta de crédito/débito de forma rápida y segura.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleBuyClick}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <FaCoins />
                                    Comprar BEZ Tokens
                                    <FaArrowRight />
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Los tokens comprados estarán disponibles inmediatamente después de la confirmación de la transacción.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* Buy Modal */}
            <BuyBezCoinModal
                isOpen={showBuyModal}
                onClose={handleBuyModalClose}
            />
        </>
    );
};

export default InsufficientFundsModal;
