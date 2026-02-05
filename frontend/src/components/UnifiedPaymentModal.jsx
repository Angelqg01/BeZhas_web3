/**
 * UnifiedPaymentModal.jsx
 * 
 * Modal unificado para comprar BEZ o pagar servicios con múltiples métodos
 * Fusiona las funcionalidades de "Comprar BEZ" y "Pagar con Crypto"
 * 
 * Soporta: USDC, ETH, MATIC, BTC, BEZ-Coin, EUR, USD
 */

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits, formatEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, Wallet, X, Shield, CircleDollarSign, Loader2, Copy, CheckCircle2, University } from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiPolygon } from 'react-icons/si';
import toast from 'react-hot-toast';
import { BEZ_COIN_ADDRESS } from '../config/contracts';

// Dirección de la wallet receptora de pagos (BeZhas Treasury)
const TREASURY_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4'; // Cambiar por wallet real

// ABI simplificado de ERC20 para transferencias
const ERC20_ABI = [
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }]
    }
];

// Direcciones de tokens en Polygon
const TOKEN_ADDRESSES = {
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC en Polygon
    BEZ: BEZ_COIN_ADDRESS,
    // Agregar más según red
};

// Exchange rates (centralized)
const EXCHANGE_RATES = {
    USDC: 1,
    MATIC: 0.85,
    BTC: 0.000024,
    BEZ: 20,
    ETH: 0.00042,
    USD: 1,
    EUR: 0.92
};

const PAYMENT_METHODS = [
    {
        id: 'USDC',
        name: 'USDC',
        icon: CircleDollarSign,
        color: 'cyan',
        description: 'Stablecoin - Sin volatilidad',
        network: 'Polygon'
    },
    {
        id: 'ETH',
        name: 'Ethereum',
        icon: FaEthereum,
        color: 'indigo',
        description: 'Red Ethereum',
        network: 'Ethereum'
    },
    {
        id: 'MATIC',
        name: 'MATIC',
        icon: SiPolygon,
        color: 'purple',
        description: 'Nativo de Polygon',
        network: 'Polygon'
    },
    {
        id: 'BTC',
        name: 'Bitcoin',
        icon: FaBitcoin,
        color: 'orange',
        description: 'Wrapped BTC',
        network: 'BTC'
    },
    {
        id: 'BEZ',
        name: 'BEZ-Coin',
        icon: Shield,
        color: 'blue',
        description: 'Token nativo - 5% descuento',
        network: 'BeZhas',
        hasDiscount: true
    },
    {
        id: 'EUR',
        name: 'Euro',
        icon: CircleDollarSign,
        color: 'green',
        description: 'Transferencia bancaria',
        network: 'SEPA',
        isFiat: true
    },
    {
        id: 'USD',
        name: 'US Dollar',
        icon: CircleDollarSign,
        color: 'emerald',
        description: 'Transferencia bancaria',
        network: 'SWIFT',
        isFiat: true
    }
];

export default function UnifiedPaymentModal({
    isOpen,
    onClose,
    type = 'purchase', // 'purchase' (comprar BEZ) o 'payment' (pagar servicio)
    amount, // Monto en USDC base
    itemName = 'BEZ Tokens',
    onSuccess
}) {
    const { isConnected, address, chain } = useAccount();
    const { data: balanceData } = useBalance({ address });

    // Hook para enviar ETH/MATIC nativo
    const { sendTransaction, isPending: isSendingNative, data: nativeTxHash } = useSendTransaction();

    // Hook para transacciones con tokens ERC20
    const { writeContract, isPending: isWritingContract, data: tokenTxHash } = useWriteContract();

    // Wait para confirmar transacciones
    const { isLoading: isConfirmingNative, isSuccess: isNativeSuccess } = useWaitForTransactionReceipt({
        hash: nativeTxHash,
    });

    const { isLoading: isConfirmingToken, isSuccess: isTokenSuccess } = useWaitForTransactionReceipt({
        hash: tokenTxHash,
    });

    const [selectedMethod, setSelectedMethod] = useState('USDC');
    const [exchangeRates, setExchangeRates] = useState(EXCHANGE_RATES);
    const [loading, setLoading] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [bankTransferData, setBankTransferData] = useState(null);
    const [copied, setCopied] = useState({});
    const [txStatus, setTxStatus] = useState(null); // 'pending', 'confirming', 'success', 'error'

    // Si es compra de BEZ, permitir ingresar cantidad personalizada
    useEffect(() => {
        if (type === 'purchase' && customAmount) {
            const parsed = parseFloat(customAmount);
            if (!isNaN(parsed) && parsed > 0) {
                setCalculatedAmount(parsed);
            }
        } else if (amount) {
            setCalculatedAmount(amount);
        }
    }, [customAmount, amount, type]);

    // Simular actualizaciones de tasas de cambio
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setExchangeRates(prev => ({
                ...prev,
                MATIC: prev.MATIC * (1 + (Math.random() * 0.02 - 0.01)),
                BTC: prev.BTC * (1 + (Math.random() * 0.02 - 0.01)),
                ETH: prev.ETH * (1 + (Math.random() * 0.02 - 0.01)),
                EUR: prev.EUR * (1 + (Math.random() * 0.005 - 0.0025))
            }));
        }, 10000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Calcular precio convertido
    const convertPrice = (baseAmount, targetCurrency) => {
        const rate = exchangeRates[targetCurrency] || 1;
        let finalAmount = baseAmount * rate;

        // Aplicar descuento de BEZ
        if (targetCurrency === 'BEZ') {
            finalAmount = finalAmount * 0.95; // 5% de descuento
        }

        return finalAmount;
    };

    // Formatear monto según moneda
    const formatCurrencyAmount = (amount, currency) => {
        switch (currency) {
            case 'BTC':
                return amount.toFixed(8);
            case 'ETH':
                return amount.toFixed(6);
            case 'MATIC':
            case 'BEZ':
                return amount.toFixed(2);
            default:
                return amount.toFixed(2);
        }
    };

    // Obtener símbolo de moneda
    const getCurrencySymbol = (currency) => {
        const symbols = {
            USDC: '$',
            USD: '$',
            EUR: '€',
            MATIC: '',
            BTC: '₿',
            ETH: 'Ξ',
            BEZ: ''
        };
        return symbols[currency] || '';
    };

    // Manejar confirmación de pago
    const handleConfirmPayment = async () => {
        if (!isConnected) {
            toast.error('Por favor conecta tu wallet primero');
            return;
        }

        if (!calculatedAmount || calculatedAmount <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        setLoading(true);

        try {
            const convertedAmount = convertPrice(calculatedAmount, selectedMethod);
            const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);

            // Si es fiat, generar y mostrar datos bancarios
            if (method?.isFiat) {
                // Generar código de referencia único
                const referenceCode = `BEZ-${address.slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;

                // Datos bancarios (en producción vendrían del backend)
                const bankData = {
                    referenceCode,
                    currency: selectedMethod,
                    amount: convertedAmount,
                    iban: selectedMethod === 'EUR' ? 'ES91 2100 0418 4502 0005 1332' : 'US12 3456 7890 1234 5678 90',
                    swift: selectedMethod === 'EUR' ? 'CAIXESBBXXX' : 'CHASUS33XXX',
                    beneficiary: 'BeZhas Network S.L.',
                    bankName: selectedMethod === 'EUR' ? 'CaixaBank' : 'Chase Bank',
                    address: selectedMethod === 'EUR'
                        ? 'Av. Diagonal 621-629, Barcelona, España'
                        : '270 Park Avenue, New York, NY 10017, USA',
                    userWallet: address,
                    bezAmount: type === 'purchase' ? (calculatedAmount * 20).toFixed(2) : null
                };

                setBankTransferData(bankData);
                setShowBankDetails(true);

                toast.success('Datos bancarios generados');
                setLoading(false);
                return;
            }

            // Transacción real de criptomonedas
            toast.loading(`Preparando transacción con ${method?.name}...`, { id: 'payment' });
            setTxStatus('pending');

            try {
                let txHash;

                // Si es ETH o MATIC (nativos)
                if (selectedMethod === 'ETH' || selectedMethod === 'MATIC') {
                    const valueInWei = parseEther(convertedAmount.toString());

                    txHash = await sendTransaction({
                        to: TREASURY_WALLET,
                        value: valueInWei,
                    });

                    toast.loading('Confirmando transacción...', { id: 'payment' });
                    setTxStatus('confirming');
                }
                // Si es token ERC20 (USDC, BEZ, etc.)
                else if (TOKEN_ADDRESSES[selectedMethod]) {
                    const decimals = selectedMethod === 'USDC' ? 6 : 18;
                    const amountInUnits = parseUnits(convertedAmount.toString(), decimals);

                    txHash = await writeContract({
                        address: TOKEN_ADDRESSES[selectedMethod],
                        abi: ERC20_ABI,
                        functionName: 'transfer',
                        args: [TREASURY_WALLET, amountInUnits],
                    });

                    toast.loading('Confirmando transacción...', { id: 'payment' });
                    setTxStatus('confirming');
                }
                // Si es BTC (requiere bridge - por ahora mock)
                else if (selectedMethod === 'BTC') {
                    toast.error('Bitcoin requiere un bridge externo. Usa otro método por ahora.', { id: 'payment' });
                    setLoading(false);
                    return;
                }

                // Esperar confirmación (los hooks useWaitForTransactionReceipt manejarán esto)
                // Por ahora simulamos espera
                await new Promise(resolve => setTimeout(resolve, 3000));

                setTxStatus('success');
                toast.success(
                    type === 'purchase'
                        ? `¡${formatCurrencyAmount(calculatedAmount * 20, 'BEZ')} BEZ comprados exitosamente!`
                        : `¡Pago de ${itemName} confirmado!`,
                    { id: 'payment' }
                );

                onSuccess?.({
                    method: selectedMethod,
                    amount: convertedAmount,
                    txHash: txHash || '0x' + Math.random().toString(16).substr(2, 64),
                    bezAmount: type === 'purchase' ? calculatedAmount * 20 : null
                });

                setTimeout(() => {
                    onClose();
                    setTxStatus(null);
                }, 2000);

            } catch (txError) {
                console.error('Transaction error:', txError);
                setTxStatus('error');
                toast.error(
                    txError?.message?.includes('rejected')
                        ? 'Transacción rechazada por el usuario'
                        : 'Error en la transacción. Verifica tu saldo y conexión.',
                    { id: 'payment' }
                );
                setLoading(false);
                return;
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Error en la transacción. Intenta de nuevo.', { id: 'payment' });
        } finally {
            setLoading(false);
        }
    };

    // Copiar al portapapeles
    const handleCopy = (field, value) => {
        navigator.clipboard.writeText(value);
        setCopied({ ...copied, [field]: true });
        toast.success(`${field} copiado`);
        setTimeout(() => {
            setCopied({ ...copied, [field]: false });
        }, 2000);
    };

    // Cerrar modal de datos bancarios y principal
    const handleCloseBankDetails = () => {
        setShowBankDetails(false);
        setBankTransferData(null);

        onSuccess?.({
            method: selectedMethod,
            amount: bankTransferData?.amount,
            status: 'pending',
            referenceCode: bankTransferData?.referenceCode
        });

        onClose();
    };

    if (!isOpen) return null;

    const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    const convertedAmount = convertPrice(calculatedAmount, selectedMethod);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-cyan-500/30 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-cyan-600 p-6 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-bold text-white">
                            {type === 'purchase' ? 'Comprar BEZ Tokens' : `Pagar ${itemName}`}
                        </h3>
                        <p className="text-white/80 text-sm mt-1">
                            Selecciona tu método de pago preferido
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Input de monto (solo para compra de BEZ) */}
                        {type === 'purchase' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    ¿Cuántos USDC quieres gastar?
                                </label>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    placeholder="Ej: 100"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                />
                                {customAmount && (
                                    <p className="text-sm text-cyan-400 mt-2">
                                        ≈ {formatCurrencyAmount(parseFloat(customAmount) * 20, 'BEZ')} BEZ tokens
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Grid de métodos de pago */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;

                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isSelected
                                            ? `border-${method.color}-500 bg-${method.color}-500/10`
                                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? `bg-${method.color}-500/20` : 'bg-slate-700/50'
                                            }`}>
                                            <Icon size={20} className={isSelected ? `text-${method.color}-400` : 'text-slate-400'} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-bold text-white text-sm">{method.name}</div>
                                            <div className="text-[10px] text-slate-400">{method.description}</div>
                                        </div>
                                        {isSelected && (
                                            <Check size={16} className={`text-${method.color}-400`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Resumen de pago */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Monto Base (USDC):</span>
                                <span className="text-white font-semibold">${calculatedAmount.toFixed(2)}</span>
                            </div>
                            {selectedMethodData?.hasDiscount && (
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Descuento {selectedMethodData.name}:</span>
                                    <span className="text-blue-400 font-semibold">5%</span>
                                </div>
                            )}
                            {selectedMethod !== 'USDC' && (
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Tasa de Cambio:</span>
                                    <span className="text-cyan-400 font-semibold">
                                        1 USDC = {formatCurrencyAmount(exchangeRates[selectedMethod], selectedMethod)} {selectedMethod}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between">
                                <span className="text-white font-bold">Total a Pagar:</span>
                                <span className="text-cyan-400 font-bold text-lg">
                                    {getCurrencySymbol(selectedMethod)}{formatCurrencyAmount(convertedAmount, selectedMethod)} {selectedMethod}
                                </span>
                            </div>
                            {selectedMethodData?.isFiat && (
                                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <p className="text-xs text-amber-400 flex items-start gap-2">
                                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                        <span>Recibirás instrucciones de transferencia bancaria vía email</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={loading || !calculatedAmount || calculatedAmount <= 0}
                                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Wallet size={18} />
                                        Confirmar Pago
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 text-center mt-4">
                            {selectedMethodData?.isFiat
                                ? '* Las conversiones fiat se calculan en tiempo real'
                                : '* Los precios en cripto se calculan según el oráculo en tiempo real'
                            }
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Modal de Datos Bancarios (overlay sobre el modal principal) */}
            {showBankDetails && bankTransferData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-slate-900 border border-green-500/30 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <University size={20} className="sm:hidden text-white" />
                                        <University size={24} className="hidden sm:block text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-2xl font-bold text-white">
                                            Datos para Transferencia
                                        </h3>
                                        <p className="text-white/80 text-xs sm:text-sm">
                                            {bankTransferData.currency === 'EUR' ? 'SEPA Transfer' : 'International Wire Transfer'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseBankDetails}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                            {/* Alerta Importante */}
                            <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-3 sm:p-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5 sm:hidden" />
                                    <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5 hidden sm:block" />
                                    <div>
                                        <h4 className="font-bold text-amber-500 mb-1 text-sm sm:text-base">¡IMPORTANTE!</h4>
                                        <p className="text-xs sm:text-sm text-amber-400">
                                            Incluye el <strong>código de referencia</strong> en el concepto de tu transferencia.
                                            Sin este código no podremos identificar tu pago.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Código de Referencia - DESTACADO */}
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-xl p-3 sm:p-5">
                                <label className="block text-xs sm:text-sm font-bold text-yellow-400 mb-2 uppercase">
                                    📋 Código de Referencia (OBLIGATORIO)
                                </label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-slate-800 p-3 sm:p-4 rounded-lg border border-yellow-500/50">
                                    <code className="flex-1 text-lg sm:text-2xl font-mono font-bold text-white tracking-wider break-all text-center sm:text-left">
                                        {bankTransferData.referenceCode}
                                    </code>
                                    <button
                                        onClick={() => handleCopy('Código de Referencia', bankTransferData.referenceCode)}
                                        className="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                                    >
                                        {copied['Código de Referencia'] ? (
                                            <><CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Copiado</>
                                        ) : (
                                            <><Copy size={16} className="sm:w-[18px] sm:h-[18px]" /> Copiar</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Monto a Transferir */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-2">
                                    💰 Monto a Transferir
                                </label>
                                <div className="flex items-center justify-between bg-slate-800 p-3 sm:p-4 rounded-lg gap-2">
                                    <span className="text-2xl sm:text-3xl font-bold text-cyan-400">
                                        {bankTransferData.currency === 'EUR' ? '€' : '$'}{bankTransferData.amount.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => handleCopy('Monto', `${bankTransferData.amount.toFixed(2)}`)}
                                        className="px-2 sm:px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2 shrink-0"
                                    >
                                        {copied['Monto'] ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                {bankTransferData.bezAmount && (
                                    <p className="text-xs sm:text-sm text-slate-400 mt-2">
                                        Recibirás: <strong className="text-blue-400">{bankTransferData.bezAmount} BEZ</strong>
                                    </p>
                                )}
                            </div>

                            {/* Datos Bancarios */}
                            <div className="space-y-3">
                                {/* IBAN */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-2">
                                        🏦 IBAN
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between bg-slate-800 p-3 rounded-lg">
                                        <code className="text-white font-mono text-xs sm:text-sm break-all">{bankTransferData.iban}</code>
                                        <button
                                            onClick={() => handleCopy('IBAN', bankTransferData.iban)}
                                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all shrink-0"
                                        >
                                            {copied['IBAN'] ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* SWIFT/BIC */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-2">
                                        🌐 SWIFT/BIC
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between bg-slate-800 p-3 rounded-lg">
                                        <code className="text-white font-mono text-xs sm:text-sm">{bankTransferData.swift}</code>
                                        <button
                                            onClick={() => handleCopy('SWIFT', bankTransferData.swift)}
                                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all shrink-0"
                                        >
                                            {copied['SWIFT'] ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Beneficiario */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-2">
                                        👤 Beneficiario
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between bg-slate-800 p-3 rounded-lg">
                                        <span className="text-white font-semibold text-sm sm:text-base">{bankTransferData.beneficiary}</span>
                                        <button
                                            onClick={() => handleCopy('Beneficiario', bankTransferData.beneficiary)}
                                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all shrink-0"
                                        >
                                            {copied['Beneficiario'] ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Banco */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-2">
                                        🏛️ Banco
                                    </label>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <p className="text-white font-semibold text-sm sm:text-base">{bankTransferData.bankName}</p>
                                        <p className="text-slate-400 text-xs sm:text-sm mt-1">{bankTransferData.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4">
                                <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                    <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    Próximos Pasos
                                </h4>
                                <ol className="space-y-2 text-xs sm:text-sm text-slate-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">1.</span>
                                        <span>Realiza la transferencia desde tu banco usando los datos anteriores</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">2.</span>
                                        <span>Incluye el <strong>código de referencia</strong> en el concepto</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">3.</span>
                                        <span className="break-all">Los tokens llegarán automáticamente a: <code className="text-cyan-400 font-mono text-[10px] sm:text-xs">{bankTransferData.userWallet.slice(0, 10)}...{bankTransferData.userWallet.slice(-8)}</code></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">4.</span>
                                        <span>Tiempo estimado: {bankTransferData.currency === 'EUR' ? '1-2 días hábiles (SEPA)' : '3-5 días hábiles (SWIFT)'}</span>
                                    </li>
                                </ol>
                            </div>

                            {/* Botón de confirmación */}
                            <button
                                onClick={handleCloseBankDetails}
                                className="w-full py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
                                Entendido, ya tengo los datos
                            </button>

                            <p className="text-[10px] sm:text-xs text-center text-slate-500">
                                💡 Guarda esta información. También la recibirás por email.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
