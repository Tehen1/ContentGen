// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FixieToken
 * @dev Token ERC20 pour FixieRun
 */
contract FixieToken is ERC20Burnable, Ownable {
    uint8 private _decimals = 18;
    uint256 private _cap = 100000000 * 10 ** uint256(_decimals); // 100 millions de tokens

    constructor() ERC20("FixieRun Token", "FIXIE") Ownable(msg.sender) {
        // Initial mint to owner
        _mint(owner(), 10000000 * 10 ** uint256(_decimals)); // 10 millions initialement
    }

    /**
     * @dev Return the decimals places of the token.
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev See {ERC20-_mint}.
     */
    function mint(address account, uint256 amount) public onlyOwner {
        require(ERC20.totalSupply() + amount <= _cap, "FixieToken: cap exceeded");
        _mint(account, amount);
    }

    /**
     * @dev Returns the cap on the token's total supply.
     */
    function cap() public view returns (uint256) {
        return _cap;
    }
} 