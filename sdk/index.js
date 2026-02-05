/**
 * BeZhas Enterprise SDK Entry Point
 * 
 * Exports the universal client for use in Node.js and modern bundlers.
 * For browser CDN usage, this file is bundled via Webpack.
 */

const BeZhasUniversal = require('./bezhas-universal');

// Export Main Class
// Allows: import { BeZhas } from '@bezhas/sdk'
class BeZhas extends BeZhasUniversal {
    constructor(config) {
        super(config);
    }
}

// Named exports for specific modules if needed
const { RealEstateModule } = require('./modules/RealEstateModule');
const { HealthcareModule } = require('./modules/HealthcareModule');
const { AutomotiveModule } = require('./modules/AutomotiveModule');
const { ManufacturingModule } = require('./modules/ManufacturingModule');
const { EnergyModule } = require('./modules/EnergyModule');
const { AgricultureModule } = require('./modules/AgricultureModule');

// Smart Contracts Export
const contractsModule = require('./contracts');

module.exports = {
    BeZhas,
    BeZhasUniversal, // alias

    // Direct module access usually not needed but kept for advanced usage
    modules: {
        RealEstateModule,
        HealthcareModule,
        AutomotiveModule,
        ManufacturingModule,
        EnergyModule,
        AgricultureModule
    },

    // Smart Contracts ABIs & Addresses
    // Usage: const { getContract } = require('@bezhas/sdk');
    //        const dao = getContract('GovernanceSystem', 'amoy');
    contracts: contractsModule.contracts,
    addresses: contractsModule.addresses,
    getContract: contractsModule.getContract,
    getAddresses: contractsModule.getAddresses,
    getABI: contractsModule.getABI,
    listContracts: contractsModule.listContracts,
    isDeployed: contractsModule.isDeployed,
};
