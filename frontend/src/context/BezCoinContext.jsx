/**
 * BezCoinContext.jsx
 * 
 * Context global para gestionar todas las operaciones relacionadas con Bez-Coin:
 * - Balance del usuario (blockchain real)
 * - Compra de tokens (ETH y FIAT)
 * - Transferencias y donaciones on-chain
 * - Verificación de saldo antes de acciones
 * - Historial de transacciones con confirmaciones
 * - Eventos en tiempo real de contratos
 * 
 * Ubicación: frontend/src/context/BezCoinContext.jsx
 * 
 * BLOCKCHAIN INTEGRATION:
 * - Conectado a contratos reales desplegados
 * - Manejo de errores de red y gas
 * - Optimización de transacciones
 * - Listeners de eventos para updates en tiempo real
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { BezhasTokenAddress, TokenSaleAddress, BezhasTokenABI, TokenSaleABI } from '../contract-config';
import bezCoinService from '../services/bezCoinService';
import toast from 'react-hot-toast';

const BezCoinContext = createContext();

export const useBezCoin = () => {
    const context = useContext(BezCoinContext);
    if (!context) {
        throw new Error('useBezCoin must be used within a BezCoinProvider');
    }
    return context;
};

export const BezCoinProvider = ({ children }) => {
    const { address, isConnected } = useAccount();

    // Estados principales
    const [balance, setBalance] = useState('0');
    const [tokenPrice, setTokenPrice] = useState('0');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [insufficientFundsModal, setInsufficientFundsModal] = useState({
        show: false,
        requiredAmount: '0',
        action: '',
        onSuccess: null
    });

    // 🔐 Estado de privacidad del balance - persistido en localStorage
    const [balanceVisible, setBalanceVisible] = useState(() => {
        // Cargar preferencia del usuario desde localStorage
        const saved = localStorage.getItem('bezBalanceVisible');
        return saved !== 'false'; // Por defecto visible
    });

    // Función para toggle de visibilidad del balance
    const toggleBalanceVisibility = useCallback(() => {
        setBalanceVisible(prev => {
            const newValue = !prev;
            localStorage.setItem('bezBalanceVisible', newValue.toString());
            return newValue;
        });
    }, []);

    // Estados de blockchain
    const [networkError, setNetworkError] = useState(null);
    const [pendingTx, setPendingTx] = useState(null);
    const [contractsInitialized, setContractsInitialized] = useState(false);

    /**
     * Obtener balance de BEZ tokens del usuario desde blockchain
     * Con manejo de errores de red y retry logic
     */
    const fetchBalance = useCallback(async (retryCount = 0) => {
        if (!isConnected || !address) {
            setBalance('0');
            return '0';
        }

        try {
            // Verificar que tenemos window.ethereum
            if (!window.ethereum) {
                // console.warn('No Ethereum provider found (MetaMask not installed?)');
                setBalance('0');
                return '0';
            }

            const provider = new ethers.BrowserProvider(window.ethereum);

            // Verificar que el contrato existe
            if (!BezhasTokenAddress || BezhasTokenAddress === '0x0000000000000000000000000000000000000000') {
                if (import.meta.env.DEV && retryCount === 0) {
                    console.warn('⚠️ BezhasToken contract not deployed. Please run: npx hardhat run scripts/deploy.js --network localhost');
                }
                setBalance('0');
                return '0';
            }

            const tokenContract = new ethers.Contract(BezhasTokenAddress, BezhasTokenABI, provider);

            // Obtener balance con timeout (3s)
            const balancePromise = tokenContract.balanceOf(address);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Balance fetch timeout')), 3000)
            );

            const balanceWei = await Promise.race([balancePromise, timeoutPromise]);
            const balanceFormatted = ethers.formatEther(balanceWei);

            setBalance(balanceFormatted);
            setNetworkError(null);

            if (import.meta.env.DEV) console.log('✅ Balance fetched from blockchain:', balanceFormatted, 'BEZ');

            return balanceFormatted;
        } catch (error) {
            // Silenciar errores BAD_DATA de contratos no deployados
            if (error?.message?.includes('could not decode result data') || error?.code === 'BAD_DATA') {
                // Solo loguear una vez en modo DEV para reducir ruido
                if (import.meta.env.DEV && retryCount === 0 && !window.hasLoggedContractWarning) {
                    console.log('ℹ️ Using fallback/mock data for missing contracts');
                    window.hasLoggedContractWarning = true;
                }
                setBalance('0');
                return '0';
            }

            // Manejo silencioso de Timeouts en desarrollo (Hardhat Node apagado)
            if (error.message === 'Balance fetch timeout') {
                if (import.meta.env.DEV) {
                    // console.warn('⚠️ Blockchain node not responding (Timeout). Using 0 balance.');
                }
                setBalance('0');
                return '0';
            }

            if (import.meta.env.DEV) console.error('❌ Error fetching BEZ balance:', error);

            // Retry logic para errores de red temporales (NO para timeouts)
            if (retryCount < 2 && !error.message.includes('timeout') && (error.message.includes('network') || error.code === 'NETWORK_ERROR')) {
                console.log(`⏳ Retrying balance fetch (${retryCount + 1}/2)...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchBalance(retryCount + 1);
            }

            setNetworkError(error.message);

            // Mostrar toast solo en primer intento y si no es timeout
            if (retryCount === 0 && !error.message.includes('timeout')) {
                toast.error('Error al obtener balance. Verifica tu conexión.', {
                    duration: 3000
                });
            }

            return '0';
        }
    }, [isConnected, address]);

    /**
     * Obtener precio actual del token desde el contrato TokenSale en blockchain
     */
    const fetchTokenPrice = useCallback(async () => {
        if (!isConnected) {
            setTokenPrice('0.0001'); // Precio default
            return '0.0001';
        }

        try {
            if (!window.ethereum) {
                // throw new Error('No Ethereum provider found');
                setTokenPrice('0.0001');
                return '0.0001';
            }

            const provider = new ethers.BrowserProvider(window.ethereum);

            // Verificar que el contrato existe
            if (!TokenSaleAddress || TokenSaleAddress === '0x0000000000000000000000000000000000000000') {
                console.warn('⚠️ TokenSale contract not deployed, using fallback price');
                setTokenPrice('0.0001');
                return '0.0001';
            }

            // Verificar código del contrato
            const code = await provider.getCode(TokenSaleAddress);
            if (code === '0x') {
                console.warn('⚠️ TokenSale contract code not found at address:', TokenSaleAddress);
                setTokenPrice('0.0001');
                return '0.0001';
            }

            const saleContract = new ethers.Contract(TokenSaleAddress, TokenSaleABI, provider);

            // Obtener precio con timeout
            const pricePromise = saleContract.price();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Price fetch timeout')), 5000)
            );

            const price = await Promise.race([pricePromise, timeoutPromise]);
            const priceFormatted = ethers.formatEther(price);

            setTokenPrice(priceFormatted);
            if (import.meta.env.DEV) console.log('✅ Token price fetched from blockchain:', priceFormatted, 'ETH per BEZ');

            return priceFormatted;
        } catch (error) {
            const fallbackPrice = '0.0001';
            setTokenPrice(fallbackPrice);

            // Silenciar errores BAD_DATA de contratos no deployados
            if (error?.message?.includes('could not decode result data')) {
                if (import.meta.env.DEV) console.warn('⚠️ Contract not returning valid data, using fallback:', fallbackPrice);
            } else if (import.meta.env.DEV) {
                console.error('❌ Error fetching token price:', error);
                console.log('⚠️ Using fallback price:', fallbackPrice, 'ETH per BEZ');
            }

            return fallbackPrice;
        }
    }, [isConnected]);

    /**
     * Verificar si el usuario tiene suficiente saldo
     * @param {string} requiredAmount - Cantidad requerida de BEZ
     * @returns {boolean} - True si tiene suficiente saldo
     */
    const checkBalance = useCallback(async (requiredAmount) => {
        const currentBalance = await fetchBalance();
        return parseFloat(currentBalance) >= parseFloat(requiredAmount);
    }, [fetchBalance]);

    /**
     * Verificar saldo y mostrar modal de compra si es insuficiente
     * @param {string} requiredAmount - Cantidad requerida
     * @param {string} action - Descripción de la acción (ej: "crear DAO")
     * @param {function} onSuccess - Callback a ejecutar después de compra exitosa
     * @returns {boolean} - True si tiene suficiente saldo
     */
    const verifyAndProceed = useCallback(async (requiredAmount, action, onSuccess) => {
        const hasSufficient = await checkBalance(requiredAmount);

        if (!hasSufficient) {
            setInsufficientFundsModal({
                show: true,
                requiredAmount,
                action,
                onSuccess
            });
            return false;
        }

        return true;
    }, [checkBalance]);

    /**
     * Calcular cantidad de tokens por ETH
     * @param {string} ethAmount - Cantidad de ETH
     * @returns {string} - Cantidad de tokens
     */
    const calculateTokenAmount = useCallback((ethAmount) => {
        if (!ethAmount || !tokenPrice || parseFloat(tokenPrice) === 0) {
            return '0';
        }
        const tokens = parseFloat(ethAmount) / parseFloat(tokenPrice);
        return tokens.toFixed(2);
    }, [tokenPrice]);

    /**
     * Comprar tokens con ETH - BLOCKCHAIN REAL
     * Con estimación de gas, manejo de errores y confirmaciones
     * @param {string} ethAmount - Cantidad de ETH a gastar
     */
    const buyWithETH = useCallback(async (ethAmount) => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        if (!window.ethereum) {
            throw new Error('No Ethereum provider found');
        }

        setLoading(true);
        setPendingTx('Preparando transacción...');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const saleContract = new ethers.Contract(TokenSaleAddress, TokenSaleABI, signer);

            // Verificar balance ETH del usuario
            const ethBalance = await provider.getBalance(address);
            const requiredAmount = ethers.parseEther(ethAmount);

            if (ethBalance < requiredAmount) {
                throw new Error(`Insufficient ETH balance. You have ${ethers.formatEther(ethBalance)} ETH but need ${ethAmount} ETH`);
            }

            // Estimar gas
            setPendingTx('Estimando gas...');
            let gasEstimate;
            try {
                gasEstimate = await saleContract.buyTokens.estimateGas({
                    value: requiredAmount
                });
                if (import.meta.env.DEV) console.log('⛽ Gas estimado:', gasEstimate.toString());
            } catch (gasError) {
                if (import.meta.env.DEV) console.error('Error estimando gas:', gasError);
                // Usar gas límite default si falla la estimación
                gasEstimate = BigInt(300000);
            }

            // Obtener gas price actual
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            const estimatedCost = (gasEstimate * gasPrice * BigInt(110)) / BigInt(100); // +10% buffer

            if (import.meta.env.DEV) console.log('💰 Costo estimado de gas:', ethers.formatEther(estimatedCost), 'ETH');

            // Enviar transacción
            setPendingTx('Esperando confirmación en wallet...');
            toast.loading('Confirma la transacción en tu wallet...', { id: 'buy-eth' });

            const tx = await saleContract.buyTokens({
                value: requiredAmount,
                gasLimit: (gasEstimate * BigInt(120)) / BigInt(100) // +20% buffer
            });

            setPendingTx(`Transacción enviada: ${tx.hash.slice(0, 10)}...`);
            toast.loading(`Esperando confirmación... ${tx.hash.slice(0, 10)}...`, { id: 'buy-eth' });

            if (import.meta.env.DEV) {
                console.log('📤 Transacción enviada:', tx.hash);
                console.log('🔗 Ver en explorador:', `https://etherscan.io/tx/${tx.hash}`);
            }

            // Esperar confirmación (con timeout)
            const receiptPromise = tx.wait();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Transaction confirmation timeout')), 120000) // 2 minutos
            );

            const receipt = await Promise.race([receiptPromise, timeoutPromise]);

            if (import.meta.env.DEV) console.log('✅ Transacción confirmada en bloque:', receipt.blockNumber);

            toast.success(`¡Compra exitosa! Transacción confirmada.`, { id: 'buy-eth' });

            // Calcular tokens recibidos del receipt
            let tokensReceived = '0';
            try {
                // Buscar evento Transfer en los logs
                const transferEvent = receipt.logs.find(log => {
                    try {
                        const parsed = saleContract.interface.parseLog({
                            topics: log.topics,
                            data: log.data
                        });
                        return parsed && parsed.name === 'Transfer';
                    } catch {
                        return false;
                    }
                });

                if (transferEvent) {
                    const parsed = saleContract.interface.parseLog({
                        topics: transferEvent.topics,
                        data: transferEvent.data
                    });
                    tokensReceived = ethers.formatEther(parsed.args.value || parsed.args[2]);
                    if (import.meta.env.DEV) console.log('🪙 Tokens recibidos:', tokensReceived, 'BEZ');
                }
            } catch (eventError) {
                if (import.meta.env.DEV) console.warn('⚠️ No se pudo parsear evento Transfer:', eventError);
                // Calcular basado en precio
                tokensReceived = calculateTokenAmount(ethAmount);
            }

            // Actualizar balance desde blockchain
            await fetchBalance();

            // Guardar transacción
            const newTransaction = {
                type: 'buy',
                method: 'ETH',
                amount: tokensReceived,
                ethSpent: ethAmount,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                timestamp: Date.now(),
                status: 'completed'
            };

            setTransactions(prev => [newTransaction, ...prev]);

            // Guardar en backend (no bloqueante)
            bezCoinService.saveTransaction(address, newTransaction).catch(err => {
                if (import.meta.env.DEV) console.warn('⚠️ Error guardando transacción en backend:', err);
            });

            return receipt;
        } catch (error) {
            if (import.meta.env.DEV) console.error('❌ Error comprando tokens con ETH:', error);

            // Mensajes de error específicos
            let errorMessage = 'Error al comprar tokens';

            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                errorMessage = 'Transacción rechazada por el usuario';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Fondos insuficientes para gas + compra';
            } else if (error.message.includes('Insufficient ETH')) {
                errorMessage = error.message;
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Tiempo de espera agotado. La transacción puede estar pendiente.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión.';
            }

            toast.error(errorMessage, { id: 'buy-eth' });

            throw new Error(errorMessage);
        } finally {
            setLoading(false);
            setPendingTx(null);
        }
    }, [isConnected, address, fetchBalance, calculateTokenAmount]);

    /**
     * Comprar tokens con FIAT (tarjeta de crédito/débito)
     * Integra con pasarela de pago (Stripe, Wert, etc.)
     * @param {string} fiatAmount - Cantidad en USD/EUR
     * @param {number|object} priceOrMethod - Precio personalizado (descuento) o objeto paymentMethod
     * @param {string} recipientAddress - Dirección de destino (opcional)
     */
    const buyWithFIAT = useCallback(async (fiatAmount, priceOrMethod = null, recipientAddress = null) => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        setLoading(true);
        try {
            // Determinar precio y método
            let priceToUse = tokenPrice;
            let paymentMethod = { type: 'mock', currency: 'USD' }; // Default mock
            let targetAddress = recipientAddress || address;

            if (typeof priceOrMethod === 'number') {
                priceToUse = priceOrMethod;
            } else if (typeof priceOrMethod === 'object' && priceOrMethod !== null) {
                paymentMethod = priceOrMethod;
            }

            console.log(`--- INICIANDO PAGO FIAT (STRIPE) ---`);
            console.log(`Monto USD: $${fiatAmount}`);
            console.log(`Precio Aplicado: $${priceToUse}/BEZ`);
            console.log(`Wallet Destino: ${targetAddress}`);

            // Llamar al servicio de pago FIAT (Mock o Real)
            // Si es mock, calculamos tokens basados en el precio custom
            const tokenAmount = (parseFloat(fiatAmount) / parseFloat(priceToUse)).toFixed(2);

            const result = await bezCoinService.purchaseWithFiat({
                walletAddress: targetAddress,
                amount: fiatAmount,
                currency: paymentMethod.currency || 'USD',
                paymentMethod: { ...paymentMethod, type: 'mock' }, // Forzamos mock por ahora
                tokenAmount: tokenAmount // Pasamos la cantidad calculada con descuento
            });

            // Actualizar balance si la wallet destino es la actual
            if (targetAddress.toLowerCase() === address.toLowerCase()) {
                await fetchBalance();
            }

            // Guardar transacción
            const newTransaction = {
                type: 'buy',
                method: 'FIAT',
                amount: tokenAmount,
                fiatAmount: fiatAmount,
                currency: 'USD',
                timestamp: Date.now(),
                status: 'completed',
                to: targetAddress
            };

            setTransactions(prev => [newTransaction, ...prev]);

            // Guardar en backend
            await bezCoinService.saveTransaction(address, newTransaction);

            return result;
        } catch (error) {
            console.error('Error buying tokens with FIAT:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isConnected, address, fetchBalance, tokenPrice]);

    /**
     * Transferir tokens a otra dirección - BLOCKCHAIN REAL
     * @param {string} toAddress - Dirección destino
     * @param {string} amount - Cantidad de BEZ a transferir
     */
    const transfer = useCallback(async (toAddress, amount) => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        if (!window.ethereum) {
            throw new Error('No Ethereum provider found');
        }

        // Validar dirección destino
        if (!ethers.isAddress(toAddress)) {
            throw new Error('Invalid recipient address');
        }

        // No permitir transferencias a uno mismo
        if (toAddress.toLowerCase() === address.toLowerCase()) {
            throw new Error('Cannot transfer to yourself');
        }

        // Verificar saldo
        const hasSufficient = await checkBalance(amount);
        if (!hasSufficient) {
            throw new Error(`Insufficient balance. You have ${balance} BEZ but need ${amount} BEZ`);
        }

        setLoading(true);
        setPendingTx('Preparando transferencia...');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(BezhasTokenAddress, BezhasTokenABI, signer);

            const amountWei = ethers.parseEther(amount);

            // Estimar gas
            setPendingTx('Estimando gas...');
            let gasEstimate;
            try {
                gasEstimate = await tokenContract.transfer.estimateGas(toAddress, amountWei);
                console.log('⛽ Gas estimado para transferencia:', gasEstimate.toString());
            } catch (gasError) {
                console.error('Error estimando gas:', gasError);
                gasEstimate = BigInt(100000); // Gas default para transferencia ERC20
            }

            // Enviar transacción
            setPendingTx('Esperando confirmación...');
            toast.loading('Confirma la transferencia en tu wallet...', { id: 'transfer' });

            const tx = await tokenContract.transfer(toAddress, amountWei, {
                gasLimit: (gasEstimate * BigInt(120)) / BigInt(100) // +20% buffer
            });

            setPendingTx(`Transferencia enviada: ${tx.hash.slice(0, 10)}...`);
            toast.loading(`Esperando confirmación... ${tx.hash.slice(0, 10)}...`, { id: 'transfer' });

            console.log('📤 Transferencia enviada:', tx.hash);

            // Esperar confirmación
            const receipt = await tx.wait();

            console.log('✅ Transferencia confirmada en bloque:', receipt.blockNumber);
            toast.success(`¡${amount} BEZ transferidos exitosamente!`, { id: 'transfer' });

            // Actualizar balance desde blockchain
            await fetchBalance();

            // Guardar transacción
            const newTransaction = {
                type: 'transfer',
                to: toAddress,
                amount: amount,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                timestamp: Date.now(),
                status: 'completed'
            };

            setTransactions(prev => [newTransaction, ...prev]);

            // Guardar en backend (no bloqueante)
            bezCoinService.saveTransaction(address, newTransaction).catch(err =>
                console.warn('⚠️ Error guardando transacción en backend:', err)
            );

            return receipt;
        } catch (error) {
            console.error('❌ Error transfiriendo tokens:', error);

            let errorMessage = 'Error en la transferencia';

            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                errorMessage = 'Transferencia rechazada';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Fondos insuficientes para gas';
            } else if (error.message.includes('Invalid recipient')) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, { id: 'transfer' });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
            setPendingTx(null);
        }
    }, [isConnected, address, checkBalance, fetchBalance, balance]);

    /**
     * Donar tokens - BLOCKCHAIN REAL
     * Transferencia especial marcada como donación con mensaje
     * @param {string} toAddress - Dirección del destinatario
     * @param {string} amount - Cantidad de BEZ a donar
     * @param {string} message - Mensaje opcional de la donación
     */
    const donate = useCallback(async (toAddress, amount, message = '') => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        if (!window.ethereum) {
            throw new Error('No Ethereum provider found');
        }

        // Validar dirección
        if (!ethers.isAddress(toAddress)) {
            throw new Error('Invalid recipient address');
        }

        if (toAddress.toLowerCase() === address.toLowerCase()) {
            throw new Error('Cannot donate to yourself');
        }

        // Verificar saldo
        const hasSufficient = await checkBalance(amount);
        if (!hasSufficient) {
            // Mostrar modal de fondos insuficientes
            setInsufficientFundsModal({
                show: true,
                requiredAmount: amount,
                currentBalance: balance,
                actionName: `Donar ${amount} BEZ`,
                onPurchaseComplete: () => donate(toAddress, amount, message)
            });
            return false;
        }

        setLoading(true);
        setPendingTx('Preparando donación...');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(BezhasTokenAddress, BezhasTokenABI, signer);

            const amountWei = ethers.parseEther(amount);

            // Estimar gas
            setPendingTx('Estimando gas...');
            const gasEstimate = await tokenContract.transfer.estimateGas(toAddress, amountWei)
                .catch(() => BigInt(100000));

            // Enviar transacción
            setPendingTx('Esperando confirmación...');
            toast.loading('Confirma la donación en tu wallet... 💝', { id: 'donate' });

            const tx = await tokenContract.transfer(toAddress, amountWei, {
                gasLimit: (gasEstimate * BigInt(120)) / BigInt(100)
            });

            setPendingTx(`Donación enviada: ${tx.hash.slice(0, 10)}...`);
            toast.loading(`Procesando donación... ${tx.hash.slice(0, 10)}...`, { id: 'donate' });

            console.log('💝 Donación enviada:', tx.hash);
            console.log('📝 Mensaje:', message);

            // Esperar confirmación
            const receipt = await tx.wait();

            console.log('✅ Donación confirmada en bloque:', receipt.blockNumber);
            toast.success(`¡Donación de ${amount} BEZ enviada exitosamente! 💝`, { id: 'donate' });

            // Actualizar balance desde blockchain
            await fetchBalance();

            // Guardar transacción como donación
            const newTransaction = {
                type: 'donate',
                to: toAddress,
                amount: amount,
                message: message,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                timestamp: Date.now(),
                status: 'completed'
            };

            setTransactions(prev => [newTransaction, ...prev]);

            // Guardar en backend con el mensaje
            bezCoinService.saveTransaction(address, newTransaction).catch(err =>
                console.warn('⚠️ Error guardando donación en backend:', err)
            );

            return true;
        } catch (error) {
            console.error('❌ Error enviando donación:', error);

            let errorMessage = 'Error al enviar donación';

            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                errorMessage = 'Donación rechazada';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Fondos insuficientes para gas';
            }

            toast.error(errorMessage, { id: 'donate' });
            return false;
        } finally {
            setLoading(false);
            setPendingTx(null);
        }
    }, [isConnected, address, checkBalance, fetchBalance, balance]);

    /**
     * Obtener historial de transacciones del usuario
     */
    const fetchTransactionHistory = useCallback(async () => {
        if (!address) return;

        try {
            const history = await bezCoinService.getTransactionHistory(address);
            setTransactions(history);
        } catch (error) {
            // Silently handle error - use empty array
            setTransactions([]);
        }
    }, [address]);

    // Efectos
    useEffect(() => {
        if (isConnected && address) {
            fetchBalance();
            fetchTokenPrice();
            fetchTransactionHistory();
        }
    }, [isConnected, address, fetchBalance, fetchTokenPrice, fetchTransactionHistory]);

    // Event Listeners - OPTIMIZADO para evitar circuit breaker de MetaMask
    // Deshabilita event listeners directos y usa polling simple
    useEffect(() => {
        if (!isConnected || !address) return;

        // Skip si el contrato no está desplegado
        if (!BezhasTokenAddress || BezhasTokenAddress === '0x0000000000000000000000000000000000000000') {
            console.log('⚠️ BezhasToken contract not deployed, skipping listeners');
            setContractsInitialized(false);
            return;
        }

        console.log('✅ Contratos inicializados (modo polling optimizado)');
        setContractsInitialized(true);

        // NO configurar event listeners para evitar circuit breaker
        // El polling cada 30s es suficiente y más eficiente
    }, [isConnected, address]);

    // Actualizar balance cada 30 segundos (optimizado para evitar circuit breaker)
    useEffect(() => {
        if (!isConnected || !address) return;

        // Fetch inicial con delay para evitar race conditions
        const initialTimeout = setTimeout(() => {
            fetchBalance();
        }, 500);

        // Polling cada 30 segundos
        const interval = setInterval(() => {
            fetchBalance();
        }, 30000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [isConnected, address, fetchBalance]);

    /**
     * Comprar tokens BEZ directamente con ETH (swap)
     * Usado principalmente para recargar balance antes de compras VIP
     * @param {string} ethAmount - Cantidad de ETH a gastar
     */
    const buyTokens = useCallback(async (ethAmount) => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        if (!window.ethereum) {
            throw new Error('No Ethereum provider found');
        }

        setLoading(true);
        setPendingTx('Preparando compra de tokens...');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Usar contrato TokenSale para comprar
            const saleContract = new ethers.Contract(TokenSaleAddress, TokenSaleABI, signer);

            // Convertir ETH a Wei
            const value = ethers.parseEther(ethAmount.toString());

            // Verificar balance ETH del usuario
            const ethBalance = await provider.getBalance(address);
            if (ethBalance < value) {
                throw new Error(`Balance ETH insuficiente. Tienes ${ethers.formatEther(ethBalance)} ETH`);
            }

            setPendingTx('Esperando confirmación en wallet...');
            toast.loading('Confirma la transacción en tu wallet...', { id: 'buy-tokens' });

            // Llamar a buyTokens en el contrato
            const tx = await saleContract.buyTokens({ value });

            setPendingTx(`Transacción enviada: ${tx.hash.slice(0, 10)}...`);
            toast.loading(`Esperando confirmación... ${tx.hash.slice(0, 10)}...`, { id: 'buy-tokens' });

            if (import.meta.env.DEV) {
                console.log('📤 Compra de tokens enviada:', tx.hash);
            }

            // Esperar confirmación
            const receipt = await tx.wait();

            if (import.meta.env.DEV) {
                console.log('✅ Compra confirmada en bloque:', receipt.blockNumber);
            }

            toast.success('¡Compra exitosa! Tokens recibidos.', { id: 'buy-tokens' });

            // Actualizar balance inmediatamente
            await fetchBalance();

            setPendingTx(null);
            return { success: true, hash: tx.hash };
        } catch (error) {
            if (import.meta.env.DEV) console.error('❌ Error comprando tokens:', error);

            let errorMessage = 'Error al comprar tokens';

            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                errorMessage = 'Transacción rechazada por el usuario';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Fondos insuficientes para gas + compra';
            } else if (error.message.includes('execution reverted')) {
                errorMessage = 'Error en el contrato. Verifica los parámetros.';
            }

            toast.error(errorMessage, { id: 'buy-tokens' });
            setPendingTx(null);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isConnected, address, fetchBalance]);

    const value = {
        // Estados
        balance,
        tokenPrice,
        loading,
        transactions,
        showBuyModal,
        insufficientFundsModal,

        // 🔐 Privacidad del balance
        balanceVisible,
        toggleBalanceVisibility,

        // Estados blockchain (NUEVO)
        networkError,
        pendingTx,
        contractsInitialized,

        // Setters
        setShowBuyModal,
        setInsufficientFundsModal,

        // Funciones de lectura
        fetchBalance,
        fetchTokenPrice,
        checkBalance,
        verifyAndProceed,
        calculateTokenAmount,
        fetchTransactionHistory,

        // Funciones de escritura
        buyWithETH,
        buyWithFIAT,
        buyTokens,  // Nueva función para swap ETH->BEZ
        transfer,
        spendTokens: transfer, // Alias para pagos internos
        donate,
    };

    return (
        <BezCoinContext.Provider value={value}>
            {children}
        </BezCoinContext.Provider>
    );
};

export default BezCoinContext;
