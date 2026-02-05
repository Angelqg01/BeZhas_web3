require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * ⚠️ CONTRATO BEZ-COIN OFICIAL ⚠️
 * 
 * El contrato BEZ-Coin de producción ya está desplegado:
 * 0xEcBa873B534C54DE2B62acDE232ADCa4369f11A8
 * 
 * Network: Polygon Mainnet (ChainID 137)
 * Creator: 0x52Df82920CBAE522880dD7657e43d1A754eD044E
 * Explorer: https://polygonscan.com/address/0xEcBa873B534C54DE2B62acDE232ADCa4369f11A8
 * Deployed: 41 días atrás (Diciembre 2025)
 * 
 * 🚫 NO DESPLEGAR NUEVOS CONTRATOS BEZ-COIN
 * 
 * Ver: CONTRATO_OFICIAL_BEZ.md
 */

// Helper to ensure private key has 0x prefix
const getPrivateKey = () => {
  const key = process.env.PRIVATE_KEY;
  if (!key) return [];
  return [key.startsWith("0x") ? key : `0x${key}`];
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: getPrivateKey(),
      chainId: 11155111,
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: getPrivateKey(),
      chainId: 80002,
      gasPrice: "auto",
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://1rpc.io/matic",
      accounts: getPrivateKey(),
      chainId: 137,
      gasPrice: "auto",
    },
    // Arbitrum Networks
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: getPrivateKey(),
      chainId: 42161,
      gasPrice: "auto",
    },
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: getPrivateKey(),
      chainId: 421614,
      gasPrice: "auto",
    },
    // zkSync Networks
    zkSync: {
      url: process.env.ZKSYNC_RPC_URL || "https://mainnet.era.zksync.io",
      accounts: getPrivateKey(),
      chainId: 324,
      gasPrice: "auto",
    },
    zkSyncSepolia: {
      url: process.env.ZKSYNC_SEPOLIA_RPC_URL || "https://sepolia.era.zksync.dev",
      accounts: getPrivateKey(),
      chainId: 300,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      polygonAmoy: process.env.POLYGONSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: true
  }
};
