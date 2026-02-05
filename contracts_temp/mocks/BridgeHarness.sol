// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../BezhasBridge.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

contract BridgeHarness is BezhasBridge {
    constructor(address router, address token) BezhasBridge(router, token) {}

    function harnessReceive(Client.Any2EVMMessage memory message) external {
        _ccipReceive(message);
    }
}
