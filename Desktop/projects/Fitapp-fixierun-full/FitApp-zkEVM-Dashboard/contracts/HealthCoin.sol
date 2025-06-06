// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HealthCoin
 * @dev ERC20 token for rewarding fitness achievements
 */
contract HealthCoin is ERC20, ERC20Burnable, Ownable {
    // Address of the authorized minter (this will be the ProfileManager contract)
    address public minter;

    // Event emitted when a new minter is set
    event MinterUpdated(address indexed previousMinter, address indexed newMinter);
    
    // Event emitted when tokens are minted for a fitness achievement
    event RewardMinted(address indexed user, uint256 amount, string achievementType);

    /**
     * @dev Constructor initializes the ERC20 token with name and symbol
     * @param initialOwner The address that will own the contract initially
     */
    constructor(address initialOwner) 
        ERC20("HealthCoin", "HLTH") 
        Ownable(initialOwner) 
    {
        // Initial supply can be minted to the owner if desired
        // _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Set the address that has permission to mint tokens
     * Only the contract owner can call this
     * @param _minter The address of the new minter
     */
    function setMinter(address _minter) external onlyOwner {
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }

    /**
     * @dev Mint tokens as rewards for fitness achievements
     * Only the minter can call this
     * @param to The address receiving the reward
     * @param amount The amount of tokens to mint
     * @param achievementType The type of fitness achievement being rewarded
     */
    function mintReward(address to, uint256 amount, string calldata achievementType) external {
        require(msg.sender == minter, "Only minter can mint rewards");
        _mint(to, amount);
        emit RewardMinted(to, amount, achievementType);
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

