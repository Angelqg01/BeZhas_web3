require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
    paths: {
        sources: "./contracts/admin", // Only compile the admin contracts
        tests: "./test",
        cache: "./cache-admin",
        artifacts: "./artifacts-admin"
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
    },
    etherscan: {
        apiKey: {
            polygon: process.env.POLYGONSCAN_API_KEY,
            polygonAmoy: process.env.POLYGONSCAN_API_KEY,
            sepolia: process.env.ETHERSCAN_API_KEY,
        },
    },
};
