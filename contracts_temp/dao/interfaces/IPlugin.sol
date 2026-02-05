// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPlugin
 * @notice Interfaz base que todos los plugins deben implementar
 */
interface IPlugin {
    function initialize(address _manager) external;
    function getPluginType() external pure returns (string memory);
    function getVersion() external pure returns (string memory);
}

/**
 * @title ITreasuryPlugin
 * @notice Interfaz para el plugin de Tesorería
 */
interface ITreasuryPlugin is IPlugin {
    function checkRiskExposure() external returns (bool needsRebalance, uint256 currentExposure);
    function executeRebalance(address _targetToken, uint256 _amount) external;
    function releaseFunds(address _to, uint256 _amount, string memory _reason) external;
    function getTotalValue() external view returns (uint256);
    function getAssetComposition() external view returns (
        uint256 nativeTokens,
        uint256 stablecoins,
        uint256 rwa
    );
}

/**
 * @title IGovernancePlugin
 * @notice Interfaz para el plugin de Gobernanza
 */
interface IGovernancePlugin is IPlugin {
    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Queued,
        Executed,
        Canceled,
        Slashed
    }

    function createProposal(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        bool _isOnChain,
        address _targetContract,
        bytes memory _callData
    ) external returns (uint256 proposalId);
    
    function vote(uint256 _proposalId, bool _support, bool _abstain) external;
    function execute(uint256 _proposalId) external;
    function getProposalState(uint256 _proposalId) external view returns (ProposalState);
}

/**
 * @title IHRPlugin
 * @notice Interfaz para el plugin de Recursos Humanos
 */
interface IHRPlugin is IPlugin {
    function createVestingSchedule(
        address _beneficiary,
        uint256 _amount,
        uint256 _cliffDuration,
        uint256 _vestingDuration
    ) external;
    
    function calculateReleasableAmount(address _beneficiary) external view returns (uint256);
    function release() external;
    function submitMilestoneProof(string memory _ipfsHash) external;
    function revokevesting(address _beneficiary) external;
}

/**
 * @title IAdvertisingPlugin
 * @notice Interfaz para el plugin de Publicidad Descentralizada
 */
interface IAdvertisingPlugin is IPlugin {
    function mintAdCard(
        address _publisher,
        string memory _metadata,
        uint256 _impressions
    ) external returns (uint256 tokenId);
    
    function recordImpression(uint256 _tokenId) external;
    function distributeRevenue(uint256 _tokenId, uint256 _amount) external;
    function getAdCardMetrics(uint256 _tokenId) external view returns (
        uint256 impressions,
        uint256 clicks,
        uint256 revenue
    );
}
