#!/usr/bin/env node

/**
 * Script de Testing para Webhook de Stripe
 * Simula un evento de Stripe y valida el flujo completo
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test123';

// Simular evento de Stripe
const mockEvent = {
    id: 'evt_test_webhook_' + Date.now(),
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_' + Date.now(),
            object: 'checkout.session',
            payment_intent: 'pi_test_' + Date.now(),
            payment_status: 'paid',
            amount_total: 10000, // $100.00
            currency: 'usd',
            customer: 'cus_test123',
            customer_details: {
                email: 'test@bezhas.com'
            },
            metadata: {
                walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                type: 'token_purchase',
                userId: '507f1f77bcf86cd799439011'
            }
        }
    }
};

/**
 * Generar firma de Stripe
 */
function generateStripeSignature(payload, secret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    const signedPayload = `${timestamp}.${payloadString}`;

    const signature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    return `t=${timestamp},v1=${signature}`;
}

/**
 * Test 1: Verificar que el backend esté corriendo
 */
async function testBackendHealth() {
    console.log('\n🔍 Test 1: Backend Health Check');
    try {
        const response = await axios.get(`${BASE_URL}/api/payment/health`);
        console.log('✅ Backend respondiendo:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Backend no responde:', error.message);
        return false;
    }
}

/**
 * Test 2: Simular webhook de Stripe
 */
async function testWebhook() {
    console.log('\n🔍 Test 2: Webhook Simulation');
    try {
        const payload = JSON.stringify(mockEvent);
        const signature = generateStripeSignature(mockEvent, WEBHOOK_SECRET);

        console.log('📤 Enviando evento:', mockEvent.type);
        console.log('📦 Payment Amount:', mockEvent.data.object.amount_total / 100, mockEvent.data.object.currency.toUpperCase());
        console.log('💼 Wallet:', mockEvent.data.object.metadata.walletAddress);

        const response = await axios.post(
            `${BASE_URL}/api/payment/webhook`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'stripe-signature': signature
                }
            }
        );

        console.log('✅ Webhook procesado:', response.data);

        // Esperar un momento para que se procese
        await new Promise(resolve => setTimeout(resolve, 2000));

        return true;
    } catch (error) {
        console.error('❌ Error en webhook:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Test 3: Verificar que el pago se registró en MongoDB
 */
async function testPaymentRecord() {
    console.log('\n🔍 Test 3: Payment Record Check');
    try {
        const walletAddress = mockEvent.data.object.metadata.walletAddress;

        const response = await axios.get(
            `${BASE_URL}/api/payment/history/${walletAddress}?limit=1`
        );

        if (response.data.payments && response.data.payments.length > 0) {
            const payment = response.data.payments[0];
            console.log('✅ Pago registrado en MongoDB:');
            console.log('   ID:', payment._id);
            console.log('   Status:', payment.status);
            console.log('   Fiat Amount:', payment.fiatAmount, payment.fiatCurrency);
            console.log('   BEZ Amount:', payment.bezAmount);
            console.log('   TxHash:', payment.txHash || 'Pending...');

            if (payment.status === 'completed' && payment.txHash) {
                console.log('   Explorer:', `https://amoy.polygonscan.com/tx/${payment.txHash}`);
            }

            return true;
        } else {
            console.log('⚠️  No se encontraron pagos para esta wallet');
            return false;
        }
    } catch (error) {
        console.error('❌ Error consultando pagos:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Test 4: Verificar estadísticas
 */
async function testStats() {
    console.log('\n🔍 Test 4: Payment Statistics');
    try {
        const response = await axios.get(`${BASE_URL}/api/payment/stats`);

        console.log('✅ Estadísticas obtenidas:');
        console.log('   Total Payments:', response.data.totalPayments);
        console.log('   By Status:');

        response.data.byStatus.forEach(stat => {
            console.log(`     ${stat._id}: ${stat.count} pagos, ${stat.totalFiat} ${stat._id === 'completed' ? 'procesados' : 'fallidos'}`);
        });

        return true;
    } catch (error) {
        console.error('❌ Error consultando stats:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Test 5: Verificar Hot Wallet status
 */
async function testHotWalletStatus() {
    console.log('\n🔍 Test 5: Hot Wallet Status');
    try {
        const response = await axios.get(`${BASE_URL}/api/fiat/safe-status`);

        console.log('✅ Hot Wallet Status:');
        console.log('   Address:', response.data.hotWalletAddress);
        console.log('   BEZ Balance:', response.data.bezBalance, 'BEZ');
        console.log('   MATIC Balance:', response.data.hotWalletMaticBalance, 'MATIC');
        console.log('   Configured:', response.data.isConfigured ? '✅' : '❌');

        const maticBalance = parseFloat(response.data.hotWalletMaticBalance);
        const bezBalance = parseFloat(response.data.bezBalance);

        if (maticBalance < 0.01) {
            console.log('   ⚠️  ADVERTENCIA: Balance de MATIC bajo (<0.01). Fondear en https://faucet.polygon.technology');
        }

        if (bezBalance < 1000) {
            console.log('   ⚠️  ADVERTENCIA: Balance de BEZ bajo (<1000). Transferir tokens a Hot Wallet.');
        }

        return true;
    } catch (error) {
        console.error('❌ Error consultando Hot Wallet:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 SUITE DE TESTS - WEBHOOK DE STRIPE');
    console.log('='.repeat(80));

    const results = {
        backendHealth: await testBackendHealth(),
        webhook: false,
        paymentRecord: false,
        stats: false,
        hotWallet: await testHotWalletStatus()
    };

    // Solo continuar con webhook si el backend está activo
    if (results.backendHealth) {
        results.webhook = await testWebhook();
        results.paymentRecord = await testPaymentRecord();
        results.stats = await testStats();
    }

    // Resumen
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(80));

    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r).length;

    console.log(`✅ Pasados: ${passed}/${total}`);
    console.log(`❌ Fallidos: ${total - passed}/${total}`);

    if (passed === total) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON! Sistema listo para producción.');
    } else {
        console.log('\n⚠️  Algunos tests fallaron. Revisar logs arriba.');
    }

    console.log('\n💡 PRÓXIMOS PASOS:');
    if (!results.hotWallet || parseFloat(results.hotWalletMaticBalance) < 0.01) {
        console.log('1. Fondear Hot Wallet con MATIC: https://faucet.polygon.technology');
    }
    console.log('2. Realizar pago de prueba con tarjeta de test: 4242 4242 4242 4242');
    console.log('3. Verificar transacción en Polygonscan');
    console.log('4. Configurar webhook en Stripe Dashboard para producción');

    console.log('\n' + '='.repeat(80) + '\n');
}

// Ejecutar
runAllTests().catch(console.error);
