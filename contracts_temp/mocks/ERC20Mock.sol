// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mock
 * @notice Mock ERC20 token para desarrollo y testing
 * @dev Permite mint ilimitado para facilitar pruebas
 */
contract ERC20Mock is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) ERC20(name, symbol) {
        _mint(initialAccount, initialBalance);
    }

    /**
     * @notice Permite a cualquiera mintear tokens (solo para testing)
     */
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    /**
     * @notice Burn tokens de cualquier cuenta (solo para testing)
     */
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}
