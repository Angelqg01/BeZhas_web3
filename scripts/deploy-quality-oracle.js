// ⚠️ ADVERTENCIA: Este script despliega Quality Oracle en Polygon Mainnet
// El CONTRATO BEZ-COIN OFICIAL ya existe:
// 0xEcBa873B534C54DE2B62acDE232ADCa4369f11A8 (Polygon Mainnet)
//
// Este script solo debe usarse para:
// - Desplegar Quality Oracle/Escrow
// - NO para desplegar BEZ-Coin
//
// Ver: CONTRATO_OFICIAL_BEZ.md

const OFFICIAL_BEZ_CONTRACT = "0xEcBa873B534C54DE2B62acDE232ADCa4369f11A8";

const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("\n🚀 Deploying BeZhas Quality Oracle System to Polygon Mainnet...\n");
    console.log("⚠️  RED DE PRODUCCIÓN - Las transacciones son irreversibles");
    console.log("⚠️  NOTA: Usando contrato BEZ oficial:", OFFICIAL_BEZ_CONTRACT);

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");

    if (balance < hre.ethers.parseEther("0.15")) {
        throw new Error("❌ Balance insuficiente. Necesitas al menos 0.15 MATIC para el despliegue.");
    }

    // Usar contrato BEZ-Coin oficial (NO desplegar nuevo)
    const bezCoinAddress = OFFICIAL_BEZ_CONTRACT;
    console.log("\n1️⃣  Usando BEZ-Coin oficial:", bezCoinAddress);

    // Verificar que el contrato existe
    const bezCoin = await hre.ethers.getContractAt("IERC20", bezCoinAddress);
    try {
        const name = await bezCoin.name();
        const symbol = await bezCoin.symbol();
        console.log(`✅ BEZ-Coin verificado: ${name} (${symbol})`);
    } catch (error) {
        throw new Error("❌ No se pudo conectar al contrato BEZ-Coin. Verifica la dirección y la red.");
    }

    // 2. Deploy Quality Escrow
    console.log("\n2️⃣  Deploying BeZhasQualityEscrow...");
    const QualityEscrow = await hre.ethers.getContractFactory("BeZhasQualityEscrow");
    const escrow = await QualityEscrow.deploy(bezCoinAddress, deployer.address);
    await escrow.waitForDeployment();
    console.log("✅ QualityEscrow deployed to:", escrowAddress);

    // 3. Guardar deployment info
    console.log("\n3️⃣  Guardando información de despliegue...");
    const deployment = {
        network: "polygon-mainnet",
        chainId: 137,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            bezCoin: bezCoinAddress,
            qualityEscrow: escrowAddress
        }
    };

    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
        `${deploymentsDir}/quality-oracle-polygon-mainnet.json`,
        JSON.stringify(deployment, null, 2)
    );
    console.log("✅ Deployment info guardada");

    // 4. Summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(80));
    console.log("\n📋 Contract Addresses:");
    console.log("├─ BezCoin (Token - Oficial):", bezCoinAddress);
    console.log("└─ QualityEscrow:", escrowAddress);

    console.log("\n⚙️  Update your .env files:");
    console.log("\n# Backend .env");
    console.log(`BEZCOIN_ADDRESS=${bezCoinAddress}`);
    console.log(`QUALITY_ESCROW_ADDRESS=${escrowAddress}`);

    console.log("\n# Frontend .env");
    console.log(`VITE_BEZCOIN_ADDRESS=${bezCoinAddress}`);
    console.log(`VITE_QUALITY_ESCROW_ADDRESS=${escrowAddress}`);

    console.log("\n📝 Verification command:");
    console.log(`npx hardhat verify --network polygon ${escrowAddress} ${bezCoinAddress} ${deployer.address}`);

    console.log("\n✨ Próximos pasos:");
    console.log("1. Verificar contrato en PolygonScan");
    console.log("2. Actualizar variables de entorno (backend y frontend)");
    console.log("3. Reiniciar servicios");
    console.log("4. Probar creación de posts con Quality Oracle");
    console.log("\n⚠️  NOTA: El owner del contrato BEZ-Coin debe otorgar permisos si es necesario.");

    console.log("\n" + "=".repeat(80) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
