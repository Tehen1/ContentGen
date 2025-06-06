// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Conversion sécurisée entre types
 */
library SafeCast {
    function toUint256(int256 value) internal pure returns (uint256) {
        require(value >= 0, "SafeCast: value must be positive");
        return uint256(value);
    }

    function toInt256(uint256 value) internal pure returns (int256) {
        require(value <= uint256(type(int256).max), "SafeCast: value exceeds int256 max");
        return int256(value);
    }
} 