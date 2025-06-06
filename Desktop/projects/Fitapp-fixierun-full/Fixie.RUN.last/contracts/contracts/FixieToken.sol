// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FixieToken
 * @dev ERC20 token for the Fixie.RUN platform
 */
contract FixieToken is ERC20, ERC20Burnable, Ownable {
    // Maximum supply of tokens
    uint256 public immutable maxSupply;
    
    // Address of the reward distributor contract
    address public rewardDistributor;
    
    // Mapping to track authorized minters
    mapping(address => bool) public authorizedMinters;
    
    /**
     * @dev Constructor
     * @param initialSupply Initial supply of tokens
     * @param maximumSupply Maximum supply of tokens
     * @param admin Admin address
     */
    constructor(
        uint256 initialSupply,
        uint256 maximumSupply,
        address admin
    ) ERC20("Fixie Token", "FIX") Ownable(admin) {
        require(initialSupply <= maximumSupply, "Initial supply exceeds maximum supply");
        
        maxSupply = maximumSupply;
        
        // Mint initial supply to the admin
        _mint(admin, initialSupply * 10**decimals());
    }
    
    /**
     * @dev Set the reward distributor address
     * @param _rewardDistributor Address of the reward distributor
     */
    function setRewardDistributor(address _rewardDistributor) external onlyOwner {
        rewardDistributor = _rewardDistributor;
        
        // Authorize the reward distributor as a minter
        authorizedMinters[_rewardDistributor] = true;
        
        emit RewardDistributorUpdated(_rewardDistributor);
    }
    
    /**
     * @dev Add an authorized minter
     * @param minter Address to authorize
     */
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove an authorized minter
     * @param minter Address to remove
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint new tokens
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        // Check if the caller is authorized to mint
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        
        // Check if the mint would exceed the maximum supply
        require(totalSupply() + amount <= maxSupply, "Exceeds maximum supply");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Override the decimals function to return 18
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    // Events
    event RewardDistributorUpdated(address indexed rewardDistributor);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
}
