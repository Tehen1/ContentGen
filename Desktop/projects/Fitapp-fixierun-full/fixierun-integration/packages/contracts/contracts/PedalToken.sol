// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PedalToken is ERC20Votes, Ownable {
    // Events
    event StakingRewardDistributed(address indexed user, uint256 amount);
    
    constructor() ERC20("Pedal Governance Token", "PEDAL") ERC20Permit("Pedal Governance Token") {
        // Mint initial supply to deployer (1 million tokens)
        _mint(msg.sender, 1_000_000 * 10**18);
    }
    
    /**
     * @dev Mint new tokens to an address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Distribute staking rewards
     * @param user Address of the user to reward
     * @param amount Amount of tokens to reward
     */
    function distributeStakingReward(address user, uint256 amount) external onlyOwner {
        _mint(user, amount);
        emit StakingRewardDistributed(user, amount);
    }
    
    /**
     * @dev Required override for _mint in ERC20Votes
     */
    function _mint(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(account, amount);
    }
    
    /**
     * @dev Required override for _burn in ERC20Votes
     */
    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
    
    /**
     * @dev Required override for _afterTokenTransfer in ERC20Votes
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }
}
