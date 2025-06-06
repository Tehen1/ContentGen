// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FixieEconomy is ERC20 {
    uint256 public lastBurnTime;
    
    constructor() ERC20("FixieToken", "FIXIE") {
        lastBurnTime = block.timestamp;
    }
    
    function _calculateDynamicBurn(uint256 transactionSize) internal view returns (uint256) {
        return transactionSize * (block.timestamp - lastBurnTime) / (1 days);
    }
}
