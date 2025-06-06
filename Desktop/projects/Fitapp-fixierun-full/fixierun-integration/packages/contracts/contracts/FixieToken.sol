// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FixieToken is ERC20Capped, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Maximum supply: 1 billion tokens
    uint256 private constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Events
    event RewardDistributed(address indexed user, uint256 amount, string reason);
    
    constructor() ERC20("Fixierun Token", "FIXIE") ERC20Capped(MAX_SUPPLY) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        
        // Mint initial supply to deployer (10% of max supply)
        _mint(msg.sender, MAX_SUPPLY / 10);
    }
    
    /**
     * @dev Mint new tokens to an address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from an address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
    
    /**
     * @dev Distribute rewards to a user
     * @param user Address of the user to reward
     * @param amount Amount of tokens to reward
     * @param reason Reason for the reward
     */
    function distributeReward(address user, uint256 amount, string memory reason) external onlyRole(MINTER_ROLE) {
        _mint(user, amount);
        emit RewardDistributed(user, amount, reason);
    }
    
    /**
     * @dev Add a new minter
     * @param minter Address of the new minter
     */
    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
    
    /**
     * @dev Remove a minter
     * @param minter Address of the minter to remove
     */
    function removeMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }
    
    /**
     * @dev Add a new burner
     * @param burner Address of the new burner
     */
    function addBurner(address burner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(BURNER_ROLE, burner);
    }
    
    /**
     * @dev Remove a burner
     * @param burner Address of the burner to remove
     */
    function removeBurner(address burner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(BURNER_ROLE, burner);
    }
}
