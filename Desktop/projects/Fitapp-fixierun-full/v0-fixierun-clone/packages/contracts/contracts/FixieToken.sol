// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title FixieToken
 * @dev ERC20 token for the FixieRun ecosystem with advanced tokenomics
 */
contract FixieToken is ERC20, Ownable, Pausable, ERC20Permit {
    // Total supply: 1 billion tokens
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Allocation percentages
    uint256 public constant USER_REWARDS_ALLOCATION = 40; // 40%
    uint256 public constant DEVELOPMENT_ALLOCATION = 25; // 25%
    uint256 public constant MARKETING_ALLOCATION = 15; // 15%
    uint256 public constant TEAM_ALLOCATION = 10; // 10%
    uint256 public constant COMMUNITY_ALLOCATION = 10; // 10%
    
    // Wallet addresses for different allocations
    address public userRewardsWallet;
    address public developmentWallet;
    address public marketingWallet;
    address public teamWallet;
    address public communityWallet;
    
    // Vesting parameters
    uint256 public immutable vestingStart;
    uint256 public constant VESTING_DURATION = 3 * 365 days; // 3 years
    
    // Minting controls
    mapping(address => bool) public minters;
    uint256 public maxMintPerTransaction = 1_000_000 * 10**18; // 1M tokens
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(
        address _userRewardsWallet,
        address _developmentWallet,
        address _marketingWallet,
        address _teamWallet,
        address _communityWallet
    ) ERC20("FixieToken", "FIXIE") ERC20Permit("FixieToken") {
        require(_userRewardsWallet != address(0), "Invalid user rewards wallet");
        require(_developmentWallet != address(0), "Invalid development wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_communityWallet != address(0), "Invalid community wallet");
        
        userRewardsWallet = _userRewardsWallet;
        developmentWallet = _developmentWallet;
        marketingWallet = _marketingWallet;
        teamWallet = _teamWallet;
        communityWallet = _communityWallet;
        
        vestingStart = block.timestamp;
        
        // Initial token distribution
        _mint(_userRewardsWallet, (TOTAL_SUPPLY * USER_REWARDS_ALLOCATION) / 100);
        _mint(_developmentWallet, (TOTAL_SUPPLY * DEVELOPMENT_ALLOCATION) / 100);
        _mint(_marketingWallet, (TOTAL_SUPPLY * MARKETING_ALLOCATION) / 100);
        _mint(_teamWallet, (TOTAL_SUPPLY * TEAM_ALLOCATION) / 100);
        _mint(_communityWallet, (TOTAL_SUPPLY * COMMUNITY_ALLOCATION) / 100);
    }
    
    /**
     * @dev Mint tokens for rewards and other purposes
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (for transparency)
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyMinter whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount <= maxMintPerTransaction, "Amount exceeds max mint per transaction");
        require(totalSupply() + amount <= TOTAL_SUPPLY * 2, "Cannot exceed 2x total supply"); // Safety cap
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Add a new minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Set maximum mint per transaction
     */
    function setMaxMintPerTransaction(uint256 _maxMint) external onlyOwner {
        maxMintPerTransaction = _maxMint;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Calculate vested amount for team tokens
     */
    function getVestedAmount(uint256 totalAmount) public view returns (uint256) {
        if (block.timestamp < vestingStart) {
            return 0;
        } else if (block.timestamp >= vestingStart + VESTING_DURATION) {
            return totalAmount;
        } else {
            return (totalAmount * (block.timestamp - vestingStart)) / VESTING_DURATION;
        }
    }
}