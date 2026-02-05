/**
 * Script de Prueba ToolBEZ™ Enterprise
 * Prueba todos los endpoints del sistema BaaS
 */

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ENT_WALMART_2026'; // API Key empresarial demo

console.log('🚀 Iniciando pruebas de ToolBEZ™ Enterprise...\n');

// Función auxiliar para hacer peticiones
async function testEndpoint(name, method, endpoint, data = null, headers = {}) {
    console.log(`\n📡 Probando: ${name}`);
    console.log(`   Endpoint: ${method} ${endpoint}`);

    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (response.ok) {
            console.log(`   ✅ Status: ${response.status} OK`);
            console.log(`   📦 Respuesta:`, JSON.stringify(result, null, 2).substring(0, 500));
            return { success: true, data: result };
        } else {
            console.log(`   ❌ Status: ${response.status} ERROR`);
            console.log(`   ⚠️  Error:`, result.error || result.message);
            return { success: false, error: result };
        }
    } catch (error) {
        console.log(`   ❌ Error de red:`, error.message);
        return { success: false, error: error.message };
    }
}

// Función principal de pruebas
async function runTests() {
    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };

    console.log('═'.repeat(60));
    console.log('  TEST 1: Verificar Backend activo');
    console.log('═'.repeat(60));

    const healthCheck = await testEndpoint(
        'Health Check',
        'GET',
        '/api/health'
    );
    results.total++;
    if (healthCheck.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 2: Autenticación - Registro Email');
    console.log('═'.repeat(60));

    const registerEmail = await testEndpoint(
        'Registro con Email',
        'POST',
        '/api/auth/register-email',
        {
            email: `test_${Date.now()}@example.com`,
            password: 'Test123456',
            username: 'Usuario Test',
            referralCode: ''
        }
    );
    results.total++;
    if (registerEmail.success) results.passed++;
    else results.failed++;

    // Guardar token para futuras peticiones
    const authToken = registerEmail.data?.token;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 3: Autenticación - Login Email');
    console.log('═'.repeat(60));

    const loginEmail = await testEndpoint(
        'Login con Email',
        'POST',
        '/api/auth/login-email',
        {
            email: 'test@example.com',
            password: 'Test123456'
        }
    );
    results.total++;
    if (loginEmail.success || loginEmail.error?.error === 'Credenciales inválidas') {
        results.passed++; // Esperamos error si no existe
    } else {
        results.failed++;
    }

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 4: ToolBEZ - Registrar Datos IoT');
    console.log('═'.repeat(60));

    const iotIngest = await testEndpoint(
        'IoT Data Ingest',
        'POST',
        '/api/oracle/toolbez/iot-ingest',
        {
            productId: `TEST_PRODUCT_${Date.now()}`,
            sensorData: {
                temperature: 4.2,
                humidity: 65,
                location: 'Warehouse Madrid'
            },
            metadata: {
                deviceId: 'SENSOR_TEST_001'
            }
        },
        { 'x-api-key': API_KEY }
    );
    results.total++;
    if (iotIngest.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 5: ToolBEZ - Batch Multi-Task');
    console.log('═'.repeat(60));

    const batchOperations = await testEndpoint(
        'Batch Operations (MTT)',
        'POST',
        '/api/oracle/toolbez/batch',
        {
            operations: [
                {
                    productId: `BATCH_ITEM_1_${Date.now()}`,
                    sensorData: { temperature: 3.8, location: 'Warehouse A' },
                    metadata: { deviceId: 'SENSOR_001' }
                },
                {
                    productId: `BATCH_ITEM_2_${Date.now()}`,
                    sensorData: { temperature: 4.1, location: 'Warehouse B' },
                    metadata: { deviceId: 'SENSOR_002' }
                },
                {
                    productId: `BATCH_ITEM_3_${Date.now()}`,
                    sensorData: { temperature: 3.9, location: 'Warehouse C' },
                    metadata: { deviceId: 'SENSOR_003' }
                }
            ]
        },
        { 'x-api-key': API_KEY }
    );
    results.total++;
    if (batchOperations.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 6: ToolBEZ - Verificar Producto (Público)');
    console.log('═'.repeat(60));

    const verifyProduct = await testEndpoint(
        'Verificar Producto',
        'GET',
        '/api/oracle/toolbez/verify/PROD_12345'
    );
    results.total++;
    if (verifyProduct.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 7: ToolBEZ - Estadísticas Empresariales');
    console.log('═'.repeat(60));

    const enterpriseStats = await testEndpoint(
        'Enterprise Stats',
        'GET',
        '/api/oracle/toolbez/stats',
        null,
        { 'x-api-key': API_KEY }
    );
    results.total++;
    if (enterpriseStats.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 8: Oracle - Obtener Prices');
    console.log('═'.repeat(60));

    const oraclePrices = await testEndpoint(
        'Oracle Prices',
        'GET',
        '/api/oracle/prices'
    );
    results.total++;
    if (oraclePrices.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 9: Oracle - Obtener Feeds');
    console.log('═'.repeat(60));

    const oracleFeeds = await testEndpoint(
        'Oracle Feeds',
        'GET',
        '/api/oracle/feeds'
    );
    results.total++;
    if (oracleFeeds.success) results.passed++;
    else results.failed++;

    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  TEST 10: ToolBEZ - API Key Inválida');
    console.log('═'.repeat(60));

    const invalidApiKey = await testEndpoint(
        'API Key Inválida (debe fallar)',
        'POST',
        '/api/oracle/toolbez/iot-ingest',
        {
            productId: 'TEST',
            sensorData: { temperature: 4.2 }
        },
        { 'x-api-key': 'INVALID_KEY' }
    );
    results.total++;
    if (!invalidApiKey.success) results.passed++; // Esperamos que falle
    else results.failed++;

    // Resumen de resultados
    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('  RESUMEN DE PRUEBAS');
    console.log('═'.repeat(60));
    console.log(`\n  Total de pruebas: ${results.total}`);
    console.log(`  ✅ Exitosas: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
    console.log(`  ❌ Fallidas: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);

    if (results.failed === 0) {
        console.log('\n  🎉 ¡Todos los tests pasaron exitosamente!');
    } else {
        console.log('\n  ⚠️  Algunos tests fallaron. Revisa los logs arriba.');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('  RECOMENDACIONES');
    console.log('═'.repeat(60));
    console.log('\n  1. Asegúrate de que el backend esté corriendo en http://localhost:3001');
    console.log('  2. Verifica que MongoDB esté activo (si usas base de datos real)');
    console.log('  3. Confirma que RELAYER_PRIVATE_KEY esté en el .env');
    console.log('  4. Revisa los logs del backend para más detalles de errores');
    console.log('\n  💡 Usa este comando para ver logs del backend:');
    console.log('     cd backend && node server.js\n');
}

// Ejecutar pruebas
runTests().catch(console.error);
